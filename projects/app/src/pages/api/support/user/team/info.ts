import { connectToDatabase } from '@/service/mongo';
import { getProApiClient } from '@fastgpt/service/support/permission/type3ApiHelper';
import { jsonRes } from '@fastgpt/service/common/response';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ReadPermissionVal } from '@fastgpt/global/support/permission/constant';
import { NextApiRequest, NextApiResponse } from 'next';

interface TeamInfoResponse {
  name: string;
  avatar?: string;
  membersCount: number;
  maxMembers: number;
  role: string;
  createTime: Date;
}

/**
 * 团队信息接口 - 类型3接口实现
 * 使用Cookie进行用户认证，并从用户会话获取JWT令牌传递给proApi服务
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    try {
      // 验证用户权限
      const { teamId } = await authUserPer({
        req,
        per: ReadPermissionVal
      });

      // 使用type3ApiHelper访问proApi服务
      try {
        // 创建proApi客户端
        const proApiClient = getProApiClient(req);

        // 调用团队信息接口
        const result = await proApiClient.GET<TeamInfoResponse>('/support/user/team/info');

        // 返回结果
        return jsonRes(res, {
          data: result
        });
      } catch (error: any) {
        // 处理proApi调用错误
        console.error('获取团队信息失败', error);

        // 如果错误信息表明是未提供访问令牌，返回一个本地实现的结果（降级策略）
        if (
          error.message &&
          (error.message.includes('未提供访问令牌') || error.message.includes('您请求的接口不存在'))
        ) {
          console.log('无法获取团队信息，降级到本地实现');
          return jsonRes(res, {
            data: {
              name: 'Default Team',
              membersCount: 1,
              maxMembers: 10,
              role: 'owner',
              createTime: new Date()
            }
          });
        }

        throw error;
      }
    } catch (error: any) {
      // 认证错误
      if (error.message === 'unAuthorization' || error.code === 401 || error.code === 403) {
        return jsonRes(res, {
          code: error.code || 401,
          statusText: 'unAuthorization',
          message: '用户未登录或权限不足',
          httpStatusCode: error.code || 401
        });
      }

      throw error;
    }
  } catch (error: any) {
    console.error('获取团队信息失败', error);

    return jsonRes(res, {
      code: error.code || 500,
      message: typeof error === 'string' ? error : error.message || '获取团队信息失败',
      httpStatusCode: error.code >= 400 && error.code < 600 ? error.code : 500
    });
  }
}
