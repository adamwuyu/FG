import { GET, POST, PUT } from '@/web/common/api/request';
import { hashStr } from '@fastgpt/global/common/string/tools';
import type { ResLogin } from '@/global/support/api/userRes.d';
import { UserAuthTypeEnum } from '@fastgpt/global/support/user/auth/constants';
import { UserUpdateParams } from '@/types/user';
import { UserType } from '@fastgpt/global/support/user/type.d';
import type {
  FastLoginProps,
  OauthLoginProps,
  PostLoginProps
} from '@fastgpt/global/support/user/api.d';
import {
  AccountRegisterBody,
  GetWXLoginQRResponse
} from '@fastgpt/global/support/user/login/api.d';

export const sendAuthCode = (data: {
  username: string;
  type: `${UserAuthTypeEnum}`;
  googleToken: string;
  captcha: string;
}) => POST(`/proApi/support/user/inform/sendAuthCode`, data);

export const getTokenLogin = () =>
  GET<UserType>('/support/user/account/tokenLogin', {}, { maxQuantity: 1 });
// 处理登录响应，存储JWT令牌
function handleLoginResponse(response: ResLogin) {
  if (response.token) {
    localStorage.setItem('jwt_token', response.token);
  }
  return response;
}

export const oauthLogin = (params: OauthLoginProps) =>
  POST<ResLogin>('/proApi/support/user/account/login/oauth', params).then(handleLoginResponse);
export const postFastLogin = (params: FastLoginProps) =>
  POST<ResLogin>('/proApi/support/user/account/login/fastLogin', params).then(handleLoginResponse);
export const ssoLogin = (params: any) =>
  GET<ResLogin>('/proApi/support/user/account/sso', params).then(handleLoginResponse);

export const postRegister = ({
  username,
  password,
  code,
  inviterId,
  bd_vid,
  fastgpt_sem
}: AccountRegisterBody) =>
  POST<ResLogin>(`/proApi/support/user/account/register/emailAndPhone`, {
    username,
    code,
    inviterId,
    bd_vid,
    fastgpt_sem,
    password: hashStr(password)
  }).then(handleLoginResponse);

export const postFindPassword = ({
  username,
  code,
  password
}: {
  username: string;
  code: string;
  password: string;
}) =>
  POST<ResLogin>(`/proApi/support/user/account/password/updateByCode`, {
    username,
    code,
    password: hashStr(password)
  });

export const updatePasswordByOld = ({ oldPsw, newPsw }: { oldPsw: string; newPsw: string }) =>
  POST('/support/user/account/updatePasswordByOld', {
    oldPsw: hashStr(oldPsw),
    newPsw: hashStr(newPsw)
  });

export const updateNotificationAccount = (data: { account: string; verifyCode: string }) =>
  PUT('/proApi/support/user/team/updateNotificationAccount', data);

export const postLogin = ({ password, ...props }: PostLoginProps) =>
  POST<ResLogin>('/support/user/account/loginByPassword', {
    ...props,
    password: hashStr(password)
  }).then(handleLoginResponse);

export const loginOut = () => {
  // 清除JWT令牌
  localStorage.removeItem('jwt_token');
  return GET('/support/user/account/loginout');
};

export const putUserInfo = (data: UserUpdateParams) => PUT('/support/user/account/update', data);

export const getWXLoginQR = () =>
  GET<GetWXLoginQRResponse>('/proApi/support/user/account/login/wx/getQR');

export const getWXLoginResult = (code: string) =>
  GET<ResLogin>(`/proApi/support/user/account/login/wx/getResult`, { code }).then(
    handleLoginResponse
  );

export const getCaptchaPic = (username: string) =>
  GET<{
    captchaImage: string;
  }>('/proApi/support/user/account/captcha/getImgCaptcha', { username });

export const postSyncMembers = () => POST('/proApi/support/user/team/org/sync');

// Adam: 封装积分改动
export const consume = ({ userId, points }: { userId: string; points: number }) =>
  POST('/support/user/points/consume', { userId, points });

// 刷新JWT令牌
export const refreshToken = () =>
  GET<{ token: string }>('/proApi/support/user/account/refreshToken').then((response) => {
    if (response.token) {
      localStorage.setItem('jwt_token', response.token);
    }
    return response;
  });
