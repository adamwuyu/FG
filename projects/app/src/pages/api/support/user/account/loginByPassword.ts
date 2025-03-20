import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import type { PostLoginProps } from '@fastgpt/global/support/user/api.d';
import { UserStatusEnum } from '@fastgpt/global/support/user/constant';
import { NextAPI } from '@/service/middleware/entry';
import { useIPFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { pushTrack } from '@fastgpt/service/common/middle/tracks/utils';
import { CommonErrEnum } from '@fastgpt/global/common/error/code/common';
import { UserErrEnum } from '@fastgpt/global/common/error/code/user';
import { POST } from '@fastgpt/service/common/api/plusRequest';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';

async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const token = createJWT({
    ...userDetail,
    isRoot: username === 'root'
  });

  setCookie(res, token);

  let proToken = '';
  // 如果配置了proApi服务，获取JWT令牌
  if (FastGPTProUrl) {
    try {
      // 调用proApi获取JWT令牌
      const proTokenResponse = await POST<{ token: string }>('/support/user/account/getJwtToken', {
        userId: user._id.toString(),
        teamId: userDetail.team.teamId,
        tmbId: userDetail.team.tmbId,
        isRoot: username === 'root'
      });
      proToken = proTokenResponse.token;
    } catch (err) {
      console.error('获取proApi令牌失败', err);
      // 不影响本地登录，继续执行
    }
  }

  return {
    user: userDetail,
    token: proToken || token // 优先返回proApi令牌，如果获取失败则使用本地令牌
  };
}

export default NextAPI(
  useIPFrequencyLimit({ id: 'login-by-password', seconds: 120, limit: 10, force: true }),
  handler
);
