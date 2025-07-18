import { Inject, Controller, Post, Body } from '@midwayjs/decorator';
import { UserService } from '../service/user.service';

@Controller('/api')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/register')
  async register(@Body() body) {
    const { email,username, password, } = body;
    const result = await this.userService.register(email, username, password);
    return result;
  }

  @Post('/login')
  async login(@Body() body) {
    const { email, password } = body;
    const result = await this.userService.login(email, password);
    return result;
  }
}