import React, { useState } from 'react';
import { Box, Button, Input, Text, useToast } from '@chakra-ui/react';
import { useUserStore } from '@/web/support/user/useUserStore';
import MyIcon from '@fastgpt/web/components/common/Icon';
import MyTooltip from '@fastgpt/web/components/common/MyTooltip';

const PointsPage = () => {
  const { userInfo } = useUserStore();
  const [points, setPoints] = useState(0);
  const toast = useToast();

  const handleConsumePoints = async () => {
    if (!userInfo) {
      toast({
        title: '用户未登录',
        status: 'warning'
      });
      return;
    }

    try {
      const response = await fetch('/api/support/user/points/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: userInfo._id, // 假设 userInfo 中有 id 字段
          points
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: '积分消费成功',
          description: `剩余积分: ${data.points}`,
          status: 'success'
        });
      } else {
        toast({
          title: '消费积分失败',
          description: data.message,
          status: 'error'
        });
      }
    } catch (error) {
      toast({
        title: '请求失败',
        description: '请稍后再试',
        status: 'error'
      });
    }
  };

  return (
    <Box p={4}>
      <Text fontSize="xl" mb={4}>
        消费积分
      </Text>
      <Input
        type="number"
        placeholder="输入要消费的积分"
        value={points}
        onChange={(e) => setPoints(Number(e.target.value))}
        mb={4}
      />
      <Button onClick={handleConsumePoints} colorScheme="teal">
        消费积分
      </Button>
    </Box>
  );
};

export default PointsPage;
