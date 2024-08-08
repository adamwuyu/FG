/* Auth app permission */
import { MongoApp } from '../../../core/app/schema';
import { AppDetailType } from '@fastgpt/global/core/app/type.d';
import { parseHeaderCert } from '../controller';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { AppErrEnum } from '@fastgpt/global/common/error/code/app';
import { getTmbInfoByTmbId } from '../../user/team/controller';
import { getResourcePermission } from '../controller';
import { AppPermission } from '@fastgpt/global/support/permission/app/controller';
import { PermissionValueType } from '@fastgpt/global/support/permission/type';
import { MongoTeamMember } from '../../user/team/teamMemberSchema';
import { MongoTeamTags } from '../../user/team/teamTagsSchema';
import { AppFolderTypeList, AppTypeEnum } from '@fastgpt/global/core/app/constants';
import { AppDefaultPermissionVal } from '@fastgpt/global/support/permission/app/constant';
import { ParentIdType } from '@fastgpt/global/common/parentFolder/type';
import { AuthModeType, AuthResponseType } from '../type';
/*
  注意：若需支持个人插件权限，请单独实现；此处只处理商业（团队）插件权限，
  并增加 tagKeys 判断逻辑。
*/

/*
  补丁0021概述: 增加团队标签权限控制
  1. 增加 MongoTeamMember 和 MongoTeamTags 模型的引入，用于查询用户所属团队标签
  2. 在权限判断时增加 tagKeys 参数，用于检查与 app.teamTags 的交集
  3. 当存在标签交集时(hasOverlap为true)，放宽权限控制
  4. 重构了权限判断逻辑，统一使用 authAppByTmbIdWithTags 作为主要接口
*/

export const authAppByTmbId = async ({
  teamId,
  tmbId,
  appId,
  per,
  isRoot,
  tagKeys, // 新增的可选参数
  userId // 新增的可选参数
}: {
  teamId: string;
  tmbId: string;
  appId: string;
  per: PermissionValueType;
  isRoot?: boolean;
  tagKeys?: string[]; // 可选参数类型为字符串数组
  userId?: string; // 可选参数用户ID用于判断是否是root用户，不容易获取role或者username时，用userId
}) => {
  const { permission: tmbPer } = await getTmbInfoByTmbId({ tmbId });

  const app = await (async () => {
    // get app and per
    var query = {
      $or: [
        { _id: appId, teamId },
        { _id: appId, teamTags: { $in: tagKeys } }
      ]
    };
    // root用户，什么app都允许访问
    if (userId == '67b1312ad9d41c2d4f2b5ce0') {
      // @ts-ignore
      query.$or.push({ _id: appId });
    }
    const [app, rp] = await Promise.all([
      // 保留原来的逻辑，当放松权限：让teamTags（其值是字符串数组）与tagKeys（其值是字符串数组）有相同数组元素的app也被选中
      MongoApp.findOne(query).lean(),
      // MongoApp.findOne({
      //   $or: [
      //     { _id: appId, teamId },
      //     { _id: appId, teamTags: { $in: tagKeys } }
      //   ]
      // }).lean(),
      // MongoApp.findOne({ _id: appId, teamId }).lean(),
      getResourcePermission({
        teamId,
        tmbId,
        resourceId: appId,
        resourceType: PerResourceTypeEnum.app
      })
    ]);

    if (!app) {
      return Promise.reject(AppErrEnum.unExist);
    }

    // 补丁0021: root 用户直接获得所有权限
    if (isRoot) {
      return {
        ...app,
        permission: new AppPermission({ isOwner: true })
      };
    }

    if (String(app.teamId) !== teamId) {
      // 补丁0021: 如果不是同一个团队，检查是否有标签交集
      const hasOverlap = app.teamTags?.some((tag) => tagKeys?.includes(tag)) || false;
      if (!hasOverlap) {
        return Promise.reject(AppErrEnum.unAuthApp);
      }
    }

    const isOwner = tmbPer.isOwner || String(app.tmbId) === tmbId;

    // 补丁0021: 根据继承关系获取权限
    const { Per } = await (async () => {
      if (isOwner) {
        return { Per: new AppPermission({ isOwner: true }) };
      }

      if (
        AppFolderTypeList.includes(app.type) ||
        app.inheritPermission === false ||
        !app.parentId
      ) {
        const rp = await getResourcePermission({
          teamId,
          tmbId,
          resourceId: appId,
          resourceType: PerResourceTypeEnum.app
        });
        const Per = new AppPermission({ per: rp ?? AppDefaultPermissionVal, isOwner });
        return { Per };
      } else {
        // 继承父应用权限
        const { app: parent } = await authAppByTmbId({
          teamId,
          tmbId,
          appId: app.parentId,
          per,
          tagKeys,
          isRoot
        });
        const Per = new AppPermission({
          per: parent.permission.value,
          isOwner
        });
        return { Per };
      }
    })();

    // 补丁0021: 检查权限，如果有标签交集则放宽权限控制
    const hasOverlap = app.teamTags?.some((tag) => tagKeys?.includes(tag)) || false;
    if (!Per.checkPer(per) && !hasOverlap) {
      return Promise.reject(AppErrEnum.unAuthApp);
    }

    return {
      ...app,
      permission: Per
    };
  })();

  return { app };
};

export const authApp = async ({
  appId,
  per,
  ...props
}: AuthModeType & {
  appId: ParentIdType;
  per: PermissionValueType;
}): Promise<AuthResponseType & { app: AppDetailType }> => {
  const result = await parseHeaderCert(props);
  const { teamId, tmbId, userId } = result;

  // 补丁0021: 获取用户所属团队标签
  const tmbTeams = await MongoTeamMember.find({ userId }).populate('teamId', 'name');
  // tmbTeams的结构是：[teamId: { name: '组1' },teamId: { name: '组2' }]，提取其中的name组成新数组['组1','组2']
  // @ts-ignore
  const tmbTeamNames = tmbTeams.map((item) => item.teamId.name);
  const tagKeys = await MongoTeamTags.find({ label: { $in: tmbTeamNames } }).distinct('key');

  // 确保 appId 是 string 类型
  if (typeof appId === 'string') {
    const { app } = await authAppByTmbId({
      teamId,
      tmbId,
      appId, // 这里确保 appId 是 string
      per,
      tagKeys,
      userId
    });
    return {
      ...result,
      permission: app.permission,
      app
    };
  } else {
    // 处理 appId 可能为 undefined 的情况
    throw new Error('appId is required and must be a string');
  }
};
