import { AuthModeType } from '../type';
import { parseHeaderCert } from '../controller';
import { DatasetErrEnum } from '@fastgpt/global/common/error/code/dataset';
import { MongoDataset } from '../../../core/dataset/schema';
import { getCollectionWithDataset } from '../../../core/dataset/controller';
import { PermissionTypeEnum } from '@fastgpt/global/support/permission/constant';
import { TeamMemberRoleEnum } from '@fastgpt/global/support/user/team/constant';
import { AuthResponseType } from '@fastgpt/global/support/permission/type';
import {
  CollectionWithDatasetType,
  DatasetFileSchema,
  DatasetSchemaType
} from '@fastgpt/global/core/dataset/type';
import { getFileById } from '../../../common/file/gridfs/controller';
import { BucketNameEnum } from '@fastgpt/global/common/file/constants';
import { getTmbInfoByTmbId } from '../../user/team/controller';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { MongoDatasetCollection } from '../../../core/dataset/collection/schema';
import { MongoResourcePermission } from '../schema'; // 引入资源权限模型

// Adam：visitor不能访问数据库
export async function authDatasetByTmbId({
  teamId,
  tmbId,
  datasetId,
  per
}: {
  teamId: string;
  tmbId: string;
  datasetId: string;
  per: AuthModeType['per'];
}) {
  const { role } = await getTmbInfoByTmbId({ tmbId });

  const { dataset, isOwner, canWrite } = await (async () => {
    const dataset = await MongoDataset.findOne({ _id: datasetId, teamId }).lean();

    if (!dataset) {
      return Promise.reject(DatasetErrEnum.unAuthDataset);
    }

    // adam：读取resource_permissions表，检查用户是否有权限
    const resourcePermissions = await MongoResourcePermission.find({
      resourceId: datasetId,
      tmbId
    }).exec();
    var permissionLevel = 0;
    if (resourcePermissions.length > 0) {
      permissionLevel = resourcePermissions[0].permission;
    }

    const isOwner =
      (role !== TeamMemberRoleEnum.visitor &&
        (String(dataset.tmbId) === tmbId || role === TeamMemberRoleEnum.owner)) ||
      permissionLevel >= 3;
    const canWrite =
      isOwner ||
      (role !== TeamMemberRoleEnum.visitor && dataset.permission === PermissionTypeEnum.public) ||
      permissionLevel >= 2;

    if (per === 'r') {
      if (
        role === TeamMemberRoleEnum.visitor ||
        (!isOwner && dataset.permission !== PermissionTypeEnum.public)
      ) {
        if (permissionLevel <= 1) {
          return Promise.reject(DatasetErrEnum.unAuthDataset);
        }
      }
    }
    if (per === 'w' && !canWrite) {
      return Promise.reject(DatasetErrEnum.unAuthDataset);
    }
    if (per === 'owner' && !isOwner) {
      return Promise.reject(DatasetErrEnum.unAuthDataset);
    }

    return { dataset, isOwner, canWrite };
  })();

  return {
    dataset,
    isOwner,
    canWrite
  };
}

export async function authDataset({
  datasetId,
  per = 'owner',
  ...props
}: AuthModeType & {
  datasetId: string;
}): Promise<
  AuthResponseType & {
    dataset: DatasetSchemaType;
  }
> {
  const result = await parseHeaderCert(props);
  const { teamId, tmbId } = result;
  const { dataset, isOwner, canWrite } = await authDatasetByTmbId({
    teamId,
    tmbId,
    datasetId,
    per
  });

  return {
    ...result,
    dataset,
    isOwner,
    canWrite
  };
}

/* 
   Read: in team and dataset permission is public [Adam:]and not visitor
   Write: in team, not visitor and dataset permission is public
*/
export async function authDatasetCollection({
  collectionId,
  per = 'owner',
  ...props
}: AuthModeType & {
  collectionId: string;
}): Promise<
  AuthResponseType & {
    collection: CollectionWithDatasetType;
  }
> {
  const { teamId, tmbId } = await parseHeaderCert(props);
  const { role } = await getTmbInfoByTmbId({ tmbId });

  const { collection, isOwner, canWrite } = await (async () => {
    const collection = await getCollectionWithDataset(collectionId);

    if (!collection || String(collection.teamId) !== teamId) {
      return Promise.reject(DatasetErrEnum.unAuthDatasetCollection);
    }

    // adam：读取resource_permissions表，检查用户是否有权限
    const resourcePermissions = await MongoResourcePermission.find({
      resourceId: collection.datasetId,
      tmbId
    }).exec();
    var permissionLevel = 0;
    if (resourcePermissions.length > 0) {
      permissionLevel = resourcePermissions[0].permission;
    }

    const isOwner =
      String(collection.tmbId) === tmbId ||
      role === TeamMemberRoleEnum.owner ||
      permissionLevel >= 3;

    const canWrite =
      isOwner ||
      (role !== TeamMemberRoleEnum.visitor &&
        collection.datasetId.permission === PermissionTypeEnum.public) ||
      permissionLevel >= 2;

    if (per === 'r') {
      if (
        role === TeamMemberRoleEnum.visitor ||
        (!isOwner && collection.datasetId.permission !== PermissionTypeEnum.public)
      ) {
        if (permissionLevel < 1) {
          return Promise.reject(DatasetErrEnum.unAuthDatasetCollection);
        }
      }
    }
    if (per === 'w' && !canWrite) {
      return Promise.reject(DatasetErrEnum.unAuthDatasetCollection);
    }
    if (per === 'owner' && !isOwner) {
      return Promise.reject(DatasetErrEnum.unAuthDatasetCollection);
    }

    return {
      collection,
      isOwner,
      canWrite
    };
  })();

  return {
    teamId,
    tmbId,
    collection,
    isOwner,
    canWrite
  };
}

export async function authDatasetFile({
  fileId,
  per = 'owner',
  ...props
}: AuthModeType & {
  fileId: string;
}): Promise<
  AuthResponseType & {
    file: DatasetFileSchema;
  }
> {
  const { teamId, tmbId } = await parseHeaderCert(props);

  const [file, collection] = await Promise.all([
    getFileById({ bucketName: BucketNameEnum.dataset, fileId }),
    MongoDatasetCollection.findOne({
      teamId,
      fileId
    })
  ]);

  if (!file) {
    console.log('\n\n3-1');
    return Promise.reject(CommonErrEnum.fileNotFound);
  }

  if (!collection) {
    console.log('\n\n3-3');
    return Promise.reject(DatasetErrEnum.unAuthDatasetFile);
  }

  // file role = collection role
  try {
    const { isOwner, canWrite } = await authDatasetCollection({
      ...props,
      collectionId: collection._id,
      per
    });

    return {
      teamId,
      tmbId,
      file,
      isOwner,
      canWrite
    };
  } catch (error) {
    console.log('\n\n3-3');
    return Promise.reject(DatasetErrEnum.unAuthDatasetFile);
  }
}
