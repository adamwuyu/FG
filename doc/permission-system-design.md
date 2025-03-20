# 资源权限系统设计文档

## 设计背景

在 FastGPT 的二次开发过程中，我们需要实现一个更灵活的资源权限管理系统，以支持多用户管理体系和基于角色的权限控制。原有的 `team_collaborators` 表已经不能满足这些需求，因此我们设计了新的 `resource_permissions` 表来统一管理各类资源的权限。

## 数据库设计方案

我们采用了一种折衡方案，同时保留了原有的 `tmbId`、`groupId` 和 `orgId` 字段，并增加了 `entityType` 和 `entityId` 字段。

### 设计理由

1. **兼容性考虑**：保留原有字段确保与 FastGPT 核心包的兼容性
2. **查询简化**：新增 `entityType` 和 `entityId` 字段简化查询和业务逻辑
3. **数据一致性**：通过数据库中间件自动维护两组字段之间的数据一致性

### 数据关系

- 当 `entityType='user'` 时，`entityId` 对应 `tmbId`，其他两个字段为 `undefined`
- 当 `entityType='group'` 时，`entityId` 对应 `groupId`，其他两个字段为 `undefined`
- 当 `entityType='org'` 时，`entityId` 对应 `orgId`，其他两个字段为 `undefined`

## 数据库表结构

```typescript
export const ResourcePermissionSchema = new Schema({
  teamId: {
    type: Schema.Types.ObjectId,
    ref: TeamCollectionName
  },
  // 原有字段，与 FastGPT 核心包兼容
  tmbId: {
    type: Schema.Types.ObjectId,
    ref: TeamMemberCollectionName
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: MemberGroupCollectionName
  },
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
  resourceId: {
    type: Schema.Types.ObjectId
  }
});
```

## 数据一致性维护

我们通过 Mongoose 中间件自动维护两组字段之间的数据一致性：

```typescript
// 根据 entityType 和 entityId 设置对应字段
ResourcePermissionSchema.pre('save', function(next) {
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
ResourcePermissionSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('tmbId') || this.isModified('groupId') || this.isModified('orgId')) {
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
```

## 索引优化

为了提高查询性能，我们添加了以下索引：

```typescript
// 原有索引
ResourcePermissionSchema.index({ teamId: 1, resourceType: 1, resourceId: 1, tmbId: 1 });
ResourcePermissionSchema.index({ teamId: 1, resourceType: 1, resourceId: 1, groupId: 1 });
ResourcePermissionSchema.index({ teamId: 1, resourceType: 1, resourceId: 1, orgId: 1 });

// 新增索引
ResourcePermissionSchema.index({ teamId: 1, resourceType: 1, resourceId: 1, entityType: 1, entityId: 1 });
```

## 查询示例

### 使用新字段查询

```typescript
// 查询用户有权限的所有资源
const userResources = await ResourcePermissionModel.find({
  teamId,
  entityType: 'user',
  entityId: userId
});

// 查询群组有权限的所有资源
const groupResources = await ResourcePermissionModel.find({
  teamId,
  entityType: 'group',
  entityId: groupId
});
```

### 使用原有字段查询（保持兼容性）

```typescript
// 查询用户有权限的所有资源
const userResources = await ResourcePermissionModel.find({
  teamId,
  tmbId: userId
});

// 查询群组有权限的所有资源
const groupResources = await ResourcePermissionModel.find({
  teamId,
  groupId
});
```

## 结论

通过这种折衡方案，我们既保持了与 FastGPT 核心包的兼容性，又提供了更清晰的权限模型，有助于实现基于角色的权限管理（RBAC）。这种设计支持多用户管理体系，包括用户、部门、群组的层级管理，以及为知识库和应用设置差异化访问权限的需求。
