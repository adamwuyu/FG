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

  /* 疑问：mongo数据库的users表中有记录：{
  "_id": {
    "$oid": "67b1312ad9d41c2d4f2b5ce0"
  },
  "status": "active",
  "username": "root",
  "password": "aaaaaa",
  "promotionRate": 15,
  "timezone": "Asia/Shanghai",
  "createTime": {
    "$date": "2025-02-16T00:28:26.059Z"
  },
  "__v": 0
}
  为什么username=root, password=aaaaaa时，这里会查不到？findOne的核心逻辑是什么？在哪儿定义的
  */
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

  return {
    user: userDetail,
    token
  };
}

export default NextAPI(
  useIPFrequencyLimit({ id: 'login-by-password', seconds: 120, limit: 10, force: true }),
  handler
);
