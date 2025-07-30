import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

export enum RegistrationStatus {
  PENDING = 'pending', // 待确认
  CONFIRMED = 'confirmed', // 已确认
  CANCELLED = 'cancelled', // 已取消
  ATTENDED = 'attended', // 已参加
  ABSENT = 'absent', // 缺席
}

@Entity('registrations')
@Unique(['user_id', 'activity_id']) // 确保用户不能重复报名同一活动
export class Registration {
  @PrimaryGeneratedColumn()
  id: number;

  // 关联用户
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;

  // 关联活动
  @ManyToOne(() => Activity, { nullable: false })
  @JoinColumn({ name: 'activity_id' })
  activity: Activity;

  @Column()
  activity_id: number;

  @Column({ default: RegistrationStatus.CONFIRMED })
  status: RegistrationStatus; // 报名状态

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  registered_at: Date; // 报名时间

  @Column({ type: 'datetime', nullable: true })
  cancelled_at: Date; // 取消时间

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
