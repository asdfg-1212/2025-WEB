const axios = require('axios');

async function testCreateActivity() {
  try {
    console.log('测试创建活动接口...');

    // 模拟一个活动创建请求
    const activityData = {
      title: '测试活动',
      description: '这是一个测试活动',
      type: 'basketball',
      start_time: '2025-07-30T10:00:00.000Z',
      end_time: '2025-07-30T12:00:00.000Z',
      registration_deadline: '2025-07-29T23:59:59.000Z',
      max_participants: 10,
      venue_id: 212,
      creator_id: 388,
      notes: '测试备注',
      allow_comments: true,
    };

    console.log('发送的数据:', JSON.stringify(activityData, null, 2));

    const response = await axios.post(
      'http://localhost:7001/api/activities',
      activityData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('创建成功:', response.status);
    console.log('响应数据:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('创建活动失败:');
    console.error('错误类型:', error.name);
    console.error('错误消息:', error.message);
    console.error('状态码:', error.response?.status);

    if (error.response?.data) {
      console.error(
        '错误响应数据:',
        JSON.stringify(error.response.data, null, 2)
      );
    }

    if (error.response?.headers) {
      console.error('响应头:', error.response.headers);
    }
  }
}

testCreateActivity();
