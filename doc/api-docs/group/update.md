# 更新群组接口规范

## 基本信息
- 接口URL: `/api/support/user/team/group/update`
- 请求方法: PUT
- 认证要求: 需要JWT令牌
- 接口类型: 类型1接口(proApi)

## 接口说明
更新群组信息，包括名称、头像和成员列表。

## 请求头
```
Authorization: Bearer <jwt_token>
```

## 请求参数
```typescript
{
  groupId: string;        // 群组ID，必填
  name?: string;          // 新的群组名称，可选
  avatar?: string;        // 新的群组头像URL，可选
  memberList?: {          // 新的成员列表，可选
    tmbId: string;        // 团队成员ID
    role: 'owner' | 'admin' | 'member';  // 成员角色
  }[];
}
```

## 响应数据
```typescript
{
  code: 200,
  data: null
}
```

## 错误响应
```typescript
{
  code: number;        // 错误码
  statusText: string;  // 状态描述
  message: string;     // 错误信息
  data: null;
}
```

## 错误码说明
- 401: 未授权或令牌无效
- 403: 权限不足
- 404: 群组不存在
- 500: 服务器内部错误

## 测试命令
```bash
curl -X PUT "http://localhost:3002/api/support/user/team/group/update" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "507f1f77bcf86cd799439011",
    "name": "Updated Group Name",
    "avatar": "https://example.com/new-avatar.png",
    "memberList": [
      {
        "tmbId": "507f1f77bcf86cd799439013",
        "role": "owner"
      }
    ]
  }'
```

## 注意事项
1. 此接口为类型1接口，需要在proApi项目中实现
2. 只有群组owner和admin可以更新群组信息
3. 群组名称在同一团队内不能重复
4. 如提供了memberList，将完全替换现有成员列表
5. 至少保留一个owner角色的成员
6. Default群组的某些属性可能受限制