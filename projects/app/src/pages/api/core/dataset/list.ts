import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { NextAPI } from '@/service/middleware/entry';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  const { parentId, type } = req.query as { parentId?: string; type?: DatasetTypeEnum };

  // 凭证校验
  const { teamId, tmbId, permission, teamPer } = await authUserPer({
    req,
    authToken: true,
    authApiKey: true,
    per: ReadPermissionVal
  });

  // 确保 teamPer 存在以供后续权限判断
  if (!teamPer) {
    throw new Error('权限验证失败: 未获取到 teamPer');
  }

  // 禁止 visitor 角色访问
  console.log('teamPer', teamPer);
  if (!teamPer.hasManagePer) {
    throw new Error('无权访问');
  }

  const datasets = await MongoDataset.find({
    ...mongoRPermission({ teamId, tmbId, permission }),
    ...(parentId !== undefined && { parentId: parentId || null }),
    ...(type && { type })
  })
    .sort({ updateTime: -1 })
    .lean();

  const formatDatasets = myDatasets
    .map((dataset) => {
      const { Per, privateDataset } = (() => {
        const getPer = (datasetId: string) => {
          const tmbPer = myPerList.find(
            (item) => String(item.resourceId) === datasetId && !!item.tmbId
          )?.permission;
          const groupPer = concatPer(
            myPerList
              .filter(
                (item) => String(item.resourceId) === datasetId && (!!item.groupId || !!item.orgId)
              )
              .map((item) => item.permission)
          );
          return new DatasetPermission({
            per: tmbPer ?? groupPer ?? DatasetDefaultPermissionVal,
            isOwner: String(dataset.tmbId) === String(tmbId) || teamPer.isOwner
          });
        };
        const getClbCount = (datasetId: string) => {
          return perList.filter((item) => String(item.resourceId) === String(datasetId)).length;
        };

        // inherit
        if (
          dataset.inheritPermission &&
          dataset.parentId &&
          dataset.type !== DatasetTypeEnum.folder
        ) {
          return {
            Per: getPer(String(dataset.parentId)),
            privateDataset: getClbCount(String(dataset.parentId)) <= 1
          };
        }
        return {
          Per: getPer(String(dataset._id)),
          privateDataset:
            dataset.type === DatasetTypeEnum.folder
              ? getClbCount(String(dataset._id)) <= 1
              : getClbCount(String(dataset._id)) === 0
        };
      })();

      return {
        _id: dataset._id,
        avatar: dataset.avatar,
        name: dataset.name,
        intro: dataset.intro,
        type: dataset.type,
        vectorModel: getEmbeddingModel(dataset.vectorModel),
        inheritPermission: dataset.inheritPermission,
        tmbId: dataset.tmbId,
        updateTime: dataset.updateTime,
        permission: Per,
        private: privateDataset
      };
    })
    .filter((app) => app.permission.hasReadPer);

  return addSourceMember({
    list: formatDatasets
  });
}
export default NextAPI(handler);
