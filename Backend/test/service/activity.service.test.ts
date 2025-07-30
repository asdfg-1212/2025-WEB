import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { ActivityService } from '../../src/service/activity.service';
import {
  Activity,
  ActivityStatus,
  ActivityType,
} from '../../src/entity/activity.entity';
import { User, UserRole } from '../../src/entity/user.entity';
import { Venue } from '../../src/entity/venue.entity';

describe('test/service/activity.service.test.ts', () => {
  let app;
  let activityService: ActivityService;

  beforeAll(async () => {
    app = await createApp<Framework>();
    activityService = await app
      .getApplicationContext()
      .getAsync(ActivityService);
  });

  afterAll(async () => {
    await close(app);
  });

  beforeEach(async () => {
    // 清理测试数据
    const activityModel = activityService['activityModel'];
    const userModel = activityService['userModel'];
    const venueModel = activityService['venueModel'];

    await activityModel.clear();
    await userModel.clear();
    await venueModel.clear();
  });

  describe('createActivity', () => {
    it('should create activity successfully with valid data', async () => {
      // 准备测试数据
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 10:00:00'),
        end_time: new Date('2025-08-01 12:00:00'),
        registration_deadline: new Date('2025-07-31 18:00:00'),
        max_participants: 20,
        venue_id: savedVenue.id,
        creator_id: savedUser.id,
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(0);
      expect(result.message).toBe('活动创建成功');
      expect(result.data).toBeDefined();
      expect(result.data.title).toBe('测试活动');
      expect(result.data.status).toBe(ActivityStatus.OPEN);
    });

    it('should fail when creator does not exist', async () => {
      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 10:00:00'),
        end_time: new Date('2025-08-01 12:00:00'),
        registration_deadline: new Date('2025-07-31 18:00:00'),
        max_participants: 20,
        venue_id: savedVenue.id,
        creator_id: 999, // 不存在的用户ID
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(1);
      expect(result.message).toBe('创建者不存在');
    });

    it('should fail when creator is not admin', async () => {
      const user = new User();
      user.email = 'user@test.com';
      user.username = 'user';
      user.password = 'password';
      user.role = UserRole.USER; // 普通用户
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 10:00:00'),
        end_time: new Date('2025-08-01 12:00:00'),
        registration_deadline: new Date('2025-07-31 18:00:00'),
        max_participants: 20,
        venue_id: savedVenue.id,
        creator_id: savedUser.id,
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(2);
      expect(result.message).toBe('权限不足，只有管理员可以创建活动');
    });

    it('should fail when venue does not exist', async () => {
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 10:00:00'),
        end_time: new Date('2025-08-01 12:00:00'),
        registration_deadline: new Date('2025-07-31 18:00:00'),
        max_participants: 20,
        venue_id: 999, // 不存在的场馆ID
        creator_id: savedUser.id,
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(3);
      expect(result.message).toBe('场馆不存在');
    });

    it('should fail when venue is not active', async () => {
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = false; // 不可用
      const savedVenue = await activityService['venueModel'].save(venue);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 10:00:00'),
        end_time: new Date('2025-08-01 12:00:00'),
        registration_deadline: new Date('2025-07-31 18:00:00'),
        max_participants: 20,
        venue_id: savedVenue.id,
        creator_id: savedUser.id,
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(4);
      expect(result.message).toBe('场馆不可用');
    });

    it('should fail when start time is after end time', async () => {
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 12:00:00'), // 开始时间晚于结束时间
        end_time: new Date('2025-08-01 10:00:00'),
        registration_deadline: new Date('2025-07-31 18:00:00'),
        max_participants: 20,
        venue_id: savedVenue.id,
        creator_id: savedUser.id,
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(5);
      expect(result.message).toBe('开始时间必须早于结束时间');
    });

    it('should fail when registration deadline is after start time', async () => {
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activityData = {
        title: '测试活动',
        description: '这是一个测试活动',
        type: ActivityType.BASKETBALL,
        start_time: new Date('2025-08-01 10:00:00'),
        end_time: new Date('2025-08-01 12:00:00'),
        registration_deadline: new Date('2025-08-01 11:00:00'), // 报名截止时间晚于开始时间
        max_participants: 20,
        venue_id: savedVenue.id,
        creator_id: savedUser.id,
        notes: '测试备注',
      };

      const result = await activityService.createActivity(activityData);

      expect(result.code).toBe(6);
      expect(result.message).toBe('报名截止时间必须早于活动开始时间');
    });
  });

  describe('getActivities', () => {
    it('should return empty list when no activities exist', async () => {
      const result = await activityService.getActivities({});

      expect(result.code).toBe(0);
      expect(result.message).toBe('获取活动列表成功');
      expect(result.data.activities).toEqual([]);
      expect(result.data.pagination.total).toBe(0);
    });

    it('should return activities with pagination', async () => {
      // 准备测试数据
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      // 创建多个活动
      for (let i = 1; i <= 5; i++) {
        const activity = new Activity();
        activity.title = `测试活动${i}`;
        activity.type = ActivityType.BASKETBALL;
        activity.status = ActivityStatus.OPEN;
        activity.start_time = new Date(`2025-08-0${i} 10:00:00`);
        activity.end_time = new Date(`2025-08-0${i} 12:00:00`);
        activity.registration_deadline = new Date(`2025-07-3${i} 18:00:00`);
        activity.max_participants = 20;
        activity.creator_id = savedUser.id;
        activity.venue_id = savedVenue.id;
        await activityService['activityModel'].save(activity);
      }

      const result = await activityService.getActivities({
        page: 1,
        pageSize: 3,
      });

      expect(result.code).toBe(0);
      expect(result.data.activities).toHaveLength(3);
      expect(result.data.pagination.total).toBe(5);
      expect(result.data.pagination.totalPages).toBe(2);
    });

    it('should filter activities by status', async () => {
      // 准备测试数据
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      // 创建不同状态的活动
      const openActivity = new Activity();
      openActivity.title = '开放活动';
      openActivity.type = ActivityType.BASKETBALL;
      openActivity.status = ActivityStatus.OPEN;
      openActivity.start_time = new Date('2025-08-01 10:00:00');
      openActivity.end_time = new Date('2025-08-01 12:00:00');
      openActivity.registration_deadline = new Date('2025-07-31 18:00:00');
      openActivity.max_participants = 20;
      openActivity.creator_id = savedUser.id;
      openActivity.venue_id = savedVenue.id;
      await activityService['activityModel'].save(openActivity);

      const closedActivity = new Activity();
      closedActivity.title = '关闭活动';
      closedActivity.type = ActivityType.FOOTBALL;
      closedActivity.status = ActivityStatus.CLOSED;
      closedActivity.start_time = new Date('2025-08-02 10:00:00');
      closedActivity.end_time = new Date('2025-08-02 12:00:00');
      closedActivity.registration_deadline = new Date('2025-08-01 18:00:00');
      closedActivity.max_participants = 20;
      closedActivity.creator_id = savedUser.id;
      closedActivity.venue_id = savedVenue.id;
      await activityService['activityModel'].save(closedActivity);

      const result = await activityService.getActivities({
        status: ActivityStatus.OPEN,
      });

      expect(result.code).toBe(0);
      expect(result.data.activities).toHaveLength(1);
      expect(result.data.activities[0].title).toBe('开放活动');
      expect(result.data.activities[0].status).toBe(ActivityStatus.OPEN);
    });
  });

  describe('updateActivity', () => {
    it('should update activity successfully by creator', async () => {
      // 准备测试数据
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activity = new Activity();
      activity.title = '原始标题';
      activity.type = ActivityType.BASKETBALL;
      activity.status = ActivityStatus.OPEN;
      activity.start_time = new Date('2025-08-01 10:00:00');
      activity.end_time = new Date('2025-08-01 12:00:00');
      activity.registration_deadline = new Date('2025-07-31 18:00:00');
      activity.max_participants = 20;
      activity.creator_id = savedUser.id;
      activity.venue_id = savedVenue.id;
      const savedActivity = await activityService['activityModel'].save(
        activity
      );

      const updateData = {
        title: '更新后的标题',
        description: '更新后的描述',
      };

      const result = await activityService.updateActivity(
        savedActivity.id,
        updateData,
        savedUser.id
      );

      expect(result.code).toBe(0);
      expect(result.message).toBe('活动更新成功');
      expect(result.data.title).toBe('更新后的标题');
      expect(result.data.description).toBe('更新后的描述');
    });

    it('should fail when activity does not exist', async () => {
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const updateData = {
        title: '更新后的标题',
      };

      const result = await activityService.updateActivity(
        999,
        updateData,
        savedUser.id
      );

      expect(result.code).toBe(1);
      expect(result.message).toBe('活动不存在');
    });

    it('should fail when operator is not creator or super admin', async () => {
      // 创建活动创建者
      const creator = new User();
      creator.email = 'creator@test.com';
      creator.username = 'creator';
      creator.password = 'password';
      creator.role = UserRole.ADMIN;
      const savedCreator = await activityService['userModel'].save(creator);

      // 创建另一个用户
      const otherUser = new User();
      otherUser.email = 'other@test.com';
      otherUser.username = 'other';
      otherUser.password = 'password';
      otherUser.role = UserRole.ADMIN;
      const savedOtherUser = await activityService['userModel'].save(otherUser);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activity = new Activity();
      activity.title = '原始标题';
      activity.type = ActivityType.BASKETBALL;
      activity.status = ActivityStatus.OPEN;
      activity.start_time = new Date('2025-08-01 10:00:00');
      activity.end_time = new Date('2025-08-01 12:00:00');
      activity.registration_deadline = new Date('2025-07-31 18:00:00');
      activity.max_participants = 20;
      activity.creator_id = savedCreator.id;
      activity.venue_id = savedVenue.id;
      const savedActivity = await activityService['activityModel'].save(
        activity
      );

      const updateData = {
        title: '更新后的标题',
      };

      const result = await activityService.updateActivity(
        savedActivity.id,
        updateData,
        savedOtherUser.id
      );

      expect(result.code).toBe(3);
      expect(result.message).toBe(
        '权限不足，只有创建者或超级管理员可以修改活动'
      );
    });
  });

  describe('updateActivityStatus', () => {
    it('should update activity status successfully', async () => {
      // 准备测试数据
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const venue = new Venue();
      venue.name = '测试场馆';
      venue.is_active = true;
      const savedVenue = await activityService['venueModel'].save(venue);

      const activity = new Activity();
      activity.title = '测试活动';
      activity.type = ActivityType.BASKETBALL;
      activity.status = ActivityStatus.OPEN;
      activity.start_time = new Date('2025-08-01 10:00:00');
      activity.end_time = new Date('2025-08-01 12:00:00');
      activity.registration_deadline = new Date('2025-07-31 18:00:00');
      activity.max_participants = 20;
      activity.creator_id = savedUser.id;
      activity.venue_id = savedVenue.id;
      const savedActivity = await activityService['activityModel'].save(
        activity
      );

      const result = await activityService.updateActivityStatus(
        savedActivity.id,
        ActivityStatus.CANCELLED,
        savedUser.id
      );

      expect(result.code).toBe(0);
      expect(result.message).toBe('活动状态更新成功');
      expect(result.data.status).toBe(ActivityStatus.CANCELLED);
    });

    it('should fail when activity does not exist', async () => {
      const user = new User();
      user.email = 'admin@test.com';
      user.username = 'admin';
      user.password = 'password';
      user.role = UserRole.ADMIN;
      const savedUser = await activityService['userModel'].save(user);

      const result = await activityService.updateActivityStatus(
        999,
        ActivityStatus.CANCELLED,
        savedUser.id
      );

      expect(result.code).toBe(1);
      expect(result.message).toBe('活动不存在');
    });
  });
});
