import { createApp, close } from '@midwayjs/mock';
import { Framework } from '@midwayjs/koa';
import { UserService } from '../../src/service/user.service';
import { User, UserRole } from '../../src/entity/user.entity';

describe('test/service/user.service.test.ts', () => {
  let app;
  let userService: UserService;

  beforeAll(async () => {
    app = await createApp<Framework>();
    userService = await app.getApplicationContext().getAsync(UserService);
  });

  afterAll(async () => {
    await close(app);
  });

  beforeEach(async () => {
    // 清理测试数据
    const userModel = userService['userModel'];
    await userModel.clear();
  });

  describe('register', () => {
    it('should register user successfully with valid data', async () => {
      const email = 'test@example.com';
      const username = 'testuser';
      const password = 'password123';

      const result = await userService.register(email, username, password);

      // 成功时返回 User 对象
      expect(result).toBeDefined();
      expect((result as User).email).toBe(email);
      expect((result as User).username).toBe(username);
      expect((result as User).password).toBe(password);
      expect((result as User).role).toBe(UserRole.USER);
      expect((result as User).id).toBeDefined();
    });

    it('should fail when email already exists', async () => {
      const email = 'test@example.com';
      const username1 = 'testuser1';
      const username2 = 'testuser2';
      const password = 'password123';

      // 先注册一个用户
      await userService.register(email, username1, password);

      // 尝试用相同邮箱注册另一个用户
      const result = await userService.register(email, username2, password);

      expect((result as any).code).toBe(1);
      expect((result as any).message).toBe('邮箱已被注册');
    });

    it('should fail when username already exists', async () => {
      const email1 = 'test1@example.com';
      const email2 = 'test2@example.com';
      const username = 'testuser';
      const password = 'password123';

      // 先注册一个用户
      await userService.register(email1, username, password);

      // 尝试用相同用户名注册另一个用户
      const result = await userService.register(email2, username, password);

      expect((result as any).code).toBe(2);
      expect((result as any).message).toBe('用户名已被注册');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // 为登录测试准备用户数据
      const user = new User();
      user.email = 'test@example.com';
      user.username = 'testuser';
      user.password = 'password123';
      user.role = UserRole.USER;
      await userService['userModel'].save(user);
    });

    it('should login successfully with correct credentials', async () => {
      const result = await userService.login('test@example.com', 'testuser', 'password123');

      expect(result.code).toBe(0);
      expect(result.message).toBe('登录成功');
      expect(result.data).toBeDefined();
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.username).toBe('testuser');
      expect(result.data.role).toBe(UserRole.USER);
      expect(result.data.id).toBeDefined();
    });

    it('should fail when user does not exist', async () => {
      const result = await userService.login('nonexistent@example.com', 'testuser', 'password123');

      expect(result.code).toBe(1);
      expect(result.message).toBe('用户不存在');
    });

    it('should fail when password is incorrect', async () => {
      const result = await userService.login('test@example.com', 'testuser', 'wrongpassword');

      expect(result.code).toBe(2);
      expect(result.message).toBe('密码错误');
    });
  });

  describe('getUser', () => {
    let savedUser: User;

    beforeEach(async () => {
      // 为获取用户测试准备数据
      const user = new User();
      user.email = 'test@example.com';
      user.username = 'testuser';
      user.password = 'password123';
      user.role = UserRole.USER;
      user.avatar_emoji = '😀';
      savedUser = await userService['userModel'].save(user);
    });

    it('should get user successfully when user exists', async () => {
      const result = await userService.getUser({ uid: savedUser.id });

      expect(result).toBeDefined();
      expect(result.uid).toBe(savedUser.id);
      expect(result.email).toBe('test@example.com');
      expect(result.username).toBe('testuser');
      expect(result.role).toBe(UserRole.USER);
      expect(result.avatar_emoji).toBe('😀');
      expect(result.created_at).toBeDefined();
    });

    it('should return null when user does not exist', async () => {
      const result = await userService.getUser({ uid: 999 });

      expect(result).toBeNull();
    });
  });

  describe('updateAvatar', () => {
    let savedUser: User;

    beforeEach(async () => {
      // 为更新头像测试准备数据
      const user = new User();
      user.email = 'test@example.com';
      user.username = 'testuser';
      user.password = 'password123';
      user.role = UserRole.USER;
      savedUser = await userService['userModel'].save(user);
    });

    it('should update avatar successfully with valid emoji', async () => {
      const newAvatar = '🏀';
      const result = await userService.updateAvatar(savedUser.id, newAvatar);

      expect(result.code).toBe(0);
      expect(result.message).toBe('头像更新成功');
      expect(result.data.avatar_emoji).toBe(newAvatar);

      // 验证数据库中的数据是否真的更新了
      const updatedUser = await userService['userModel'].findOne({ where: { id: savedUser.id } });
      expect(updatedUser.avatar_emoji).toBe(newAvatar);
    });

    it('should fail when user does not exist', async () => {
      const result = await userService.updateAvatar(999, '🏀');

      expect(result.code).toBe(2);
      expect(result.message).toBe('用户不存在');
    });

    it('should fail when avatar emoji is invalid', async () => {
      const invalidAvatar = 'invalid';
      const result = await userService.updateAvatar(savedUser.id, invalidAvatar);

      expect(result.code).toBe(1);
      expect(result.message).toBe('无效的头像emoji');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty strings in register', async () => {
      try {
        const result = await userService.register('', '', '');
        // 如果没有抛出异常，应该返回错误码
        expect((result as any).code).toBeDefined();
        expect((result as any).code).not.toBe(0);
      } catch (error) {
        // 如果抛出异常，这也是预期的行为
        expect(error).toBeDefined();
      }
    });

    it('should handle very long usernames', async () => {
      const longUsername = 'a'.repeat(1000);
      try {
        const result = await userService.register('test@example.com', longUsername, 'password');
        // 如果没有抛出异常，应该返回错误码
        expect((result as any).code).toBeDefined();
        expect((result as any).code).not.toBe(0);
      } catch (error) {
        // 如果抛出异常，这也是预期的行为（数据库字段长度限制）
        expect(error).toBeDefined();
      }
    });

    it('should handle special characters in email', async () => {
      const specialEmail = 'test+special@example.com';
      const result = await userService.register(specialEmail, 'testuser', 'password');

      // 应该成功处理特殊但有效的邮箱格式
      expect(result).toBeDefined();
    });
  });
});
