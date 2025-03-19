import axios, {
  Method,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosProgressEvent
} from 'axios';
import { clearToken } from '@/web/support/user/auth';
import { TOKEN_ERROR_CODE } from '@fastgpt/global/common/error/errorCode';
import { TeamErrEnum } from '@fastgpt/global/common/error/code/team';
import { useSystemStore } from '../system/useSystemStore';
import { getWebReqUrl } from '@fastgpt/web/common/system/utils';
import { i18nT } from '@fastgpt/web/i18n/utils';
import { getNanoid } from '@fastgpt/global/common/string/tools';
import { refreshToken } from '@/web/support/user/api';

// 检查令牌是否即将过期
function isTokenExpiringSoon() {
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    // 解析JWT令牌
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;

    // 如果令牌在30分钟内过期，则返回true
    const expiresIn = exp - Math.floor(Date.now() / 1000);
    return expiresIn > 0 && expiresIn < 30 * 60; // 30分钟
  } catch (error) {
    console.error('检查令牌过期时间出错', error);
    return false;
  }
}

// 刷新令牌
let isRefreshing = false;
let failedQueue: { resolve: Function; reject: Function }[] = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

function handleTokenRefresh() {
  if (isRefreshing) {
    // 如果正在刷新，返回一个待处理的Promise
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  // 刷新令牌
  return refreshToken()
    .then((response) => {
      const newToken = response.token;
      processQueue(null, newToken);
      return newToken;
    })
    .catch((error) => {
      processQueue(error);
      throw error;
    })
    .finally(() => {
      isRefreshing = false;
    });
}

interface ConfigType {
  headers?: { [key: string]: string };
  timeout?: number;
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void;
  cancelToken?: AbortController;
  maxQuantity?: number; // The maximum number of simultaneous requests, usually used to cancel old requests
  withCredentials?: boolean;
}
interface ResponseDataType {
  code: number;
  message: string;
  data: any;
}

const maxQuantityMap: Record<
  string,
  | undefined
  | {
      id: string;
      sign: AbortController;
    }[]
> = {};

/* 
  Every request generates a unique sign
  If the number of requests exceeds maxQuantity, cancel the earliest request and initiate a new request
*/
function checkMaxQuantity({ url, maxQuantity }: { url: string; maxQuantity?: number }) {
  if (!maxQuantity) return {};
  const item = maxQuantityMap[url];
  const id = getNanoid();
  const sign = new AbortController();

  if (item && item.length > 0) {
    if (item.length >= maxQuantity) {
      const firstSign = item.shift();
      firstSign?.sign.abort();
    }
    item.push({ id, sign });
  } else {
    maxQuantityMap[url] = [{ id, sign }];
  }
  return {
    id,
    abortSignal: sign?.signal
  };
}

function requestFinish({ signId, url }: { signId?: string; url: string }) {
  const item = maxQuantityMap[url];
  if (item) {
    if (signId) {
      const index = item.findIndex((item) => item.id === signId);
      if (index !== -1) {
        item.splice(index, 1);
      }
    }
    if (item.length <= 0) {
      delete maxQuantityMap[url];
    }
  }
}

/**
 * 请求开始
 */
function startInterceptors(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  if (config.headers) {
    // 检查是否为proApi请求
    if (config.url && config.url.includes('proApi')) {
      // 检查令牌是否即将过期
      if (isTokenExpiringSoon() && !config.url.includes('/refreshToken')) {
        // 如果令牌即将过期且不是刷新令牌的请求，则先刷新令牌
        return handleTokenRefresh()
          .then((newToken) => {
            // 使用新令牌
            if (newToken && config.headers) {
              config.headers['Authorization'] = `Bearer ${newToken}`;
            }
            return config;
          })
          .catch(() => {
            // 刷新失败时仍然使用原有令牌
            const token = localStorage.getItem('jwt_token');
            if (token && config.headers) {
              config.headers['Authorization'] = `Bearer ${token}`;
            }
            return config;
          }) as any;
      } else {
        // 从localStorage获取JWT令牌
        const token = localStorage.getItem('jwt_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }
  }

  return config;
}

/**
 * 请求成功,检查请求头
 */
function responseSuccess(response: AxiosResponse<ResponseDataType>) {
  return response;
}
/**
 * 响应数据检查
 */
function checkRes(data: ResponseDataType) {
  if (data === undefined) {
    console.log('error->', data, 'data is empty');
    return Promise.reject('服务器异常');
  } else if (data.code < 200 || data.code >= 400) {
    return Promise.reject(data);
  }
  return data.data;
}

/**
 * 响应错误
 */
function responseError(err: any) {
  console.log('error->', '请求错误', err);
  const data = err?.response?.data || err;

  if (!err) {
    return Promise.reject({ message: '未知错误' });
  }
  if (typeof err === 'string') {
    return Promise.reject({ message: err });
  }
  if (typeof data === 'string') {
    return Promise.reject(data);
  }

  // 有报错响应
  if (data?.code in TOKEN_ERROR_CODE) {
    if (!['/chat/share', '/chat/team', '/login'].includes(window.location.pathname)) {
      clearToken();
      window.location.replace(
        getWebReqUrl(`/login?lastRoute=${encodeURIComponent(location.pathname + location.search)}`)
      );
    }

    return Promise.reject({ message: i18nT('common:unauth_token') });
  }

  // 处理JWT认证错误
  if (data?.code === 401) {
    // 检查是否是令牌过期错误
    if (data?.message === '访问令牌已过期') {
      // 尝试刷新令牌
      return handleTokenRefresh()
        .then(() => {
          // 令牌刷新成功，重试原始请求
          const config = err.config;
          // 确保不会进入无限循环
          config._retry = true;

          // 使用新令牌更新请求头
          const token = localStorage.getItem('jwt_token');
          if (token && config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }

          // 重新发送请求
          return axios(config);
        })
        .catch(() => {
          // 令牌刷新失败，清除令牌并重定向到登录页面
          localStorage.removeItem('jwt_token');

          // 仅在非登录页面时重定向
          if (!['/chat/share', '/chat/team', '/login'].includes(window.location.pathname)) {
            clearToken();
            window.location.replace(
              getWebReqUrl(
                `/login?lastRoute=${encodeURIComponent(location.pathname + location.search)}`
              )
            );
          }

          return Promise.reject({ message: i18nT('common:unauth_token') });
        });
    } else if (
      data?.message === '未提供访问令牌' ||
      data?.message === '无效的访问令牌' ||
      data?.message === '用户不存在'
    ) {
      // 清除JWT令牌
      localStorage.removeItem('jwt_token');

      // 仅在非登录页面时重定向
      if (!['/chat/share', '/chat/team', '/login'].includes(window.location.pathname)) {
        clearToken();
        window.location.replace(
          getWebReqUrl(
            `/login?lastRoute=${encodeURIComponent(location.pathname + location.search)}`
          )
        );
      }

      return Promise.reject({ message: i18nT('common:unauth_token') });
    }
  }
  if (
    data?.statusText === TeamErrEnum.aiPointsNotEnough ||
    data?.statusText === TeamErrEnum.datasetSizeNotEnough ||
    data?.statusText === TeamErrEnum.datasetAmountNotEnough ||
    data?.statusText === TeamErrEnum.appAmountNotEnough ||
    data?.statusText === TeamErrEnum.pluginAmountNotEnough ||
    data?.statusText === TeamErrEnum.websiteSyncNotEnough ||
    data?.statusText === TeamErrEnum.reRankNotEnough
  ) {
    useSystemStore.getState().setNotSufficientModalType(data.statusText);
    return Promise.reject(data);
  }
  return Promise.reject(data);
}

/* 创建请求实例 */
const instance = axios.create({
  timeout: 60000, // 超时时间
  headers: {
    'content-type': 'application/json'
  }
});

/* 请求拦截 */
instance.interceptors.request.use(startInterceptors, (err) => Promise.reject(err));
/* 响应拦截 */
instance.interceptors.response.use(responseSuccess, (err) => Promise.reject(err));

function request(
  url: string,
  data: any,
  { cancelToken, maxQuantity, withCredentials, ...config }: ConfigType,
  method: Method
): any {
  /* 去空 */
  for (const key in data) {
    if (data[key] === undefined) {
      delete data[key];
    }
  }

  const { id: signId, abortSignal } = checkMaxQuantity({ url, maxQuantity });

  return instance
    .request({
      baseURL: getWebReqUrl('/api'),
      url,
      method,
      data: ['POST', 'PUT'].includes(method) ? data : undefined,
      params: !['POST', 'PUT'].includes(method) ? data : undefined,
      signal: cancelToken?.signal ?? abortSignal,
      withCredentials,
      ...config // 用户自定义配置，可以覆盖前面的配置
    })
    .then((res) => checkRes(res.data))
    .catch((err) => responseError(err))
    .finally(() => requestFinish({ signId, url }));
}

/**
 * api请求方式
 * @param {String} url
 * @param {Any} params
 * @param {Object} config
 * @returns
 */
export function GET<T = undefined>(url: string, params = {}, config: ConfigType = {}): Promise<T> {
  return request(url, params, config, 'GET');
}

export function POST<T = undefined>(url: string, data = {}, config: ConfigType = {}): Promise<T> {
  return request(url, data, config, 'POST');
}

export function PUT<T = undefined>(url: string, data = {}, config: ConfigType = {}): Promise<T> {
  return request(url, data, config, 'PUT');
}

export function DELETE<T = undefined>(url: string, data = {}, config: ConfigType = {}): Promise<T> {
  return request(url, data, config, 'DELETE');
}
