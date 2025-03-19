import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { request } from 'http';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';

/**
 * 刷新JWT令牌 - 转发到 proApi 服务
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await connectToDatabase();

    if (!FastGPTProUrl) {
      throw new Error('未配置商业版链接');
    }

    // 构建请求路径
    const requestPath = `/api/support/user/account/refreshToken`;
    const parsedUrl = new URL(FastGPTProUrl);

    // 创建转发请求
    const requestResult = request({
      protocol: parsedUrl.protocol,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: requestPath,
      method: req.method,
      headers: req.headers
    });

    // 转发请求体
    req.pipe(requestResult);

    // 处理响应
    requestResult.on('response', (response) => {
      // 转发响应头
      Object.keys(response.headers).forEach((key) => {
        // @ts-ignore
        res.setHeader(key, response.headers[key]);
      });

      // 转发状态码和响应体
      response.statusCode && res.writeHead(response.statusCode);
      response.pipe(res);
    });

    // 处理错误
    requestResult.on('error', (e) => {
      console.error('刷新令牌转发出错', e);
      res.send(e);
      res.end();
    });
  } catch (error) {
    console.error('刷新令牌出错', error);
    jsonRes(res, {
      code: 500,
      message: '刷新令牌失败',
      error
    });
  }
}

// 禁用默认的请求体解析，以便正确转发请求体
export const config = {
  api: {
    bodyParser: false
  }
};
