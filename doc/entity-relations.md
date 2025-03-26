## 实体关系图

```mermaid
 erDiagram
 Team ||--o{ TeamMember : "包含"
 User ||--o{ TeamMember : "作为"
 Team ||--o{ TeamOrg : "包含"
 Team ||--o{ TeamGroup : "包含"
 TeamMember ||--o{ TeamOrgMember : "属于"
 TeamMember ||--o{ TeamGroupMember : "属于"
 TeamOrg ||--o{ TeamOrgMember : "包含"
 TeamGroup ||--o{ TeamGroupMember : "包含"

 Team {
 ObjectId _id
 String name
 ObjectId ownerId
 String avatar
 Date createTime
 }

 User {
 ObjectId _id
 String name
 String email
 }

 TeamMember {
 ObjectId _id
 ObjectId teamId
 ObjectId userId
 String name
 String role
 String status
 Boolean defaultTeam
 String avatar
 }

 TeamOrg {
 ObjectId _id
 ObjectId teamId
 String path
 String pathId
 String name
 String avatar
 String description
 Date updateTime
 }

 TeamGroup {
 ObjectId _id
 ObjectId teamId
 String name
 String avatar
 Date updateTime
 }

 TeamOrgMember {
 ObjectId _id
 ObjectId orgId
 ObjectId tmbId
 String role
 }

 TeamGroupMember {
 ObjectId _id
 ObjectId groupId
 ObjectId tmbId
 String role
 }
```

## 组织架构说明

### Org(部门)与Group(群组)的区别

1. 组织结构
   - Org(部门)：采用层级结构，通过`path`和`pathId`字段维护部门层级关系，可构建树形组织架构
   - Group(群组)：采用扁平结构，群组之间无层级关系，都是平级的

2. 权限管理
   - Group(群组)：成员有明确的角色划分(owner/admin/member)，主要用于资源权限管理
   - Org(部门)：成员无角色区分，主要用于组织架构管理

3. 业务用途
   - Org(部门)
     - 用于模拟企业的组织架构
     - 支持部门的层级管理
     - 每个团队都有一个ROOT部门作为顶级部门
     - 主要用于组织结构展示和管理
   
   - Group(群组)
     - 用于资源权限管理和协作
     - 每个团队默认有一个Default群组
     - 可以灵活创建不同的群组来管理不同资源的访问权限
     - 主要用于团队协作和资源共享

这种设计将"组织架构管理"和"权限管理"进行了分离，使系统更加灵活和清晰。

## 资源共享机制图

> **注意**：下图展示的是资源共享流程。在数据库中，我们同时使用 tmbId/groupId/orgId 和 entityType/entityId 两组字段，并通过中间件自动维护它们之间的数据一致性。

```mermaid
 flowchart TD
 A[应用/知识库] --> B{共享给谁?}
 B -->|用户| C[查找TeamMember记录]
 B -->|群组| D[查找TeamGroup记录]
 B -->|组织| E[查找TeamOrg记录]
 
 C --> F{是否存在?}
 D --> G{是否存在?}
 E --> H{是否存在?}
 
 F -->|否| I[跳过]
 G -->|否| I
 H -->|否| I
 
 F -->|是| J[创建ResourcePermission记录<br>tmbId=团队成员ID<br>groupId=null<br>orgId=null<br>entityType='user'<br>entityId=团队成员ID]
 G -->|是| K[创建ResourcePermission记录<br>tmbId=null<br>groupId=群组ID<br>orgId=null<br>entityType='group'<br>entityId=群组ID]
 H -->|是| L[创建ResourcePermission记录<br>tmbId=null<br>groupId=null<br>orgId=组织ID<br>entityType='org'<br>entityId=组织ID]
 
 J --> M[共享完成]
 K --> M
 L --> M
```

## 数据库调整说明

> 不再使用team_collaborators表，统一使用resource_permissions表。resource_permissions表中增加`entityType` 和 `entityId` 字段，原因如下：
>
> **数据库设计方案**：我们采用了一种折衡方案，同时保留了原有的 `tmbId`、`groupId` 和 `orgId` 字段，并增加了 `entityType` 和 `entityId` 字段。
>
> **为什么这样设计**：
> 1. 保留原有字段确保与 FastGPT 核心包的兼容性
> 2. 新增 `entityType` 和 `entityId` 字段简化查询和业务逻辑
> 3. 通过数据库中间件自动维护两组字段之间的数据一致性
>
> **数据关系**：
> - 当 `entityType='user'` 时，`entityId` 对应 `tmbId`，其他两个字段为 `null`
> - 当 `entityType='group'` 时，`entityId` 对应 `groupId`，其他两个字段为 `null`
> - 当 `entityType='org'` 时，`entityId` 对应 `orgId`，其他两个字段为 `null`

## 数据库表关系图

```mermaid
 erDiagram
 teams ||--o{ team_members : "包含"
 teams ||--o{ team_orgs : "包含"
 teams ||--o{ team_member_groups : "包含"
 users ||--o{ team_members : "作为"
 team_members ||--o{ team_org_members : "属于"
 team_members ||--o{ team_group_members : "属于"
 team_orgs ||--o{ team_org_members : "包含"
 team_member_groups ||--o{ team_group_members : "包含"
 
 apps }o--|| teams : "属于"
 knowledge_bases }o--|| teams : "属于"
 
 apps ||--o{ resource_permissions : "被共享"
 knowledge_bases ||--o{ resource_permissions : "被共享"
 
 team_members ||--o{ resource_permissions : "作为协作者(entityType=user)"
 team_orgs ||--o{ resource_permissions : "作为协作者(entityType=org)"
 team_member_groups ||--o{ resource_permissions : "作为协作者(entityType=group)"
 
 teams {
 ObjectId _id "主键"
 String name "团队名称"
 ObjectId ownerId "创建者ID"
 }
 
 users {
 ObjectId _id "主键"
 String name "用户名"
 }
 
 team_members {
 ObjectId _id "主键(tmbId)"
 ObjectId teamId "团队ID"
 ObjectId userId "用户ID"
 String role "角色"
 String status "状态"
 }
 
 team_orgs {
 ObjectId _id "主键(orgId)"
 ObjectId teamId "团队ID"
 String name "组织名称"
 }
 
 team_member_groups {
 ObjectId _id "主键(groupId)"
 ObjectId teamId "团队ID"
 String name "群组名称"
 }
 
 team_org_members {
 ObjectId _id "主键"
 ObjectId orgId "组织ID"
 ObjectId tmbId "团队成员ID"
 }
 
 team_group_members {
 ObjectId _id "主键"
 ObjectId groupId "群组ID"
 ObjectId tmbId "团队成员ID"
 }
 
 apps {
 ObjectId _id "主键(appId)"
 ObjectId teamId "团队ID"
 String name "应用名称"
 }
 
 knowledge_bases {
 ObjectId _id "主键(kbId)"
 ObjectId teamId "团队ID"
 String name "知识库名称"
 }
 
 resource_permissions {
 ObjectId _id "主键"
 ObjectId teamId "团队ID"
 ObjectId tmbId "团队成员ID（用户类型）"
 ObjectId groupId "群组ID（群组类型）"
 ObjectId orgId "组织ID（组织类型）"
 ObjectId entityId "实体ID（与上述三个字段之一相同）"
 String entityType "实体类型(user/group/org)"
 String resourceId "资源ID"
 String resourceType "资源类型"
 Number permission "权限值"
 }
```

> **注意**：我们同时使用两组字段，并通过中间件自动维护它们之间的数据一致性。

