import { parseHeaderCert } from '../controller';
import { AuthModeType } from '../type';
import { SERVICE_LOCAL_HOST } from '../../../common/system/tools';
import { ApiRequestProps } from '../../../type/next';

export const authCert = async (props: AuthModeType) => {
  const result = await parseHeaderCert(props);

  return {
    ...result,
    isOwner: true,
    canWrite: true
  };
};

// 新增专门用于类型2接口的Cookie认证函数
// 该函数不使用JWT认证，只使用Cookie认证
export const authCookieCert = async (
  props: Omit<AuthModeType, 'authToken'> & { req: ApiRequestProps }
) => {
  // 将authToken设置为false，确保只使用Cookie认证
  const result = await parseHeaderCert({
    ...props,
    authToken: false
  });

  return {
    ...result,
    isOwner: true,
    canWrite: true
  };
};

/* auth the request from local service */
export const authRequestFromLocal = ({ req }: { req: ApiRequestProps }) => {
  if (req.headers.host !== SERVICE_LOCAL_HOST) {
    return Promise.reject('Invalid request');
  }
};
