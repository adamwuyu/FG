import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import { NextAPI } from '@/service/middleware/entry';
import { MongoResourcePermission } from '@fastgpt/service/support/permission/schema';
import {
  PerResourceTypeEnum,
  ReadPermissionVal
} from '@fastgpt/global/support/permission/constant';
import { AppPermission } from '@fastgpt/global/support/permission/app/controller';
import { ApiRequestProps } from '@fastgpt/service/type/next';
import { ParentIdType } from '@fastgpt/global/common/parentFolder/type';
import { parseParentIdInMongo } from '@fastgpt/global/common/parentFolder/utils';
import { AppFolderTypeList, AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { AppDefaultPermissionVal } from '@fastgpt/global/support/permission/app/constant';
import { authApp } from '@fastgpt/service/support/permission/app/auth';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { replaceRegChars } from '@fastgpt/global/common/string/tools';
import { concatPer } from '@fastgpt/service/support/permission/controller';
import { getGroupsByTmbId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { getOrgIdSetWithParentByTmbId } from '@fastgpt/service/support/permission/org/controllers';
import { addSourceMember } from '@fastgpt/service/support/user/utils';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoTeamTags } from '@fastgpt/service/support/user/team/teamTagsSchema'; // 补丁0021: 引入团队标签模型

export type ListAppBody = {
  parentId?: ParentIdType;
  type?: AppTypeEnum | AppTypeEnum[];
  getRecentlyChat?: boolean;
  searchKey?: string;
};

/*
  补丁0021概述: 通过团队标签重新判断权限
  1. 引入 MongoTeamMember 和 MongoTeamTags 模型
  2. 获取用户所属团队标签
  3. 在权限判断中增加 teamTags 和 tagKeys 的交集判断
*/

async function handler(req: ApiRequestProps<ListAppBody>): Promise<AppListItemType[]> {
  const { parentId, type, getRecentlyChat, searchKey } = req.body;

  // Auth user permission
  const {
    teamId,
    tmbId,
    tmb,
    permission: tmbPer
  } = await authUserPer({
    req,
    authToken: true,
    authApiKey: true,
    per: ReadPermissionVal
  });

  // 通过 tmb.userId 查询所属团队，提取团队名称后查询对应的 tag key 数组
  const tmbTeams = await MongoTeamMember.find({ userId: tmb.userId }).populate('teamId', 'name');
  const tmbTeamNames = tmbTeams.map((item) => item.name);
  // tmbTeamNames的结构是：['组1','组2']
  // 查询MongoTeamTags中的label为['组1','组2']的记录，并提取其中的key组成新数组['key1','key2']
  const tagKeys = await MongoTeamTags.find({ label: { $in: tmbTeamNames } }).distinct('key');

  // Get team all app permissions
  const [perList, myGroupMap, myOrgSet] = await Promise.all([
    MongoResourcePermission.find({
      resourceType: PerResourceTypeEnum.app,
      teamId,
      resourceId: {
        $exists: true
      }
    }).lean(),
    getGroupsByTmbId({
      tmbId,
      teamId
    }).then((item) => {
      const map = new Map<string, 1>();
      item.forEach((item) => {
        map.set(String(item._id), 1);
      });
      return map;
    }),
    getOrgIdSetWithParentByTmbId({
      teamId,
      tmbId
    })
  ]);
  // Get my permissions
  const myPerList = perList.filter(
    (item) =>
      String(item.tmbId) === String(tmbId) ||
      myGroupMap.has(String(item.groupId)) ||
      myOrgSet.has(String(item.orgId))
  );

  const findAppsQuery = (() => {
    if (getRecentlyChat) {
      return {
        // get all chat app
        teamId,
        type: { $in: [AppTypeEnum.workflow, AppTypeEnum.simple, AppTypeEnum.plugin] }
      };
    }

    // Filter apps by permission, if not owner, only get apps that I have permission to access
    const idList = { _id: { $in: myPerList.map((item) => item.resourceId) } };
    const appPerQuery = tmbPer.isOwner
      ? {}
      : parentId
        ? {
            $or: [idList, parseParentIdInMongo(parentId)]
          }
        : { $or: [idList, { parentId: null }] };

    const searchMatch = searchKey
      ? {
          $or: [
            { name: { $regex: new RegExp(`${replaceRegChars(searchKey)}`, 'i') } },
            { intro: { $regex: new RegExp(`${replaceRegChars(searchKey)}`, 'i') } }
          ]
        }
      : {};

    if (searchKey) {
      return {
        ...appPerQuery,
        teamId,
        ...searchMatch
      };
    }

    return {
      ...appPerQuery,
      teamId,
      ...(type && (Array.isArray(type) ? { type: { $in: type } } : { type })),
      ...parseParentIdInMongo(parentId)
    };
  })();
  const limit = (() => {
    if (getRecentlyChat) return 15;
    if (searchKey) return 20;
    return 1000;
  })();

  const myApps = await MongoApp.find(
    findAppsQuery,
    '_id parentId avatar type name intro tmbId updateTime pluginData inheritPermission'
  )
    .sort({
      updateTime: -1
    })
    .limit(limit)
    .lean();

  // Add app permission and filter apps by read permission
  const formatApps = myApps
    .map((app) => {
      const perVal = myPerList.find(
        (item) => String(item.resourceId) === String(app._id)
      )?.permission;
      const isSameTeam = String(app.teamId) === String(teamId); // 检查 teamId 是否相同
      const isRoot = String(tmb.userId) === '67b1312ad9d41c2d4f2b5ce0'; // 检查是否为 root 用户
      let hasOverlap = app.teamTags ? app.teamTags.some((tag) => tagKeys.includes(tag)) : false; // 补丁0021: 检查交集
      if (app.teamTags === null) {
        hasOverlap = isRoot;
      }
      const Per = new AppPermission({
        per: perVal ?? app.defaultPermission,
        isOwner: String(app.tmbId) === tmbId || tmbPer.isOwner
      });
      // 若存在对应的 team tag，则强制赋予读权限
      if (hasOverlap) {
        Per.hasReadPer = true;
      }
      // editor默认组，有hasWritePer
      // @ts-ignore
      if (isSameTeam && tmb.role === 'editor') {
        Per.hasWritePer = true;
      }
      const result = hasOverlap || isSameTeam || isRoot ? { ...app, permission: Per } : null;
      return result;
    })
    .filter((app) => app && app.permission.hasReadPer); // 过滤掉 null 及无读权限的 app

  return formatApps
    .filter((app) => app !== null && app._id !== null)
    .map((app) => ({
      _id: app ? app._id : null,
      avatar: app ? app.avatar : null,
      type: app ? app.type : null,
      name: app ? app.name : null,
      intro: app ? app.intro : null,
      permission: app ? app.permission : null,
      defaultPermission: app ? app.defaultPermission : AppDefaultPermissionVal
    }));
}

export default NextAPI(handler);
