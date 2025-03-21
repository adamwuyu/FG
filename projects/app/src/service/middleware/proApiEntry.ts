import { NextApiRequest, NextApiResponse } from 'next';
import { withNextCors } from '@fastgpt/service/common/middle/cors';
import { jsonRes } from '@fastgpt/service/common/response';
import { addLog } from '@fastgpt/service/common/system/log';
import { connectToDatabase } from '@/service/mongo';
import { request } from 'http';
import { FastGPTProUrl } from '@fastgpt/service/common/system/constants';

/**
 * 处理proApi路由请求的中间件
 * 无需进行本地JWT验证，直接转发请求到proApi服务
 */
export const ProApiEntry = () => {
  return async function proApiHandler(req: NextApiRequest, res: NextApiResponse) {
    const start = Date.now();
    addLog.debug(`ProApi request start ${req.url}`);

    try {
      // 允许跨域
      await withNextCors(req, res);

      // 连接数据库
      await connectToDatabase();

      // 解析路径
      const { path = [], ...query } = req.query as any;
      const requestPath = `/api/${path?.join('/')}?${new URLSearchParams(query).toString()}`;

      if (!requestPath) {
        throw new Error('url is empty');
      }
      if (!FastGPTProUrl) {
        throw new Error(`未配置商业版链接: ${path}`);
      }

      // 解析proApi服务URL
      const parsedUrl = new URL(FastGPTProUrl);
      delete req.headers?.rootkey;

      // 创建请求并转发
      const requestResult = request({
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: requestPath,
        method: req.method,
        headers: req.headers
      });
      req.pipe(requestResult);

      // 处理响应
      requestResult.on('response', (response) => {
        Object.keys(response.headers).forEach((key) => {
          // @ts-ignore
          res.setHeader(key, response.headers[key]);
        });
        response.statusCode && res.writeHead(response.statusCode);
        response.pipe(res);
      });

      // 处理错误
      requestResult.on('error', (e) => {
        addLog.error(`ProApi request error: ${e.message}`);
        res.status(500).send(e);
        res.end();
      });

      // 记录请求时间
      const duration = Date.now() - start;
      if (duration < 2000) {
        addLog.debug(`ProApi request finish ${req.url}, time: ${duration}ms`);
      } else {
        addLog.warn(`ProApi request finish ${req.url}, time: ${duration}ms`);
      }
    } catch (error: any) {
      addLog.error(`ProApi forwarding error: ${error.message}`);
      jsonRes(res, {
        code: 500,
        error,
        url: req.url
      });
    }
  };
};

// 配置不解析请求体
export const proApiConfig = {
  api: {
    bodyParser: false
  }
};
