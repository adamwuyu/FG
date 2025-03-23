import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getProApiClient } from '@fastgpt/service/support/permission/type3ApiHelper';

/**
 * 获取未读消息数量 - 类型3接口示例
 * 使用Cookie进行用户认证，并从用户会话获取JWT令牌传递给proApi服务
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    // 使用Cookie认证用户身份
    const { userId } = await authCert({ req });

    // 使用type3ApiHelper访问proApi服务
    const proApiClient = getProApiClient(req);

    try {
      // 尝试调用proApi服务
      const result = await proApiClient.GET('/support/user/inform/countUnread', { userId });

      return jsonRes(res, {
        data: result
      });
    } catch (error: any) {
      // 如果是"未提供访问令牌"错误，降级到本地实现
      if (error.message === '未提供访问令牌') {
        console.log('降级到本地实现', error.message);
        // 本地实现：返回默认的未读消息数量为0
        return jsonRes(res, {
          data: { unreadCount: 0 }
        });
      }
      // 其他错误则抛出
      throw error;
    }
  } catch (error: any) {
    console.error('获取未读消息数量失败', error);

    // 处理认证错误，使用401 HTTP状态码
    if (error.message === 'unAuthorization' || error.code === 401) {
      return jsonRes(res, {
        code: 401,
        message: '用户未登录或认证失败',
        httpStatusCode: 401
      });
    }

    // 确保错误响应使用正确的HTTP状态码
    return jsonRes(res, {
      code: error.code || 500,
      message: typeof error === 'string' ? error : error.message || '获取未读消息数量失败',
      httpStatusCode: error.code >= 400 && error.code < 600 ? error.code : 500
    });
  }
}
