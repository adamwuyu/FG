## 数据库表结构

### team_member_groups 集合
```typescript
{
  _id: ObjectId,           // 群组ID
  teamId: ObjectId,        // 团队ID
  name: String,            // 群组名称
  avatar: String,          // 群组头像(可选)
  updateTime: Date,        // 更新时间
}
```

### team_group_members 集合
```typescript
{
  _id: ObjectId,           // 主键
  groupId: ObjectId,       // 群组ID (关联 team_member_groups._id)
  tmbId: ObjectId,         // 团队成员ID (关联 team_members._id)
  role: String,           // 成员角色: owner/admin/member
}
```

索引设计：
1. team_member_groups:
   - `{ teamId: 1 }`: 用于按团队查询群组
   - `{ name: 1 }`: 用于群组名称查询

2. team_group_members:
   - `{ groupId: 1 }`: 用于查询群组成员
   - `{ tmbId: 1 }`: 用于查询用户所在的群组

