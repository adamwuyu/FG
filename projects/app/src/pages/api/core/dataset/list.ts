import { DatasetTypeEnum } from '@fastgpt/global/core/dataset/constants';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { NextAPI } from '@/service/middleware/entry';
import { DatasetPermission } from '@fastgpt/global/support/permission/dataset/controller';
import {
  PerResourceTypeEnum,
  ReadPermissionVal
} from '@fastgpt/global/support/permission/constant';
import { MongoResourcePermission } from '@fastgpt/service/support/permission/schema';
import { DatasetDefaultPermissionVal } from '@fastgpt/global/support/permission/dataset/constant';
import { ParentIdType } from '@fastgpt/global/common/parentFolder/type';
import { parseParentIdInMongo } from '@fastgpt/global/common/parentFolder/utils';
import { ApiRequestProps } from '@fastgpt/service/type/next';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import { replaceRegChars } from '@fastgpt/global/common/string/tools';
import { getGroupsByTmbId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { concatPer } from '@fastgpt/service/support/permission/controller';
import { getOrgIdSetWithParentByTmbId } from '@fastgpt/service/support/permission/org/controllers';
import { addSourceMember } from '@fastgpt/service/support/user/utils';
import { getEmbeddingModel } from '@fastgpt/service/core/ai/model';

export type GetDatasetListBody = {
  parentId: ParentIdType;
  type?: DatasetTypeEnum;
  searchKey?: string;
};

async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  // 凭证校验
  const { teamId, tmbId, permission, tmb } = await authUserPer({
    req,
    authToken: true,
    authApiKey: true,
    per: ReadPermissionVal
  });

  // 禁止 visitor 角色访问
  if (tmb.role === TeamMemberRoleEnum.visitor) {
    return res
      .status(403)
      .json({ error: 'Forbidden: Visitors are not allowed to access this resource.' });
  }

  const queryConditions = {
    ...(await mongoRPermission({ teamId, tmbId, permission })),
    ...(parentId !== undefined && { parentId: parentId || null }),
    ...(type && { type })
  };
  const datasets = await MongoDataset.find(queryConditions).sort({ updateTime: -1 }).lean();

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
