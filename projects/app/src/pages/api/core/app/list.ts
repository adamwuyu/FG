import { MongoApp } from '@fastgpt/service/core/app/schema';
import { AppListItemType } from '@fastgpt/global/core/app/type';
import { ApiRequestProps } from '@fastgpt/service/type/next';
import { ParentIdType } from '@fastgpt/global/common/parentFolder/type';
import { parseParentIdInMongo } from '@fastgpt/global/common/parentFolder/utils';
import { AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { AppDefaultPermissionVal } from '@fastgpt/global/support/permission/app/constant';
import { AppPermission } from '@fastgpt/global/support/permission/app/controller';
import { MongoResourcePermission } from '@fastgpt/service/support/permission/schema';
import {
  PerResourceTypeEnum,
  ReadPermissionVal
} from '@fastgpt/global/support/permission/constant';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { replaceRegChars } from '@fastgpt/global/common/string/tools';
import { getGroupsByTmbId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { getOrgIdSetWithParentByTmbId } from '@fastgpt/service/support/permission/org/controllers';
import { addSourceMember } from '@fastgpt/service/support/user/utils';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoTeamTags } from '@fastgpt/service/support/user/team/teamTagsSchema';
import { getProApiClient } from '@fastgpt/service/support/permission/type3ApiHelper';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { NextApiRequest, NextApiResponse } from 'next';

export type ListAppBody = {
  parentId?: ParentIdType;
  type?: AppTypeEnum | AppTypeEnum[];
  getRecentlyChat?: boolean;
  searchKey?: string;
};

/**
 * 应用列表接口 - 类型3接口实现
 * 使用Cookie进行用户认证，并从用户会话获取JWT令牌传递给proApi服务
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    // 获取请求体
    const body = req.body as ListAppBody;

    // 使用type3ApiHelper访问proApi服务
    try {
      // 判断是否需要从proApi获取应用列表
      if (process.env.USE_PRO_API_FOR_APP_LIST === 'true') {
        const proApiClient = getProApiClient(req);

        // 从proApi获取应用列表
        const result = await proApiClient.POST<AppListItemType[]>('/core/app/list', body);

        // 返回从proApi获取的应用列表
        return jsonRes(res, {
          data: result
        });
      }
    } catch (error) {
      console.error('从proApi获取应用列表失败，回退到本地实现', error);
      // 发生错误时，回退到本地实现
    }

    // 本地实现
    // 验证用户权限
    try {
      const {
        teamId,
        tmbId,
        tmb,
        permission: tmbPer
      } = await authUserPer({
        req,
        per: ReadPermissionVal
      });

      // 通过 tmb.userId 查询所属团队，提取团队名称后查询对应的 tag key 数组
      const tmbTeams = await MongoTeamMember.find({ userId: tmb.userId }).populate(
        'teamId',
        'name'
      );
      const tmbTeamNames = tmbTeams.map((item) => item.name);
      // 查询MongoTeamTags中的label为['组1','组2']的记录，并提取其中的key组成新数组['key1','key2']
      const tagKeys = await MongoTeamTags.find({ label: { $in: tmbTeamNames } }).distinct('key');

      // 获取团队所有应用权限
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

      // 获取我的权限
      const myPerList = perList.filter(
        (item) =>
          String(item.tmbId) === String(tmbId) ||
          myGroupMap.has(String(item.groupId)) ||
          myOrgSet.has(String(item.orgId))
      );

      // 构建查询条件
      const findAppsQuery = (() => {
        const { parentId, type, getRecentlyChat, searchKey } = body;

        if (getRecentlyChat) {
          return {
            // get all chat app
            teamId,
            type: { $in: [AppTypeEnum.workflow, AppTypeEnum.simple, AppTypeEnum.plugin] }
          };
        }

        // 根据权限过滤应用，如果不是所有者，只获取我有权限访问的应用
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

      // 设置限制
      const limit = (() => {
        const { getRecentlyChat, searchKey } = body;
        if (getRecentlyChat) return 15;
        if (searchKey) return 20;
        return 1000;
      })();

      // 查询应用
      const myApps = await MongoApp.find(
        findAppsQuery,
        '_id parentId avatar type name intro tmbId updateTime pluginData inheritPermission'
      )
        .sort({
          updateTime: -1
        })
        .limit(limit)
        .lean();

      // 添加应用权限并按读取权限过滤应用
      const formatApps = myApps
        .map((app) => {
          if (!app) return null;

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
        .filter(
          (app): app is NonNullable<typeof app> =>
            app !== null && app._id !== null && app.permission?.hasReadPer
        ); // 过滤掉 null 及无读权限的 app

      // 预处理应用列表，确保数据格式正确
      const preparedApps = formatApps.map((app) => ({
        _id: String(app._id),
        avatar: app.avatar || '',
        type: app.type,
        name: app.name || '',
        intro: app.intro || '',
        permission: app.permission,
        defaultPermission: app.defaultPermission || AppDefaultPermissionVal,
        tmbId: app.tmbId || '',
        updateTime: app.updateTime || new Date()
      }));

      // 使用addSourceMember添加sourceMember属性
      const result = await addSourceMember({
        list: preparedApps
      });

      return jsonRes(res, {
        data: result
      });
    } catch (error: any) {
      // 认证错误，返回403
      if (
        error.message === 'unAuthorization' ||
        error.code === 401 ||
        error.code === 403 ||
        error.message === 'unAuthApiKey'
      ) {
        return jsonRes(res, {
          code: 403,
          statusText: 'unAuthorization',
          message: '用户未登录或权限不足',
          httpStatusCode: 403
        });
      }
      throw error; // 其他错误继续向上传递
    }
  } catch (error: any) {
    console.error('获取应用列表失败', error);

    // 处理其他错误
    return jsonRes(res, {
      code: error.code || 500,
      message: typeof error === 'string' ? error : error.message || '获取应用列表失败',
      httpStatusCode: error.code >= 400 && error.code < 600 ? error.code : 500
    });
  }
}
