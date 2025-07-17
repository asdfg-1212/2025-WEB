import { Inject, Controller, Post, Body } from '@midwayjs/decorator';
import { UserService } from '../service/user.service';

@Controller('/api')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/register')
  async register(@Body() body) {
    const { username, password, nickname, phone } = body;
    const result = await this.userService.register(username, password, nickname, phone);
    return { code: 0, msg: '注册成功', data: result };
  }
}