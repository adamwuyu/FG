好的，下面是第二阶段第3步的文档内容，您可以直接复制粘贴：

# API认证机制修复 - 第二阶段第3步：保留类型2接口的Cookie验证

## 已完成的修改

### 1. 修改认证类型定义
- 修改了 `AuthModeType` 类型，移除了强制指定认证类型的限制
- 允许在调用认证函数时不指定任何认证方式，默认使用Cookie认证

```typescript
// 修改前
export type AuthModeType = RequireAtLeastOne<authModeType, 'authApiKey' | 'authRoot' | 'authToken'>;

// 修改后
export type AuthModeType = authModeType;
```

### 2. 优化 `parseHeaderCert` 函数
- 添加了检测未指定认证方式的逻辑，默认使用Cookie认证
- 改进了Cookie验证和JWT验证的顺序和逻辑
- 增强了错误处理，明确了JWT令牌和Cookie验证失败的处理流程

```typescript
// 主要改动：增加了未指定认证方式的检测
const useCookieAuth = !authToken && !authRoot && !authApiKey;

// 修改Cookie验证逻辑，在未指定认证方式时也使用Cookie
if ((useCookieAuth || authToken) && cookie) {
  // 优先使用Cookie验证（类型2接口）
  // ...
}
```

### 3. 新增 `authCookieCert` 函数
- 创建专门用于类型2接口的Cookie认证函数
- 该函数明确拒绝JWT认证，只使用Cookie认证
- 简化了API实现，提高了代码清晰度

```typescript
export const authCookieCert = async (props: Omit<AuthModeType, 'authToken'> & { req: ApiRequestProps }) => {
  // 将authToken设置为false，确保只使用Cookie认证
  const result = await parseHeaderCert({
    ...props,
    authToken: false
  });

  return {
    ...result,
    isOwner: true,
    canWrite: true
  };
};
```

### 4. 修改实际API实现
- 从类型2接口中移除 `authToken: true` 参数
- 示例：修改了 `/api/core/app/list` 和 `/api/core/app/detail` 接口
- 这些接口现在将只使用Cookie进行认证，不会尝试JWT验证

```typescript
// 修改前
const { app } = await authApp({ req, authToken: true, appId, per: ReadPermissionVal });

// 修改后
const { app } = await authApp({ req, appId, per: ReadPermissionVal });
```

## 验收测试

1. 创建了 `scripts/test_cookie_auth.sh` 测试脚本
2. 该脚本测试了多个典型的类型2接口，验证它们是否正确使用Cookie认证：
   - `/api/core/app/list` - 应用列表接口
   - `/api/core/dataset/list` - 数据集列表接口
   - `/api/common/system/getInitData` - 系统初始化数据接口
   - `/api/core/app/plugin/getSystemPluginTemplates` - 系统插件模板接口
   - `/api/core/app/detail` - 应用详情接口
3. 测试脚本还验证了无Cookie访问时的错误处理

## 下一步工作

1. 继续识别并修改更多类型2接口，移除不必要的JWT验证
2. 实现类型3接口的处理（同时使用Cookie和JWT认证的接口）
3. 确保所有修改向后兼容，不影响现有功能
