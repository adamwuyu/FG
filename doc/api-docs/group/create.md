# 创建群组接口规范

## 基本信息
- 接口URL: `/api/support/user/team/group/create`
- 请求方法: POST
- 认证要求: 需要JWT令牌
- 接口类型: 类型1接口(proApi)

## 接口说明
创建一个新的群组，并可选择性地添加初始成员。

## 请求头
```
Authorization: Bearer <jwt_token>
```

## 请求参数
```typescript
{
  name: string;           // 群组名称，必填
  avatar?: string;        // 群组头像URL，可选
  memberIdList?: string[]; // 初始成员ID列表，可选
}
```

## 响应数据
```typescript
{
  code: 200,
  data: {
    _id: string;          // 新创建的群组ID
  }
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
- 404: 资源不存在
- 500: 服务器内部错误

## 测试命令
```bash
curl -X POST "http://localhost:3002/api/support/user/team/group/create" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Group",
    "avatar": "https://example.com/avatar.png",
    "memberIdList": ["507f1f77bcf86cd799439013"]
  }'
```

## 注意事项
1. 此接口为类型1接口，需要在proApi项目中实现
2. 群组名称在同一团队内不能重复
3. 创建者默认成为群组的owner角色
4. memberIdList中的成员默认被赋予member角色