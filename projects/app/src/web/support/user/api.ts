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
  console.log('登录响应:', response);
  if (response.token) {
    console.log('设置 token:', response.token);
    localStorage.setItem('jwt_token', response.token);
    // 验证是否成功保存
    const savedToken = localStorage.getItem('jwt_token');
    console.log('保存后的 token:', savedToken);
  } else {
    console.error('响应中没有 token:', response);
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

export const postLogin = ({ password, ...props }: PostLoginProps) => {
  console.log('开始登录请求，参数:', { ...props, password: '******' });

  return POST<ResLogin>('/support/user/account/loginByPassword', {
    ...props,
    password: hashStr(password)
  })
    .then((response) => {
      console.log('登录请求响应:', response);

      // 检查响应结构
      if (!response) {
        console.error('响应为空');
        return response;
      }

      // 注意: POST 函数已经通过 checkRes 提取了 data.data
      // 所以 response 应该已经是 { token, user } 格式
      console.log('处理登录响应:', response);

      // 直接将响应传递给 handleLoginResponse 函数
      return handleLoginResponse(response);
    })
    .catch((error) => {
      console.error('登录请求出错:', error);
      throw error;
    });
};

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
