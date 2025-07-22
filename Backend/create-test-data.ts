// 临时测试脚本 - 创建测试数据
import { createApp } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { UserService } from './src/service/user.service';
import { ActivityService } from './src/service/activity.service';
import { VenueService } from './src/service/venue.service';
import { ActivityType } from './src/entity/activity.entity';

async function createTestData() {
  console.log('开始创建测试数据...');
  
  const app = await createApp<Framework>();
  
  try {
    const userService = await app.getApplicationContext().getAsync(UserService);
    const activityService = await app.getApplicationContext().getAsync(ActivityService);
    const venueService = await app.getApplicationContext().getAsync(VenueService);

    // 创建测试用户
    console.log('创建测试用户...');
    const userResult = await userService.createUser({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'password123'
    });
    
    if (userResult.code !== 0) {
      console.log('用户可能已存在，尝试获取现有用户...');
      // 如果用户已存在，我们继续使用现有的用户
    } else {
      console.log('用户创建成功:', userResult.data);
    }

    // 创建管理员用户
    console.log('创建管理员用户...');
    const adminResult = await userService.createUser({
      email: 'admin@example.com',
      username: 'admin',
      password: 'admin123'
    });

    // 创建测试场馆
    console.log('创建测试场馆...');
    const venueResult = await venueService.createVenue({
      name: '测试篮球场'
    }, 1); // 假设管理员ID为1

    if (venueResult.code !== 0) {
      console.log('场馆创建失败:', venueResult.message);
      return;
    }

    console.log('场馆创建成功:', venueResult.data);

    // 创建测试活动
    console.log('创建测试活动...');
    const activityResult = await activityService.createActivity({
      title: '测试篮球活动',
      description: '这是一个用于测试评论功能的篮球活动',
      type: ActivityType.BASKETBALL,
      start_time: new Date('2025-08-01 14:00:00'),
      end_time: new Date('2025-08-01 16:00:00'),
      registration_deadline: new Date('2025-07-31 23:59:59'),
      max_participants: 10,
      venue_id: venueResult.data.id,
      creator_id: 1,
      allow_comments: true
    });

    if (activityResult.code !== 0) {
      console.log('活动创建失败:', activityResult.message);
      return;
    }

    console.log('活动创建成功:', activityResult.data);
    console.log('测试数据创建完成！');
    console.log(`用户ID: 1, 活动ID: ${activityResult.data.id}`);

  } catch (error) {
    console.error('创建测试数据时发生错误:', error);
  } finally {
    await app.close();
  }
}

createTestData();
