import { Permission } from '@fastgpt/global/support/permission/controller';
import { ApiRequestProps } from '../../type/next';
import type { PermissionValueType } from '@fastgpt/global/support/permission/type';
import { RequireAtLeastOne } from '@fastgpt/global/common/type/utils';
import { AuthUserTypeEnum } from '@fastgpt/global/support/permission/constant';

export type ReqHeaderAuthType = {
  cookie?: string;
  token?: string;
  apikey?: string; // abandon
  rootkey?: string;
  userid?: string;
  authorization?: string;
};

type authModeType = {
  req: ApiRequestProps;
  authToken?: boolean;
  authRoot?: boolean;
  authApiKey?: boolean;
  per?: PermissionValueType;
};

// 修改为允许不指定认证类型，默认将使用Cookie认证
export type AuthModeType = authModeType;

export type AuthResponseType<T extends Permission = Permission> = {
  userId: string;
  teamId: string;
  tmbId: string;
  authType?: `${AuthUserTypeEnum}`;
  appId?: string;
  apikey?: string;
  isRoot: boolean;
  permission: T;
};
