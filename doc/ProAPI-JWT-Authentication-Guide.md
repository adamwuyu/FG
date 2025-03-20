# JWT认证升级指南

## 背景

为了提高API安全性和用户身份验证的可靠性，FG-proApi已升级为使用JWT（JSON Web Token）认证机制。这意味着所有API请求现在都需要在请求头中包含有效的JWT令牌才能访问受保护的资源。

本文档旨在指导FastGPT团队如何适配这一变更，确保与FG-proApi的无缝集成。

## JWT认证流程

### 1. 认证流程概述

1. 用户通过`/api/support/user/auth/register`注册新账户或通过`/api/support/user/auth/login`登录现有账户
2. 服务器验证用户凭据，并返回JWT令牌
3. 客户端在后续所有API请求的Authorization头中包含该令牌
4. 服务器验证令牌的有效性，并根据令牌中的用户信息处理请求

### 2. 令牌格式

JWT令牌由服务器签发，包含以下信息：

```json
{
  "userId": "用户ID",
  "teamId": "用户的默认团队ID（如果有）",
  "iat": "令牌签发时间",
  "exp": "令牌过期时间"
}
```

令牌有效期为24小时，过期后需要重新登录获取新令牌。

## 升级步骤

### 1. 用户注册和登录

#### 注册新用户

```http
POST /api/support/user/auth/register
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码",
  "email": "电子邮件（可选）"
}
```

成功响应：

```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "userId": "用户ID",
    "username": "用户名"
  }
}
```

#### 用户登录

```http
POST /api/support/user/auth/login
Content-Type: application/json

{
  "username": "用户名",
  "password": "密码"
}
```

成功响应：

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "JWT令牌",
    "user": {
      "userId": "用户ID",
      "username": "用户名",
      "avatar": "头像URL",
      "teamId": "默认团队ID",
      "teamName": "默认团队名称"
    }
  }
}
```

### 2. 在API请求中使用JWT令牌

所有受保护的API端点现在都需要在请求头中包含JWT令牌：

```http
GET /api/support/user/team/list
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

注意：令牌前缀必须是`Bearer `（包括空格）。

### 3. 错误处理

当JWT认证失败时，API将返回以下错误响应：

- 未提供令牌：
  ```json
  {
    "code": 401,
    "message": "未提供访问令牌"
  }
  ```

- 无效的令牌：
  ```json
  {
    "code": 401,
    "message": "无效的访问令牌"
  }
  ```

- 令牌已过期：
  ```json
  {
    "code": 401,
    "message": "访问令牌已过期"
  }
  ```

- 用户不存在：
  ```json
  {
    "code": 401,
    "message": "用户不存在"
  }
  ```

### 4. 获取当前用户信息

可以使用以下API获取当前已认证用户的信息：

```http
GET /api/support/user/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

成功响应：

```json
{
  "code": 200,
  "data": {
    "userId": "用户ID",
    "username": "用户名",
    "avatar": "头像URL",
    "status": "用户状态",
    "createTime": "创建时间",
    "teamId": "默认团队ID",
    "teamName": "默认团队名称"
  }
}
```

## 客户端集成示例

### JavaScript/TypeScript示例

```javascript
// 登录并获取令牌
async function login(username, password) {
  const response = await fetch('https://api.example.com/api/support/user/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  if (data.code === 200) {
    // 保存令牌到本地存储
    localStorage.setItem('authToken', data.data.token);
    return data.data.user;
  } else {
    throw new Error(data.message);
  }
}

// 使用令牌发送API请求
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    throw new Error('未登录');
  }
  
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  // 处理令牌过期情况
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    // 重定向到登录页面或提示用户重新登录
  }
  
  return response;
}

// 使用示例
async function getTeamList() {
  const response = await fetchWithAuth('https://api.example.com/api/support/user/team/list');
  const data = await response.json();
  return data.data;
}
```

### Python示例

```python
import requests

class ApiClient:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None
    
    def login(self, username, password):
        response = requests.post(
            f"{self.base_url}/api/support/user/auth/login",
            json={"username": username, "password": password}
        )
        data = response.json()
        
        if data["code"] == 200:
            self.token = data["data"]["token"]
            return data["data"]["user"]
        else:
            raise Exception(data["message"])
    
    def request(self, method, endpoint, **kwargs):
        if not self.token:
            raise Exception("未登录")
        
        headers = kwargs.get("headers", {})
        headers["Authorization"] = f"Bearer {self.token}"
        kwargs["headers"] = headers
        
        response = requests.request(
            method,
            f"{self.base_url}{endpoint}",
            **kwargs
        )
        
        # 处理令牌过期情况
        if response.status_code == 401:
            self.token = None
            # 提示用户重新登录
        
        return response
    
    def get_team_list(self):
        response = self.request("GET", "/api/support/user/team/list")
        data = response.json()
        return data["data"]

# 使用示例
client = ApiClient("https://api.example.com")
client.login("username", "password")
teams = client.get_team_list()
print(teams)
```

## 常见问题

### 1. 令牌过期怎么办？

当令牌过期时，服务器将返回401状态码和"访问令牌已过期"的错误消息。此时，客户端应该引导用户重新登录以获取新的令牌。

### 2. 如何处理多设备登录？

每次登录都会生成新的JWT令牌，多个设备可以同时使用不同的令牌访问API。目前没有令牌撤销机制，所有有效期内的令牌都可以使用。

### 3. 令牌安全存储

客户端应安全存储JWT令牌，避免令牌泄露导致的安全风险：
- Web应用：使用HttpOnly Cookie或localStorage
- 移动应用：使用安全的本地存储机制
- 服务器应用：使用安全的配置管理工具存储

## 联系与支持

如果在集成过程中遇到任何问题，请联系FG-proApi技术支持团队获取帮助。
