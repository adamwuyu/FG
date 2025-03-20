import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  SimpleGrid,
  Text,
  Code,
  Heading,
  Divider,
  Input,
  FormControl,
  HStack,
  VStack
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

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (withAuth && jwtToken && jwtToken !== '未找到JWT令牌') {
        headers['Authorization'] = `Bearer ${jwtToken.trim()}`;
        if (withApiKey) {
          const apiKey = localStorage.getItem('api_key');
          if (apiKey) {
            headers['X-API-KEY'] = apiKey.trim();
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body || {}),
        credentials: 'include'
      });

      const data = await response.json();
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

      const response = await fetch('/api/support/user/account/loginByPassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password: password
        })
      });

      const data = await response.json();

      if (data.data?.token) {
        localStorage.setItem('jwt_token', data.data.token);
        setJwtToken(data.data.token);
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
    <Box p={5} maxW="1200px" mx="auto">
      <Heading as="h1" size="xl" mb={4} textAlign="center">
        JWT令牌测试页面
      </Heading>
      <Divider my={4} />

      {/* 登录区域 - 单行布局 */}
      <HStack spacing={4} mb={6} align="flex-end">
        <FormControl maxW="200px">
          <Input
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            size="md"
          />
        </FormControl>
        <FormControl maxW="200px">
          <Input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            size="md"
          />
        </FormControl>
        <Button colorScheme="blue" onClick={login} size="md">
          登录
        </Button>
      </HStack>

      <VStack align="start" spacing={4} mb={6}>
        <Heading as="h2" size="md">
          当前JWT令牌
        </Heading>
        <Code p={2} borderRadius="md" width="100%" overflowX="auto" fontSize="xs">
          {jwtToken}
        </Code>
      </VStack>

      {/* 测试操作 - 多列网格布局 */}
      <VStack align="start" spacing={4} mb={6}>
        <Heading as="h2" size="md">
          测试操作
        </Heading>
        <SimpleGrid columns={[1, 2, 3]} spacing={4} width="100%">
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
            height="auto"
            py={2}
            whiteSpace="normal"
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
            height="auto"
            py={2}
            whiteSpace="normal"
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
            height="auto"
            py={2}
            whiteSpace="normal"
          >
            测试请求应用列表 (不带认证)
          </Button>
          <Button
            colorScheme="teal"
            onClick={() => {
              const apiKey = prompt('请输入API密钥');
              if (apiKey) {
                localStorage.setItem('api_key', apiKey);
                alert('API密钥已保存');
              }
            }}
            height="auto"
            py={2}
          >
            设置API密钥
          </Button>
        </SimpleGrid>
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
              <Code p={2} borderRadius="md" width="100%" overflowX="auto" fontSize="xs">
                {JSON.stringify(requestResult.headers, null, 2)}
              </Code>
            </Box>
          )}
          {requestResult.data && (
            <Box width="100%">
              <Text mb={1}>
                <strong>响应数据:</strong>
              </Text>
              <Code p={2} borderRadius="md" width="100%" overflowX="auto" fontSize="xs">
                {JSON.stringify(requestResult.data, null, 2)}
              </Code>
            </Box>
          )}
        </VStack>
      )}
    </Box>
  );
}
