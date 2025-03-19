import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import type { PostLoginProps } from '@fastgpt/global/support/user/api.d';
import { UserStatusEnum } from '@fastgpt/global/support/user/constant';
import { NextAPI } from '@/service/middleware/entry';
import { useIPFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { pushTrack } from '@fastgpt/service/common/middle/tracks/utils';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { UserErrEnum } from '@fastgpt/global/common/error/code/user';
import axios from 'axios';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    const { username, password } = req.body as PostLoginProps;

    if (!username || !password) {
      return Promise.reject(CommonErrEnum.invalidParams);
    }

    // 检测用户是否存在
    const authCert = await MongoUser.findOne(
      {
        username
      },
      'status'
    );
    if (!authCert) {
      return Promise.reject(UserErrEnum.account_psw_error);
    }

    if (authCert.status === UserStatusEnum.forbidden) {
      return Promise.reject('Invalid account!');
    }

    const user = await MongoUser.findOne({
      username,
      password
    });

    if (!user) {
      console.log(username, password);
      return Promise.reject(UserErrEnum.account_psw_error);
    }

    const userDetail = await getUserDetail({
      tmbId: user?.lastLoginTmbId,
      userId: user._id
    });

    MongoUser.findByIdAndUpdate(user._id, {
      lastLoginTmbId: userDetail.team.tmbId
    });

    pushTrack.login({
      type: 'password',
      uid: user._id,
      teamId: userDetail.team.teamId,
      tmbId: userDetail.team.tmbId
    });

    // 调用 proApi 获取 token
    if (!FastGPTProUrl) {
      throw new Error('未配置商业版链接');
    }

    try {
      console.log(`尝试调用 proApi 接口: ${FastGPTProUrl}/support/user/auth/login`);

      // 调用 proApi 的认证接口获取 token
      const proApiResponse = await axios.post(
        `${FastGPTProUrl}/support/user/auth/login`,
        {
          username,
          password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('proApi 响应状态:', proApiResponse.status);
      console.log('proApi 响应数据:', JSON.stringify(proApiResponse.data, null, 2));

      // 从 proApi 响应中获取 token
      const token = proApiResponse.data?.data?.token;

      if (!token) {
        console.error('proApi 响应中没有 token:', proApiResponse.data);
        throw new Error('获取 token 失败');
      }

      // 返回用户信息和 token 给前端
      // 注意：前端的 checkRes 函数会提取 data.data 字段，然后 handleLoginResponse 函数期望收到 { user, token } 结构
      // ResLogin 类型定义为 { user: UserType; token: string; }
      return jsonRes(res, {
        data: {
          // 这里必须是 token 和 user，而不是嵌套在另一个对象中
          token: token,
          user: userDetail
        }
      });
    } catch (proApiError: any) {
      console.error('调用 proApi 认证接口失败:', proApiError.message);
      if (proApiError.response) {
        console.error('响应状态:', proApiError.response.status);
        console.error('响应数据:', JSON.stringify(proApiError.response.data, null, 2));
      }
      throw new Error(`获取认证令牌失败: ${proApiError.message}`);
    }
  } catch (error) {
    console.error('登录出错', error);
    jsonRes(res, {
      code: 500,
      message: error instanceof Error ? error.message : '登录失败',
      error
    });
  }
}

export default NextAPI(
  useIPFrequencyLimit({ id: 'login-by-password', seconds: 120, limit: 10, force: true }),
  handler
);
