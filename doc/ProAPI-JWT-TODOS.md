# proAPI JWT认证升级实施方案

## 一、现状分析

1. **当前认证机制**：
   - 项目目前使用cookie-based认证（`fastgpt_token`）
   - 服务器端使用JWT生成token，但客户端通过cookie传递
   - 请求拦截器目前没有添加认证头

2. **proAPI调用模式**：
   - 前端直接调用`/api/proApi/...`路径的接口
   - 这些接口由本地Node服务器转发到外部proApi服务(localhost:3002)

## 二、升级目标

1. 对所有包含`proApi`的接口请求添加JWT认证头
2. 保持非proApi接口的现有认证方式不变
3. 确保用户登录后获取的JWT令牌能够正确用于后续请求

## 三、实施步骤

### 1. 修改请求拦截器

在`/projects/app/src/web/common/api/request.ts`中修改`startInterceptors`函数，添加JWT认证头：

```typescript
function startInterceptors(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (config.headers) {
    // 检查是否为proApi请求
    if (config.url && config.url.includes('proApi')) {
      // 从localStorage获取JWT令牌
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  return config;
}
```

### 2. 修改登录响应处理

在用户登录成功后，需要保存JWT令牌。修改相关登录处理函数，例如在`/projects/app/src/web/support/user/api.ts`中：

```typescript
// 修改登录相关函数，保存JWT令牌
export const oauthLogin = (params: OauthLoginProps) =>
  POST<ResLogin>('/proApi/support/user/account/login/oauth', params).then(handleLoginResponse);

export const postFastLogin = (params: FastLoginProps) =>
  POST<ResLogin>('/proApi/support/user/account/login/fastLogin', params).then(handleLoginResponse);

export const ssoLogin = (params: any) => 
  GET<ResLogin>('/proApi/support/user/account/sso', params).then(handleLoginResponse);

export const postRegister = ({
  username,
  password,
  code,
  inviterId,
  bd_vid,
  fastgpt_sem
}: AccountRegisterBody) =>
  POST<ResLogin>(`/proApi/support/user/account/register/emailAndPhone`, {
    username,
    code,
    inviterId,
    bd_vid,
    fastgpt_sem,
    password: hashStr(password)
  }).then(handleLoginResponse);

// 处理登录响应，保存JWT令牌
function handleLoginResponse(response: ResLogin) {
  if (response.token) {
    localStorage.setItem('jwt_token', response.token);
  }
  return response;
}
```

### 3. 修改登出处理

在用户登出时，需要清除JWT令牌。修改`/projects/app/src/web/support/user/auth.ts`中的`clearToken`函数：

```typescript
export const clearToken = () => {
  try {
    localStorage.removeItem('jwt_token');
    return loginOut();
  } catch (error) {
    error;
  }
};
```

### 4. 添加令牌刷新机制

JWT令牌有效期为24小时，需要添加令牌刷新机制：

```typescript
// 在request.ts中添加令牌刷新逻辑
function responseError(err: any) {
  console.log('error->', '请求错误', err);
  const data = err?.response?.data || err;

  // 处理令牌过期错误
  if (data?.code === 401 && data?.message === '访问令牌已过期') {
    // 清除过期令牌
    localStorage.removeItem('jwt_token');
    
    // 重定向到登录页面
    if (!['/chat/share', '/chat/team', '/login'].includes(window.location.pathname)) {
      clearToken();
      window.location.replace(
        getWebReqUrl(`/login?lastRoute=${encodeURIComponent(location.pathname + location.search)}`)
      );
    }
    
    return Promise.reject({ message: i18nT('common:unauth_token') });
  }
  
  // 其他错误处理逻辑...
  return Promise.reject(data);
}
```

### 5. 错误处理增强

增强错误处理，添加对JWT特定错误的处理：

```typescript
// 在responseError函数中添加JWT错误处理
if (data?.code === 401) {
  if (data?.message === '未提供访问令牌') {
    localStorage.removeItem('jwt_token');
    // 重定向到登录页面
  } else if (data?.message === '无效的访问令牌') {
    localStorage.removeItem('jwt_token');
    // 重定向到登录页面
  } else if (data?.message === '访问令牌已过期') {
    localStorage.removeItem('jwt_token');
    // 重定向到登录页面
  } else if (data?.message === '用户不存在') {
    localStorage.removeItem('jwt_token');
    // 重定向到登录页面
  }
}
```

## 四、测试计划

1. **登录测试**：
   - 测试各种登录方式（邮箱/手机号、OAuth、SSO等）
   - 验证JWT令牌是否正确保存到localStorage

2. **API请求测试**：
   - 测试proApi接口请求是否正确添加JWT认证头
   - 测试非proApi接口请求是否保持原有认证方式

3. **错误处理测试**：
   - 测试令牌过期、无效令牌等错误场景
   - 验证错误处理和重定向逻辑是否正确

4. **安全测试**：
   - 确保JWT令牌安全存储
   - 验证令牌过期机制是否正常工作

## 五、回滚计划

如果升级过程中出现问题，准备以下回滚步骤：

1. 恢复原始的`startInterceptors`函数，移除JWT认证头添加逻辑
2. 恢复原始的登录响应处理，移除JWT令牌保存逻辑
3. 恢复原始的错误处理逻辑

## 六、注意事项

1. JWT令牌存储在localStorage中，相比HttpOnly Cookie安全性较低，但便于前端访问
2. 确保所有proApi请求都添加了JWT认证头
3. 注意处理令牌过期和刷新逻辑，避免用户体验中断