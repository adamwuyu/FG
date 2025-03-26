# 删除群组接口规范

## 基本信息
- 接口URL: `/api/support/user/team/group/delete`
- 请求方法: DELETE
- 认证要求: 需要JWT令牌
- 接口类型: 类型1接口(proApi)

## 接口说明
删除指定的群组及其所有成员关系。

## 请求头
```
Authorization: Bearer <jwt_token>
```

## 请求参数
```typescript
{
  groupId: string;        // 要删除的群组ID
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
curl -X DELETE "http://localhost:3002/api/support/user/team/group/delete" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "groupId": "507f1f77bcf86cd799439011"
  }'
```

## 注意事项
1. 此接口为类型1接口，需要在proApi项目中实现
2. 只有群组owner和团队管理员可以删除群组
3. Default群组不能被删除
4. 删除群组会同时删除team_group_members表中的相关记录