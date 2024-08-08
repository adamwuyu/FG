import { PermissionValueType } from './type';
import { NullPermission, PermissionTypeEnum } from './constant';
import { Permission } from './controller';
//@yourproject/service/support/permission/schema
import { MongoResourcePermission } from '../../../service/support/permission/schema'; // 引入资源权限模型
import { connectionMongo } from '../../../service/common/mongo';
import mongoose from 'mongoose';

const { Schema } = connectionMongo;

/**
 * 生成 MongoDB 查询条件
 * @param {string} teamId - 团队ID
 * @param {string} tmbId - 团队成员ID
 * @param {Permission} permission - 权限对象
 * @returns {Object} - MongoDB 查询条件
 */
export async function mongoRPermission({
  teamId,
  tmbId,
  permission
}: {
  teamId: string;
  tmbId: string;
  permission: Permission;
}): Promise<Object> {
  const teamIdObject = new mongoose.Types.ObjectId(teamId); // 将 teamId 转换为 Hex 类型
  const tmbIdObject = new mongoose.Types.ObjectId(tmbId); // 将 teamId 转换为 Hex 类型
  const resourcePermissions = await MongoResourcePermission.find({
    teamId: teamIdObject,
    tmbId: tmbIdObject
  }).exec();

  if (permission.isOwner) {
    return {
      teamId
    };
  }
  // 构建查询条件
  const queryConditions: any = {
    teamId: teamIdObject,
    $or: [{ permission: PermissionTypeEnum.public }, { tmbId: tmbIdObject }]
  };

  // 添加资源权限条件
  if (resourcePermissions.length > 0) {
    const permissionConditions = resourcePermissions.map(
      // @ts-ignore
      (resPerm: { resourceId: string; permission: PermissionTypeEnum }) => {
        return {
          _id: resPerm.resourceId
        };
      }
    );
    queryConditions.$or.push(...permissionConditions);
  }

  return queryConditions;
}
export function mongoOwnerPermission({ teamId, tmbId }: { teamId: string; tmbId: string }) {
  return {
    teamId,
    tmbId
  };
}

// return permission-related schema to define the schema of resources
export function getPermissionSchema(defaultPermission: PermissionValueType = NullPermission) {
  return {
    defaultPermission: {
      type: Number,
      default: defaultPermission
    },
    inheritPermission: {
      type: Boolean,
      default: true
    }
  };
}
