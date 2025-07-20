import { Entity, PrimaryGeneratedColumn,Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ unique: true })
  email: string;//邮箱
  
  @Column({ unique: true })
  username: string;//用户名

  @Column()
  password: string;//密码

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}