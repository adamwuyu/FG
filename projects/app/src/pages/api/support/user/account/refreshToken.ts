import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@/service/response';
import { authJWT, createJWT } from '@/service/support/permission/controller';
import { connectToDatabase } from '@/service/mongo';
import { UserModel } from '@/service/models/user';

/**
 * 刷新JWT令牌
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return jsonRes(res, {
        code: 401,
        message: '未提供访问令牌'
      });
    }

    try {
      // 验证当前令牌
      const { userId } = await authJWT(token);

      // 查找用户信息
      const user = await UserModel.findById(userId);

      if (!user) {
        return jsonRes(res, {
          code: 401,
          message: '用户不存在'
        });
      }

      // 创建新令牌
      const newToken = createJWT({
        _id: String(user._id),
        team: user.team
          ? {
              teamId: user.team.teamId,
              tmbId: user.team.tmbId
            }
          : undefined,
        isRoot: !!user.isRoot
      });

      return jsonRes<{ token: string }>(res, {
        data: { token: newToken }
      });
    } catch (error) {
      return jsonRes(res, {
        code: 401,
        message: '无效的访问令牌'
      });
    }
  } catch (error) {
    console.error('刷新令牌出错', error);
    return jsonRes(res, {
      code: 500,
      message: '刷新令牌失败'
    });
  }
}
