import type { NextApiRequest, NextApiResponse } from 'next';
import { jsonRes } from '@fastgpt/service/common/response';
import { connectToDatabase } from '@/service/mongo';
import { MongoUser } from '@fastgpt/service/support/user/schema'; // 引入用户模型

const consumePoints = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { userId, points } = req.body;

    try {
      await connectToDatabase(); // 连接数据库

      // 查找用户并更新积分
      const user = await MongoUser.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 扣除积分
      user.balance -= points;
      await user.save();

      return res
        .status(200)
        .json({ message: 'Points consumed successfully', points: user.balance });
    } catch (error) {
      console.error('Error consuming points:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default consumePoints;
