const axios = require('axios');

async function testAPI() {
  try {
    console.log('测试 /api/activities 接口...');
    const response = await axios.get('http://localhost:7001/api/activities');
    
    console.log('API 响应状态:', response.status);
    console.log('API 响应数据:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.data) {
      console.log('\n活动状态分析:');
      response.data.data.forEach(activity => {
        console.log(`- ID: ${activity.id}, Title: ${activity.title}, Status: ${activity.status}, Registration Deadline: ${activity.registration_deadline}`);
      });
    }
  } catch (error) {
    console.error('API 调用失败:', error.message);
    if (error.response) {
      console.log('错误响应:', error.response.data);
    }
  }
}

testAPI();
