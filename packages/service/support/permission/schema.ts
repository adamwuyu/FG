import {
  TeamCollectionName,
  TeamMemberCollectionName
} from '@fastgpt/global/support/user/team/constant';
import { connectionMongo, getMongoModel } from '../../common/mongo';
import type { ResourcePermissionType } from '@fastgpt/global/support/permission/type';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { MemberGroupCollectionName } from './memberGroup/memberGroupSchema';
import { OrgCollectionName } from '@fastgpt/global/support/user/team/org/constant';
const { Schema } = connectionMongo;

export const ResourcePermissionCollectionName = 'resource_permissions';

/**
 * 资源权限模式定义
 *
 * 我们采用了一种折衡方案，同时保留了原有的 tmbId、groupId 和 orgId 字段，
 * 并增加了 entityType 和 entityId 字段。这样既保持了与 FastGPT 核心包的兼容性，
 * 又简化了查询和业务逻辑。
 *
 * 数据关系：
 * - 当 entityType='user' 时，entityId 对应 tmbId，其他两个字段为 null
 * - 当 entityType='group' 时，entityId 对应 groupId，其他两个字段为 null
 * - 当 entityType='org' 时，entityId 对应 orgId，其他两个字段为 null
 *
 * 通过中间件自动维护两组字段之间的数据一致性。
 */
export const ResourcePermissionSchema = new Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: TeamCollectionName
  },
  // 原有字段，与 FastGPT 核心包兼容
  // 用户类型的协作者
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: TeamMemberCollectionName
  },
  // 群组类型的协作者
  groupId: {
    type: Schema.Types.ObjectId,
    ref: MemberGroupCollectionName
  },
  // 组织类型的协作者
  orgId: {
    type: Schema.Types.ObjectId,
    ref: OrgCollectionName
  },
  // 新增字段，简化查询和业务逻辑
  entityType: {
    type: String,
    enum: ['user', 'group', 'org'],
    required: true
  },
  entityId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  resourceType: {
    type: String,
    enum: Object.values(PerResourceTypeEnum),
    required: true
  },
  permission: {
    type: Number,
    required: true
  },
  // Resrouce ID: App or DataSet or any other resource type.
  // It is null if the resourceType is team.
  resourceId: {
    type: Schema.Types.ObjectId
  }
});

// 添加中间件维护数据一致性
ResourcePermissionSchema.pre('save', function (next) {
  // 根据 entityType 和 entityId 设置对应字段
  if (this.entityType === 'user') {
    this.tmbId = this.entityId;
    this.groupId = undefined;
    this.orgId = undefined;
  } else if (this.entityType === 'group') {
    this.tmbId = undefined;
    this.groupId = this.entityId;
    this.orgId = undefined;
  } else if (this.entityType === 'org') {
    this.tmbId = undefined;
    this.groupId = undefined;
    this.orgId = this.entityId;
  }
  next();
});

// 反向中间件，确保从旧字段更新新字段
ResourcePermissionSchema.pre('save', function (next) {
  if (
    this.isNew ||
    this.isModified('tmbId') ||
    this.isModified('groupId') ||
    this.isModified('orgId')
  ) {
    if (this.tmbId) {
      this.entityType = 'user';
      this.entityId = this.tmbId;
    } else if (this.groupId) {
      this.entityType = 'group';
      this.entityId = this.groupId;
    } else if (this.orgId) {
      this.entityType = 'org';
      this.entityId = this.orgId;
    }
  }
  next();
});

ResourcePermissionSchema.virtual('tmb', {
  ref: TeamMemberCollectionName,
  localField: 'tmbId',
  foreignField: '_id',
  justOne: true
});
ResourcePermissionSchema.virtual('group', {
  ref: MemberGroupCollectionName,
  localField: 'groupId',
  foreignField: '_id',
  justOne: true
});
ResourcePermissionSchema.virtual('org', {
  ref: OrgCollectionName,
  localField: 'orgId',
  foreignField: '_id',
  justOne: true
});

// 添加新索引
ResourcePermissionSchema.index({
  teamId: 1,
  resourceType: 1,
  resourceId: 1,
  entityType: 1,
  entityId: 1
});

try {
  ResourcePermissionSchema.index(
    {
      resourceType: 1,
      teamId: 1,
      resourceId: 1,
      groupId: 1
    },
    {
      unique: true,
      partialFilterExpression: {
        groupId: {
          $exists: true
        }
      }
    }
  );

  ResourcePermissionSchema.index(
    {
      resourceType: 1,
      teamId: 1,
      resourceId: 1,
      orgId: 1
    },
    {
      unique: true,
      partialFilterExpression: {
        orgId: {
          $exists: true
        }
      }
    }
  );

  ResourcePermissionSchema.index(
    {
      resourceType: 1,
      teamId: 1,
      resourceId: 1,
      tmbId: 1
    },
    {
      unique: true,
      partialFilterExpression: {
        tmbId: {
          $exists: true
        }
      }
    }
  );

  // Delete tmb permission
  ResourcePermissionSchema.index({
    resourceType: 1,
    teamId: 1,
    resourceId: 1
  });
} catch (error) {
  console.log(error);
}

export const MongoResourcePermission = getMongoModel<ResourcePermissionType>(
  ResourcePermissionCollectionName,
  ResourcePermissionSchema
);
