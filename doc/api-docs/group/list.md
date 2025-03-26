# 获取群组列表接口规范

## 基本信息
- 接口URL: `/api/support/user/team/group/list`
- 请求方法: GET
- 认证要求: 需要JWT令牌
- 接口类型: 类型1接口(proApi)

## 接口说明
获取当前用户在指定团队中可访问的所有群组列表。

## 请求头
```
Authorization: Bearer <jwt_token>
```

## 请求参数
无需请求参数。JWT令牌中包含了必要的teamId和tmbId信息。

## 响应数据
```typescript
{
  code: 200,
  data: {
    _id: string;          // 群组ID
    teamId: string;       // 团队ID
    name: string;         // 群组名称
    avatar?: string;      // 群组头像(可选)
    updateTime: string;   // 更新时间
    members: {            // 成员列表
      tmbId: string;      // 团队成员ID
      role: 'owner' | 'admin' | 'member';  // 成员角色
    }[];
  }[]
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
# 获取群组列表
curl -X GET "http://localhost:3002/api/support/user/team/group/list" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxx" \
  -H "Content-Type: application/json"

# 预期成功响应
{
  "code": 200,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "teamId": "507f1f77bcf86cd799439012",
      "name": "Default Group",
      "avatar": "https://example.com/avatar.png",
      "members": [
        {
          "tmbId": "507f1f77bcf86cd799439013",
          "role": "owner"
        }
      ],
      "updateTime": "2024-03-25T12:00:00Z"
    }
  ]
}

# 预期错误响应 (未授权)
{
  "code": 401,
  "statusText": "Unauthorized",
  "message": "Invalid or expired token",
  "data": null
}
```

## 注意事项
1. 此接口为类型1接口，需要在proApi项目中实现
2. 接口返回的群组列表应根据JWT令牌中的teamId进行过滤
3. 默认情况下，每个团队创建时会自动创建一个Default群组
4. 群组成员角色分为owner、admin和member三种
5. 群组没有层级关系，所有群组都是平级的