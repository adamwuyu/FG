import type { NextApiResponse } from 'next';

export const jsonRes = <T = any>(
  res: NextApiResponse,
  props?: {
    code?: number;
    statusText?: string;
    message?: string;
    data?: T;
    httpStatusCode?: number;
  }
) => {
  if (!res) return;

  const { code = 200, statusText = '', message = '', data = null, httpStatusCode } = props || {};

  const httpCode = httpStatusCode || (code >= 400 ? code : 200);

  res.setHeader('Cache-Control', 'no-store');

  return res.status(httpCode).json({
    code,
    statusText,
    message,
    data
  });
};
