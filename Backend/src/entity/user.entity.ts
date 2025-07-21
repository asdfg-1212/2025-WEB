import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  email: string; // 邮箱
  
  @Column({ unique: true })
  username: string; // 用户名

  @Column()
  password: string; // 密码

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole; // 用户角色

  @Column({ length: 10, nullable: true })
  avatar_emoji: string; // 头像emoji

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}