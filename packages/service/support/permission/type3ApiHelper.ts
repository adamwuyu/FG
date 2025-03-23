/**
 * 类型3接口辅助函数
 * 用于从请求中获取JWT令牌并使用它调用proApi服务
 */

import { getJwtTokenFromReq } from './controller';
import { GET, POST, PUT, DELETE } from '../../common/api/plusRequest';

/**
 * 从请求中获取JWT令牌，并提供一组使用该令牌调用proApi服务的函数
 * @param req 请求对象
 * @returns 包含调用proApi服务的GET、POST、PUT、DELETE方法的对象
 */
export const getProApiClient = (req: any) => {
  const jwtToken = getJwtTokenFromReq(req);

  // 准备配置对象，只有当令牌存在时才添加
  const config = jwtToken ? { jwtToken } : {};

  return {
    /**
     * 使用GET方法调用proApi服务
     * @param url proApi服务的路径（不包含baseUrl）
     * @param params 请求参数
     * @returns 服务响应
     */
    GET: <T = any>(url: string, params = {}) => GET<T>(url, params, config),

    /**
     * 使用POST方法调用proApi服务
     * @param url proApi服务的路径（不包含baseUrl）
     * @param data 请求数据
     * @returns 服务响应
     */
    POST: <T = any>(url: string, data = {}) => POST<T>(url, data, config),

    /**
     * 使用PUT方法调用proApi服务
     * @param url proApi服务的路径（不包含baseUrl）
     * @param data 请求数据
     * @returns 服务响应
     */
    PUT: <T = any>(url: string, data = {}) => PUT<T>(url, data, config),

    /**
     * 使用DELETE方法调用proApi服务
     * @param url proApi服务的路径（不包含baseUrl）
     * @param data 请求数据
     * @returns 服务响应
     */
    DELETE: <T = any>(url: string, data = {}) => DELETE<T>(url, data, config)
  };
};
