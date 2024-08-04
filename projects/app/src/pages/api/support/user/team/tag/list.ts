import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getTeamsTags } from '@fastgpt/service/support/user/team/controller';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    // 连接到数据库
    await connectToDatabase();

    // 权限验证
    const { teamId } = await authCert({
      req,
      authToken: true
    });

    // 获取团队标签
    const tags = await getTeamsTags({ teamId });

    // 返回标签数据
    jsonRes(res, {
      data: tags
    });
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
