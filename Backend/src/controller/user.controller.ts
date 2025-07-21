import { Inject, Controller, Post, Body, Get } from '@midwayjs/decorator';
import { UserService } from '../service/user.service';
import { AVATAR_EMOJIS } from '../config/avatar.config';

@Controller('/api')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/register')
  async register(@Body() body) {
    const { email, username, password } = body;
    if (!email || !username || !password) {
      throw new Error("缺少参数");
    }
    const result = await this.userService.register(email, username, password);
    return result;
  }

  @Post('/login')
  async login(@Body() body) {
    const { email, username, password } = body;
    if (!email || !username || !password) {
      throw new Error("缺少参数");
    }
    const result = await this.userService.login(email, username, password);  
    return result;
  }

  @Post('/update-avatar')
  async updateAvatar(@Body() body) {
    const { userId, avatarEmoji } = body;
    if (!userId || !avatarEmoji) {
      throw new Error("缺少参数");
    }
    const result = await this.userService.updateAvatar(userId, avatarEmoji);
    return result;
  }

  @Get('/avatar-options')
  async getAvatarOptions() {
    return {
      code: 0,
      message: '获取头像选项成功',
      data: {
        emojis: AVATAR_EMOJIS
      }
    };
  }
}