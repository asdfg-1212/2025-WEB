import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';
import { User } from '../entity/user.entity';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  async getUser(options: { uid: number }) {
    const user = await this.userModel.findOne({ where: { id: options.uid } });
    if (!user) return null;
    return {
      uid: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async register(email: string, username: string, password: string) {
    const existEmail = await this.userModel.findOne({ where: { email } });
    const existUsername = await this.userModel.findOne({ where: { username } });
    if (existEmail) return { code: 1, msg: '邮箱已被注册' };
    if (existUsername) return { code: 2, msg: '用户名已被注册' };
    const newUser = new User();
    newUser.email = email;
    newUser.username = username;
    newUser.password = password;
    newUser.role = 'user';
    return await this.userModel.save(newUser);
  }
}
