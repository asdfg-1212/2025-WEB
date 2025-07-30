import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { VenueService } from '../../src/service/venue.service';
import { Venue } from '../../src/entity/venue.entity';
import { User, UserRole } from '../../src/entity/user.entity';

describe('test/service/venue.service.test.ts', () => {
  let app;
  let venueService: VenueService;
  let testAdmin: User;
  let testUser: User;

  beforeAll(async () => {
    app = await createApp<Framework>();
    venueService = await app.getApplicationContext().getAsync(VenueService);
  });

  afterAll(async () => {
    await close(app);
  });

  beforeEach(async () => {
    // 清理测试数据
    const venueModel = venueService['venueModel'];
    const userModel = venueService['userModel'];

    await venueModel.clear();
    await userModel.clear();

    // 创建测试用户
    testAdmin = new User();
    testAdmin.email = 'admin@test.com';
    testAdmin.username = 'admin';
    testAdmin.password = 'password';
    testAdmin.role = UserRole.ADMIN;
    testAdmin = await userModel.save(testAdmin);

    testUser = new User();
    testUser.email = 'user@test.com';
    testUser.username = 'user';
    testUser.password = 'password';
    testUser.role = UserRole.USER;
    testUser = await userModel.save(testUser);
  });

  describe('createVenue', () => {
    it('should create venue successfully by admin', async () => {
      const venueData = {
        name: '羽毛球馆A',
        is_active: true,
      };

      const result = await venueService.createVenue(venueData, testAdmin.id);

      expect(result.code).toBe(0);
      expect(result.message).toBe('场馆创建成功');
      expect(result.data).toBeDefined();
      expect(result.data.name).toBe(venueData.name);
      expect(result.data.is_active).toBe(true);
    });

    it('should fail when user is not admin', async () => {
      const venueData = {
        name: '篮球馆B',
        is_active: true,
      };

      const result = await venueService.createVenue(venueData, testUser.id);

      expect(result.code).toBe(2);
      expect(result.message).toBe('权限不足，只有管理员可以创建场馆');
    });

    it('should fail when venue name already exists', async () => {
      const venueData = {
        name: '游泳馆',
        is_active: true,
      };

      // 先创建一个场馆
      await venueService.createVenue(venueData, testAdmin.id);

      // 尝试创建同名场馆
      const result = await venueService.createVenue(venueData, testAdmin.id);

      expect(result.code).toBe(3);
      expect(result.message).toBe('场馆名称已存在');
    });

    it('should fail when user does not exist', async () => {
      const venueData = {
        name: '乒乓球馆',
        is_active: true,
      };

      const result = await venueService.createVenue(venueData, 999);

      expect(result.code).toBe(1);
      expect(result.message).toBe('操作者不存在');
    });
  });

  describe('getVenues', () => {
    beforeEach(async () => {
      // 创建测试场馆数据
      const venues = [
        { name: '羽毛球馆A', is_active: true },
        { name: '篮球馆B', is_active: false },
        { name: '乒乓球馆C', is_active: true },
      ];

      const venueModel = venueService['venueModel'];
      for (const venueData of venues) {
        const venue = new Venue();
        Object.assign(venue, venueData);
        await venueModel.save(venue);
      }
    });

    it('should get all venues', async () => {
      const result = await venueService.getVenues({});

      expect(result.code).toBe(0);
      expect(result.message).toBe('获取场馆列表成功');
      expect(result.data.venues).toHaveLength(3);
      expect(result.data.pagination.total).toBe(3);
    });

    it('should filter venues by active status', async () => {
      const result = await venueService.getVenues({ is_active: true });

      expect(result.code).toBe(0);
      expect(result.data.venues).toHaveLength(2);
    });

    it('should filter venues by inactive status', async () => {
      const result = await venueService.getVenues({ is_active: false });

      expect(result.code).toBe(0);
      expect(result.data.venues).toHaveLength(1);
      expect(result.data.venues[0].name).toBe('篮球馆B');
    });

    it('should search venues by name', async () => {
      const result = await venueService.getVenues({ search: '羽毛球' });

      expect(result.code).toBe(0);
      expect(result.data.venues).toHaveLength(1);
      expect(result.data.venues[0].name).toBe('羽毛球馆A');
    });

    it('should handle pagination', async () => {
      const result = await venueService.getVenues({
        page: 1,
        pageSize: 2,
      });

      expect(result.code).toBe(0);
      expect(result.data.venues).toHaveLength(2);
      expect(result.data.pagination.page).toBe(1);
      expect(result.data.pagination.pageSize).toBe(2);
      expect(result.data.pagination.total).toBe(3);
      expect(result.data.pagination.totalPages).toBe(2);
    });
  });

  describe('getVenueById', () => {
    let testVenue: Venue;

    beforeEach(async () => {
      // 创建测试场馆
      testVenue = new Venue();
      testVenue.name = '测试场馆';
      testVenue.is_active = true;
      testVenue = await venueService['venueModel'].save(testVenue);
    });

    it('should get venue by id successfully', async () => {
      const result = await venueService.getVenueById(testVenue.id);

      expect(result.code).toBe(0);
      expect(result.message).toBe('获取场馆详情成功');
      expect(result.data.id).toBe(testVenue.id);
      expect(result.data.name).toBe(testVenue.name);
    });

    it('should fail when venue does not exist', async () => {
      const result = await venueService.getVenueById(999);

      expect(result.code).toBe(1);
      expect(result.message).toBe('场馆不存在');
    });
  });

  describe('updateVenue', () => {
    let testVenue: Venue;

    beforeEach(async () => {
      // 创建测试场馆
      testVenue = new Venue();
      testVenue.name = '原始场馆';
      testVenue.is_active = true;
      testVenue = await venueService['venueModel'].save(testVenue);
    });

    it('should update venue successfully by admin', async () => {
      const updateData = {
        name: '更新后场馆',
        is_active: false,
      };

      const result = await venueService.updateVenue(
        testVenue.id,
        updateData,
        testAdmin.id
      );

      expect(result.code).toBe(0);
      expect(result.message).toBe('场馆更新成功');
      expect(result.data.name).toBe(updateData.name);
      expect(result.data.is_active).toBe(updateData.is_active);
    });

    it('should fail when user is not admin', async () => {
      const updateData = { name: '用户尝试更新' };
      const result = await venueService.updateVenue(
        testVenue.id,
        updateData,
        testUser.id
      );

      expect(result.code).toBe(2);
      expect(result.message).toBe('权限不足，只有管理员可以修改场馆');
    });

    it('should fail when venue does not exist', async () => {
      const updateData = { name: '不存在的场馆' };
      const result = await venueService.updateVenue(
        999,
        updateData,
        testAdmin.id
      );

      expect(result.code).toBe(3);
      expect(result.message).toBe('场馆不存在');
    });

    it('should fail when updating to existing venue name', async () => {
      // 创建另一个场馆
      const anotherVenue = new Venue();
      anotherVenue.name = '另一个场馆';
      anotherVenue.is_active = true;
      await venueService['venueModel'].save(anotherVenue);

      // 尝试将 testVenue 更新为与 anotherVenue 相同的名称
      const updateData = { name: '另一个场馆' };
      const result = await venueService.updateVenue(
        testVenue.id,
        updateData,
        testAdmin.id
      );

      expect(result.code).toBe(4);
      expect(result.message).toBe('场馆名称已存在');
    });
  });

  describe('toggleVenueStatus', () => {
    let testVenue: Venue;

    beforeEach(async () => {
      // 创建测试场馆
      testVenue = new Venue();
      testVenue.name = '状态测试场馆';
      testVenue.is_active = true;
      testVenue = await venueService['venueModel'].save(testVenue);
    });

    it('should toggle venue status successfully by admin', async () => {
      const result = await venueService.toggleVenueStatus(
        testVenue.id,
        testAdmin.id
      );

      expect(result.code).toBe(0);
      expect(result.message).toBe('场馆禁用成功');
      expect(result.data.is_active).toBe(false);
    });

    it('should fail when user is not admin', async () => {
      const result = await venueService.toggleVenueStatus(
        testVenue.id,
        testUser.id
      );

      expect(result.code).toBe(2);
      expect(result.message).toBe('权限不足，只有管理员可以修改场馆状态');
    });

    it('should fail when venue does not exist', async () => {
      const result = await venueService.toggleVenueStatus(999, testAdmin.id);

      expect(result.code).toBe(3);
      expect(result.message).toBe('场馆不存在');
    });
  });

  describe('deleteVenue', () => {
    let testVenue: Venue;

    beforeEach(async () => {
      // 创建测试场馆
      testVenue = new Venue();
      testVenue.name = '待删除场馆';
      testVenue.is_active = true;
      testVenue = await venueService['venueModel'].save(testVenue);
    });

    it('should delete venue successfully by super admin', async () => {
      // 将测试用户设为超级管理员
      testAdmin.role = UserRole.SUPER_ADMIN;
      await venueService['userModel'].save(testAdmin);

      const result = await venueService.deleteVenue(testVenue.id, testAdmin.id);

      expect(result.code).toBe(0);
      expect(result.message).toBe('场馆删除成功（已设为不可用）');

      // 验证场馆已被设为不可用
      const updatedVenue = await venueService['venueModel'].findOne({
        where: { id: testVenue.id },
      });
      expect(updatedVenue.is_active).toBe(false);
    });

    it('should fail when user is not super admin', async () => {
      const result = await venueService.deleteVenue(testVenue.id, testAdmin.id);

      expect(result.code).toBe(2);
      expect(result.message).toBe('权限不足，只有超级管理员可以删除场馆');
    });

    it('should fail when venue does not exist', async () => {
      testAdmin.role = UserRole.SUPER_ADMIN;
      await venueService['userModel'].save(testAdmin);

      const result = await venueService.deleteVenue(999, testAdmin.id);

      expect(result.code).toBe(3);
      expect(result.message).toBe('场馆不存在');
    });
  });

  describe('batchCreateVenues', () => {
    it('should create multiple venues successfully by admin', async () => {
      const venuesData = [
        { name: '批量场馆1', is_active: true },
        { name: '批量场馆2', is_active: false },
      ];

      const result = await venueService.batchCreateVenues(
        venuesData,
        testAdmin.id
      );

      expect(result.code).toBe(0);
      expect(result.message).toBe('批量创建完成，成功 2 个，失败 0 个');
      expect(result.data.created).toHaveLength(2);
      expect(result.data.errors).toHaveLength(0);
    });

    it('should handle partial failures in batch creation', async () => {
      // 先创建一个场馆
      await venueService.createVenue(
        {
          name: '已存在场馆',
          is_active: true,
        },
        testAdmin.id
      );

      const venuesData = [
        { name: '新场馆', is_active: true },
        { name: '已存在场馆', is_active: true }, // 这个会失败
      ];

      const result = await venueService.batchCreateVenues(
        venuesData,
        testAdmin.id
      );

      expect(result.code).toBe(0);
      expect(result.data.created).toHaveLength(1);
      expect(result.data.errors).toHaveLength(1);
      expect(result.data.errors[0].error).toBe('场馆名称已存在');
    });

    it('should fail when user is not admin', async () => {
      const venuesData = [{ name: '普通用户场馆', is_active: true }];

      const result = await venueService.batchCreateVenues(
        venuesData,
        testUser.id
      );

      expect(result.code).toBe(2);
      expect(result.message).toBe('权限不足，只有管理员可以批量创建场馆');
    });
  });

  describe('getVenueStats', () => {
    beforeEach(async () => {
      // 创建测试场馆
      const venues = [
        { name: '统计场馆1', is_active: true },
        { name: '统计场馆2', is_active: false },
        { name: '统计场馆3', is_active: true },
      ];

      const venueModel = venueService['venueModel'];
      for (const venueData of venues) {
        const venue = new Venue();
        Object.assign(venue, venueData);
        await venueModel.save(venue);
      }
    });

    it('should get venue statistics successfully', async () => {
      const result = await venueService.getVenueStats();

      expect(result.code).toBe(0);
      expect(result.message).toBe('获取场馆统计成功');
      expect(result.data.total).toBe(3);
      expect(result.data.active).toBe(2);
      expect(result.data.inactive).toBe(1);
      expect(result.data.activeRate).toBe(67); // 2/3 ≈ 67%
    });
  });
});
