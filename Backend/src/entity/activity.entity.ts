import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Venue } from './venue.entity';

export enum ActivityStatus {
  DRAFT = 'draft', // 草稿
  OPEN = 'open', // 报名中
  FULL = 'full', // 报名已满
  CLOSED = 'closed', // 报名截止
  ONGOING = 'ongoing', // 进行中
  ENDED = 'ended', // 已结束
  CANCELLED = 'cancelled', // 已取消
}

export enum ActivityType {
  BASKETBALL = 'basketball',
  FOOTBALL = 'football',
  TENNIS = 'tennis',
  BADMINTON = 'badminton',
  VOLLEYBALL = 'volleyball',
  PINGPONG = 'pingpong',
  SWIMMING = 'swimming',
  GYM = 'gym',
  OTHER = 'other',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string; // 活动标题

  @Column({ type: 'text', nullable: true })
  description: string; // 活动描述

  @Column()
  type: ActivityType; // 活动类型

  @Column({ default: ActivityStatus.DRAFT })
  status: ActivityStatus; // 活动状态

  @Column({ type: 'datetime' })
  start_time: Date; // 开始时间

  @Column({ type: 'datetime' })
  end_time: Date; // 结束时间

  @Column({ type: 'datetime' })
  registration_deadline: Date; // 报名截止时间

  @Column({ type: 'int' })
  max_participants: number; // 最大参与人数

  @Column({ type: 'int', default: 0 })
  current_participants: number; // 当前参与人数

  @Column({ type: 'text', nullable: true })
  notes: string; // 备注信息

  // 关联创建者（管理员）
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column()
  creator_id: number;

  // 关联场馆
  @ManyToOne(() => Venue, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venue_id' })
  venue: Venue;

  @Column()
  venue_id: number;

  @Column({ default: true })
  allow_comments: boolean; // 是否允许评论

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
