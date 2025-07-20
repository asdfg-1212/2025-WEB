import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
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
    if (existEmail) return {code: 1, message: '邮箱已被注册'};
    if (existUsername) return {code: 2, message: '用户名已被注册'};
    const newUser = new User();
    newUser.email = email;
    newUser.username = username;
    newUser.password = password;
    newUser.role = 'user';
    return await this.userModel.save(newUser);
  }

  async login(email: string,username: string, password: string) { 
    const user = await this.userModel.findOne({ where: { email }});
    if (!user) return {code: 1, message: '用户不存在'};
    if (user.password !== password) return {code: 2, message: '密码错误'};

    //密码正确登录成功
    return {code: 0, message: '登录成功', data: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }};
  }
}
