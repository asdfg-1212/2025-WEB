import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string; // 评论内容

  // 关联用户（评论者）
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

  // 父评论ID，用于实现回复功能
  @ManyToOne(() => Comment, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @Column({ nullable: true })
  parent_id: number;

  @Column({ default: false })
  is_deleted: boolean; // 软删除标记

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
