## url
/api/support/user/team/org/updateMembers

## 类型
类型1

# 接口介绍
更新组织成员列表。该接口会根据提交的成员列表更新组织的成员关系：
- 不在提交列表中的现有成员将被移除
- 列表中的新成员将被添加
- 已存在的成员关系保持不变

## 请求参数
```json
{
  "orgId": "string",     // 组织ID，必填
  "members": [           // 新的成员列表，必填
    {
      "tmbId": "string"  // 团队成员ID
    }
  ]
}
```

## 注意事项
1. 该接口会根据提交的成员列表重新建立组织的成员关系，未包含在列表中的现有成员将失去组织成员身份
2. 成员的tmbId必须是有效的团队成员ID
3. 建议在调用接口前先获取当前成员列表，以避免意外移除重要成员
4. 该操作会触发组织成员关系的变更，可能影响相关的权限和资源访问

## 返回值示例
```json
{
  "error": "接口不存在",
  "message": "您请求的接口不存在，请访问 /api-docs 获取完整的API文档",
  "path": "/api/support/user/team/org/updateMembers?",
  "method": "PUT"
}
```
