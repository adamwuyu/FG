import { ProApiEntry, proApiConfig } from '@/service/middleware/proApiEntry';

// 使用专用的proApi请求中间件处理类型1接口请求
// 无需进行本地JWT验证，直接转发请求到proApi服务
export default ProApiEntry();

// 配置不解析请求体
export const config = proApiConfig;
