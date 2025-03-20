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
  const testPostRequest = async (url: string, body: any, withAuth: boolean = true) => {
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

      console.log('发送POST请求:', {
        url,
        body,
        headers
      });

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
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
      // 使用项目中找到的正确路径
      const response = await fetch('/api/support/user/account/refreshToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
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
            testPostRequest('/api/core/app/list', {
              type: undefined,
              parentId: undefined,
              searchKey: undefined,
              getRecentlyChat: false
            })
          }
        >
          测试请求应用列表 (带JWT令牌)
        </Button>
        <Button
          colorScheme="green"
          onClick={() =>
            testPostRequest(
              '/api/core/app/list',
              {
                type: undefined,
                parentId: undefined,
                searchKey: undefined,
                getRecentlyChat: false
              },
              false
            )
          }
        >
          测试请求应用列表 (不带JWT令牌)
        </Button>
        <Button
          colorScheme="yellow"
          onClick={() => testRequest('/api/proApi/support/user/team/list')}
        >
          测试proApi接口: 获取团队列表 (带JWT令牌)
        </Button>
        <Button colorScheme="purple" onClick={refreshToken}>
          刷新JWT令牌
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
