import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    PRO_URL: process.env.PRO_URL,
    NODE_ENV: process.env.NODE_ENV,
    env: process.env
  });
}
