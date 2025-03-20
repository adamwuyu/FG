import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  VStack,
  Text,
  Code,
  Heading,
  Divider,
  Input,
  FormControl,
  FormLabel
} from '@chakra-ui/react';

/**
 * JWT令牌测试页面
 * 用于验证JWT令牌的使用情况，特别是在请求头中的Authorization部分
 */
export default function TestJWT() {
  const [jwtToken, setJwtToken] = useState('');
  const [requestResult, setRequestResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('root');
  const [password, setPassword] = useState('IloveGPT!');

  // 页面加载时获取JWT令牌
  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    setJwtToken(token || '未找到JWT令牌');
  }, []);

  // 测试请求函数
  const testRequest = async (url: string, withAuth: boolean = true) => {
    try {
      setError('');
      setRequestResult(null);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // 如果需要认证，添加Authorization头
      if (withAuth && jwtToken && jwtToken !== '未找到JWT令牌') {
        headers['Authorization'] = `Bearer ${jwtToken}`;
        // 添加API密钥
        const apiKey = localStorage.getItem('api_key');
        if (apiKey) {
          headers['X-API-KEY'] = apiKey;
        }
      }

      console.log('发送请求:', {
        url,
        headers
      });

      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      const data = await response.json();
      console.log('响应数据:', data);

      setRequestResult({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
    } catch (err) {
      console.error('请求出错:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // 测试POST请求
  const testPostRequest = async (
    url: string,
    body: any,
    withAuth: boolean = true,
    withApiKey: boolean = false
  ) => {
    try {
      setError('');
      setRequestResult(null);

      // 解析JWT令牌以获取用户ID和团队ID
      let userId = '';
      let teamId = '';
      if (jwtToken && jwtToken !== '未找到JWT令牌') {
        try {
          const base64Url = jwtToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = atob(base64);
          const payload = JSON.parse(jsonPayload);
          userId = payload.userId || '';
          teamId = payload.teamId || '';
          console.log('解析JWT令牌成功:', { userId, teamId });
        } catch (e) {
          console.error('解析JWT令牌失败:', e);
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // 如果需要认证，添加Authorization头和设置Cookie
      if (withAuth && jwtToken && jwtToken !== '未找到JWT令牌') {
        // 确保Bearer格式正确
        headers['Authorization'] = `Bearer ${jwtToken.trim()}`;

        // 添加用户ID和团队ID头 - 这些可能是关键
        if (userId) {
          headers['X-User-Id'] = userId;
        }
        if (teamId) {
          headers['X-Team-Id'] = teamId;
        }

        // 添加API密钥（仅当明确要求时）
        if (withApiKey) {
          const apiKey = localStorage.getItem('api_key');
          if (apiKey) {
            headers['X-API-KEY'] = apiKey.trim();
          }
        }

        // 设置Cookie - 保证会话完整性
        document.cookie = `fastgpt_token=${jwtToken.trim()}; path=/; max-age=604800; SameSite=Lax`;
      }

      console.log('发送POST请求:', {
        url,
        body,
        headers,
        withCredentials: true,
        withApiKey
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body || {}), // 确保body不是undefined
        credentials: 'include' // 确保发送cookie
      });

      const data = await response.json();
      console.log('响应数据:', data);

      setRequestResult({
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      });
    } catch (err) {
      console.error('请求出错:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // 登录获取JWT令牌
  const login = async () => {
    try {
      setError('');
      setRequestResult(null);

      // 根据本地代码，发起登录请求
      const response = await fetch('/api/support/user/account/loginByPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password: password // 注意：实际应用中应该对密码进行哈希处理
        })
      });

      const data = await response.json();
      console.log('登录响应:', data);

      if (data.data?.token) {
        localStorage.setItem('jwt_token', data.data.token);
        setJwtToken(data.data.token);

        // 设置Cookie，添加更完整的选项
        document.cookie = `fastgpt_token=${data.data.token.trim()}; path=/; max-age=604800; SameSite=Lax`;

        setRequestResult({
          status: response.status,
          message: '登录成功',
          token: data.data.token
        });
      } else {
        setError('登录失败: 响应中没有token');
      }
    } catch (err) {
      console.error('登录出错:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // 刷新令牌
  const refreshToken = async () => {
    try {
      setError('');
      // 使用proApi路径
      const response = await fetch('/api/proApi/support/user/account/refreshToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken.trim()}`
        }
      });

      const data = await response.json();
      console.log('刷新令牌响应:', data);

      if (data.data?.token) {
        localStorage.setItem('jwt_token', data.data.token);
        setJwtToken(data.data.token);
        // 设置Cookie，格式标准化
        document.cookie = `fastgpt_token=${data.data.token.trim()}; path=/; max-age=604800; SameSite=Lax`;
        setRequestResult({
          status: response.status,
          message: '令牌已刷新',
          token: data.data.token
        });
      } else {
        setError('刷新令牌失败: 响应中没有token');
      }
    } catch (err) {
      console.error('刷新令牌出错:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // 手动设置Cookie
  const setCookie = () => {
    try {
      if (jwtToken && jwtToken !== '未找到JWT令牌') {
        // 设置Cookie，添加更多选项
        document.cookie = `fastgpt_token=${jwtToken.trim()}; path=/; max-age=604800; SameSite=Lax`;
        alert('Cookie已设置');

        // 解析JWT令牌以显示信息
        try {
          const base64Url = jwtToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = atob(base64);
          const payload = JSON.parse(jsonPayload);

          setRequestResult({
            status: 200,
            message: 'Cookie已设置 (有效期7天)',
            data: payload
          });
        } catch (e) {
          console.error('解析JWT令牌失败:', e);
        }
      } else {
        setError('未找到JWT令牌，无法设置Cookie');
      }
    } catch (err) {
      console.error('设置Cookie出错:', err);
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <Box p={5}>
      <Heading as="h1" size="xl" mb={4}>
        JWT令牌测试页面
      </Heading>
      <Divider my={4} />

      <VStack align="start" spacing={4} mb={6}>
        <Heading as="h2" size="md">
          登录获取JWT令牌
        </Heading>
        <FormControl>
          <FormLabel>用户名</FormLabel>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} mb={2} />
          <FormLabel>密码</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            mb={2}
          />
        </FormControl>
        <Button colorScheme="blue" onClick={login}>
          登录
        </Button>
      </VStack>

      <VStack align="start" spacing={4} mb={6}>
        <Heading as="h2" size="md">
          当前JWT令牌
        </Heading>
        <Code p={2} borderRadius="md" width="100%" overflowX="auto">
          {jwtToken}
        </Code>
      </VStack>

      <VStack align="start" spacing={4} mb={6}>
        <Heading as="h2" size="md">
          测试操作
        </Heading>
        <Button
          colorScheme="blue"
          onClick={() =>
            testPostRequest(
              '/api/core/app/list',
              {
                parentId: null,
                type: null,
                getRecentlyChat: false,
                searchKey: ''
              },
              true,
              false
            )
          }
        >
          测试请求应用列表 (仅JWT令牌)
        </Button>
        <Button
          colorScheme="purple"
          onClick={() =>
            testPostRequest(
              '/api/core/app/list',
              {
                parentId: null,
                type: null,
                getRecentlyChat: false,
                searchKey: ''
              },
              true,
              true
            )
          }
        >
          测试请求应用列表 (JWT+API密钥)
        </Button>
        <Button
          colorScheme="green"
          onClick={() =>
            testPostRequest(
              '/api/core/app/list',
              {
                parentId: null,
                type: null,
                getRecentlyChat: false,
                searchKey: ''
              },
              false,
              false
            )
          }
        >
          测试请求应用列表 (不带认证)
        </Button>
        <Button
          colorScheme="yellow"
          onClick={() => testRequest('/api/proApi/support/user/team/list')}
        >
          测试proApi接口: 获取团队列表 (带JWT令牌)
        </Button>
        <Button
          colorScheme="orange"
          onClick={() =>
            testRequest('/api/proApi/support/user/team/plan/getTeamPlanStatus?maxQuantity=1')
          }
        >
          测试获取团队计划状态 (带JWT令牌)
        </Button>
        <Button colorScheme="purple" onClick={refreshToken}>
          刷新JWT令牌
        </Button>
        <Button colorScheme="pink" onClick={setCookie}>
          手动设置Cookie
        </Button>
        <Button
          colorScheme="cyan"
          onClick={async () => {
            try {
              setError('');
              setRequestResult(null);

              // 使用fetch API调用接口
              const response = await fetch('/api/core/app/list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken}`
                },
                body: JSON.stringify({}),
                credentials: 'include'
              });

              const data = await response.json();
              console.log('直接调用应用列表接口结果:', data);

              setRequestResult({
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
              });
            } catch (err) {
              console.error('直接调用应用列表接口出错:', err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          直接调用应用列表API
        </Button>
        <Button
          colorScheme="red"
          onClick={async () => {
            try {
              setError('');
              setRequestResult(null);

              // 解析JWT令牌获取关键信息
              let userId = '';
              let teamId = '';

              if (jwtToken && jwtToken !== '未找到JWT令牌') {
                try {
                  const base64Url = jwtToken.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = atob(base64);
                  const payload = JSON.parse(jsonPayload);
                  userId = payload.userId || '';
                  teamId = payload.teamId || '';
                  console.log('解析JWT令牌成功:', { userId, teamId });
                } catch (e) {
                  console.error('解析JWT令牌失败:', e);
                }
              }

              // 设置cookie - 这可能是关键
              document.cookie = `fastgpt_token=${jwtToken.trim()}; path=/; SameSite=Lax`;

              // 使用fetch API直接调用本地接口，但附加JWT信息
              const response = await fetch('/api/core/app/list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken.trim()}`,
                  ...(userId && { 'X-User-Id': userId }),
                  ...(teamId && { 'X-Team-Id': teamId })
                },
                body: JSON.stringify({
                  parentId: null,
                  type: null,
                  getRecentlyChat: false,
                  searchKey: ''
                }),
                credentials: 'include' // 确保发送cookie
              });

              const data = await response.json();
              console.log('改进认证的应用列表接口结果:', data);

              setRequestResult({
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
              });
            } catch (err) {
              console.error('改进认证的应用列表接口出错:', err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          改进认证方式调用应用列表
        </Button>
        <Button
          colorScheme="linkedin"
          onClick={async () => {
            try {
              setError('');
              setRequestResult(null);

              // 解析JWT令牌获取关键信息
              let userId = '';
              let teamId = '';

              if (jwtToken && jwtToken !== '未找到JWT令牌') {
                try {
                  const base64Url = jwtToken.split('.')[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = atob(base64);
                  const payload = JSON.parse(jsonPayload);
                  userId = payload.userId || '';
                  teamId = payload.teamId || '';
                  console.log('解析JWT令牌成功:', { userId, teamId });
                } catch (e) {
                  console.error('解析JWT令牌失败:', e);
                }
              }

              // 设置cookie - 这是关键
              document.cookie = `fastgpt_token=${jwtToken.trim()}; path=/; max-age=604800; SameSite=Lax`;

              // 使用fetch API直接调用本地接口，仅使用JWT令牌(无API密钥)
              const response = await fetch('/api/core/app/list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken.trim()}`,
                  ...(userId && { 'X-User-Id': userId }),
                  ...(teamId && { 'X-Team-Id': teamId })
                  // 故意不传入API密钥
                },
                body: JSON.stringify({
                  parentId: null,
                  type: null,
                  getRecentlyChat: false,
                  searchKey: ''
                }),
                credentials: 'include' // 确保发送cookie
              });

              const data = await response.json();
              console.log('无API密钥的应用列表接口结果:', data);

              setRequestResult({
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
              });
            } catch (err) {
              console.error('无API密钥的应用列表接口出错:', err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          无API密钥调用应用列表
        </Button>
        {/* API密钥设置 */}
        <Button
          colorScheme="teal"
          onClick={() => {
            const apiKey = prompt('请输入API密钥');
            if (apiKey) {
              localStorage.setItem('api_key', apiKey);
              alert('API密钥已保存');
            }
          }}
        >
          设置API密钥
        </Button>
        <Button
          colorScheme="yellow"
          onClick={() => {
            alert(`如何获取正确的API密钥:

1. 登录FastGPT后台
2. 进入[应用管理]页面
3. 选择一个已有应用或创建新应用
4. 点击[API访问]或[应用设置]
5. 找到[API密钥]部分
6. 创建新密钥或复制现有密钥
7. 回到测试页面点击"设置API密钥"按钮
8. 粘贴API密钥并确认

注意:
- 应用API密钥格式通常为"fastgpt-xxxx"
- API密钥不同于JWT令牌
- 确保使用的是应用专用API密钥而非通用密钥
- 密钥可能与特定应用绑定`);
          }}
        >
          如何获取API密钥?
        </Button>
        <Button
          colorScheme="facebook"
          onClick={async () => {
            try {
              const appApiKey = prompt(
                '请输入应用API密钥 (格式可能是 fastgpt-xxxx)\n\n获取方法：\n1. 在应用设置中创建API密钥\n2. 或从应用详情页复制现有API密钥\n3. 应用API密钥与JWT令牌不同'
              );
              if (!appApiKey) {
                alert('未输入API密钥，操作取消');
                return;
              }

              setError('');
              setRequestResult(null);

              // 尝试使用API密钥直接访问应用列表
              const response = await fetch('/api/core/app/list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${appApiKey.trim()}`
                },
                body: JSON.stringify({
                  parentId: null,
                  type: null,
                  getRecentlyChat: false,
                  searchKey: ''
                })
              });

              const data = await response.json();
              console.log('仅用应用API密钥请求结果:', data);

              setRequestResult({
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
              });
            } catch (err) {
              console.error('应用API密钥请求出错:', err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          使用应用API密钥访问
        </Button>
        <Button
          colorScheme="telegram"
          onClick={async () => {
            try {
              const apiKey = localStorage.getItem('api_key');
              if (!apiKey) {
                alert('请先设置API密钥');
                return;
              }

              setError('');
              setRequestResult(null);

              // 尝试直接使用API密钥访问创建应用API
              const response = await fetch('/api/core/app/create', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${jwtToken.trim()}`,
                  'X-API-KEY': apiKey.trim()
                },
                body: JSON.stringify({
                  name: '测试应用' + new Date().getTime(),
                  avatar: '/icon/logo.svg',
                  type: 'simple'
                }),
                credentials: 'include'
              });

              const data = await response.json();
              console.log('使用JWT+API密钥创建应用结果:', data);

              setRequestResult({
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
              });
            } catch (err) {
              console.error('创建应用请求出错:', err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          测试创建应用API
        </Button>
        <Button
          colorScheme="gray"
          onClick={async () => {
            try {
              const apiKey = localStorage.getItem('api_key');
              if (!apiKey) {
                alert('请先设置API密钥');
                return;
              }

              setError('');
              setRequestResult(null);

              // 使用X-API-KEY头尝试访问应用列表
              const response = await fetch('/api/core/app/list', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-API-KEY': apiKey.trim()
                  // 注意：这里不使用Authorization头
                },
                body: JSON.stringify({
                  parentId: null,
                  type: null,
                  getRecentlyChat: false,
                  searchKey: ''
                })
              });

              const data = await response.json();
              console.log('使用X-API-KEY头访问应用列表结果:', data);

              setRequestResult({
                status: response.status,
                headers: Object.fromEntries(response.headers.entries()),
                data
              });
            } catch (err) {
              console.error('X-API-KEY请求出错:', err);
              setError(err instanceof Error ? err.message : String(err));
            }
          }}
        >
          使用X-API-KEY头测试
        </Button>
      </VStack>

      {error && (
        <VStack align="start" spacing={2} mb={6} bg="red.50" p={3} borderRadius="md">
          <Heading as="h2" size="md" color="red.500">
            错误信息
          </Heading>
          <Text color="red.500">{error}</Text>
        </VStack>
      )}

      {requestResult && (
        <VStack align="start" spacing={2} mb={6}>
          <Heading as="h2" size="md">
            请求结果
          </Heading>
          <Text>
            <strong>状态码:</strong> {requestResult.status}
          </Text>
          {requestResult.message && (
            <Text>
              <strong>消息:</strong> {requestResult.message}
            </Text>
          )}
          {requestResult.headers && (
            <Box width="100%">
              <Text mb={1}>
                <strong>响应头:</strong>
              </Text>
              <Code p={2} borderRadius="md" width="100%" overflowX="auto">
                {JSON.stringify(requestResult.headers, null, 2)}
              </Code>
            </Box>
          )}
          {requestResult.data && (
            <Box width="100%">
              <Text mb={1}>
                <strong>响应数据:</strong>
              </Text>
              <Code p={2} borderRadius="md" width="100%" overflowX="auto">
                {JSON.stringify(requestResult.data, null, 2)}
              </Code>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}
