import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import {
  Activity,
  ActivityStatus,
  ActivityType,
} from '../entity/activity.entity';
import { User } from '../entity/user.entity';
import { Venue } from '../entity/venue.entity';
import {
  Registration,
  RegistrationStatus,
} from '../entity/registration.entity';

export interface CreateActivityDTO {
  title: string;
  description?: string;
  type: ActivityType;
  start_time: Date;
  end_time: Date;
  registration_deadline: Date;
  max_participants: number;
  venue_id: number;
  creator_id: number;
  notes?: string;
  allow_comments?: boolean;
}

export interface UpdateActivityDTO {
  title?: string;
  description?: string;
  type?: ActivityType;
  start_time?: Date;
  end_time?: Date;
  registration_deadline?: Date;
  max_participants?: number;
  venue_id?: number;
  notes?: string;
  allow_comments?: boolean;
}

@Provide()
export class ActivityService {
  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  @InjectEntityModel(Registration)
  registrationModel: Repository<Registration>;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  @InjectEntityModel(Venue)
  venueModel: Repository<Venue>;

  // 创建活动
  async createActivity(data: CreateActivityDTO) {
    try {
      // 验证创建者是否存在且有权限
      const creator = await this.userModel.findOne({
        where: { id: data.creator_id },
      });
      if (!creator) {
        return { code: 1, message: '创建者不存在' };
      }
      if (creator.role !== 'admin' && creator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以创建活动' };
      }

      // 验证场馆是否存在且可用
      const venue = await this.venueModel.findOne({
        where: { id: data.venue_id },
      });
      if (!venue) {
        return { code: 3, message: '场馆不存在' };
      }
      if (!venue.is_active) {
        return { code: 4, message: '场馆不可用' };
      }

      // 验证时间逻辑
      if (data.start_time >= data.end_time) {
        return { code: 5, message: '开始时间必须早于结束时间' };
      }
      if (data.registration_deadline >= data.start_time) {
        return { code: 6, message: '报名截止时间必须早于活动开始时间' };
      }
      if (data.registration_deadline <= new Date()) {
        return { code: 7, message: '报名截止时间不能是过去的时间' };
      }

      // 创建活动
      const activity = new Activity();
      activity.title = data.title;
      activity.description = data.description;
      activity.type = data.type;
      activity.start_time = data.start_time;
      activity.end_time = data.end_time;
      activity.registration_deadline = data.registration_deadline;
      activity.max_participants = data.max_participants;
      activity.venue_id = data.venue_id;
      activity.creator_id = data.creator_id;
      activity.notes = data.notes;
      activity.allow_comments = data.allow_comments ?? true;
      activity.status = ActivityStatus.OPEN; // 创建后默认开放报名

      const savedActivity = await this.activityModel.save(activity);

      return {
        code: 0,
        message: '活动创建成功',
        data: await this.getActivityWithDetails(savedActivity.id),
      };
    } catch (error) {
      return { code: 999, message: '创建活动失败', error: error.message };
    }
  }

  // 获取活动详情（包含关联信息）
  async getActivityWithDetails(activityId: number) {
    const activity = await this.activityModel.findOne({
      where: { id: activityId },
      relations: ['creator', 'venue'],
    });

    if (!activity) {
      return null;
    }

    // 获取当前报名人数
    const currentParticipants = await this.registrationModel.count({
      where: {
        activity_id: activityId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    return {
      ...activity,
      current_participants: currentParticipants,
      creator_name: activity.creator.username,
      venue_name: activity.venue.name,
    };
  }

  // 获取活动列表（支持筛选）
  async getActivities(params: {
    status?: ActivityStatus;
    type?: ActivityType;
    venue_id?: number;
    creator_id?: number;
    page?: number;
    pageSize?: number;
  }) {
    const {
      status,
      type,
      venue_id,
      creator_id,
      page = 1,
      pageSize = 10,
    } = params;

    const queryBuilder = this.activityModel
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.creator', 'creator')
      .leftJoinAndSelect('activity.venue', 'venue')
      .orderBy('activity.created_at', 'DESC');

    // 添加筛选条件
    if (status) {
      queryBuilder.andWhere('activity.status = :status', { status });
    }
    if (type) {
      queryBuilder.andWhere('activity.type = :type', { type });
    }
    if (venue_id) {
      queryBuilder.andWhere('activity.venue_id = :venue_id', { venue_id });
    }
    if (creator_id) {
      queryBuilder.andWhere('activity.creator_id = :creator_id', {
        creator_id,
      });
    }

    // 分页
    const total = await queryBuilder.getCount();
    const activities = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    // 为每个活动添加当前报名人数
    const activitiesWithParticipants = await Promise.all(
      activities.map(async activity => {
        const current_participants = await this.registrationModel.count({
          where: {
            activity_id: activity.id,
            status: RegistrationStatus.CONFIRMED,
          },
        });

        return {
          ...activity,
          current_participants,
          creator_name: activity.creator.username,
          venue_name: activity.venue.name,
        };
      })
    );

    return {
      code: 0,
      message: '获取活动列表成功',
      data: {
        activities: activitiesWithParticipants,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    };
  }

  // 更新活动
  async updateActivity(
    activityId: number,
    data: UpdateActivityDTO,
    operatorId: number
  ) {
    try {
      const activity = await this.activityModel.findOne({
        where: { id: activityId },
        relations: ['creator'],
      });

      if (!activity) {
        return { code: 1, message: '活动不存在' };
      }

      // 权限检查：只有创建者或超级管理员可以修改
      const operator = await this.userModel.findOne({
        where: { id: operatorId },
      });
      if (!operator) {
        return { code: 2, message: '操作者不存在' };
      }

      if (
        activity.creator_id !== operatorId &&
        operator.role !== 'super_admin'
      ) {
        return {
          code: 3,
          message: '权限不足，只有创建者或超级管理员可以修改活动',
        };
      }

      // 如果活动已结束，不允许修改关键信息
      if (
        activity.status === ActivityStatus.ENDED ||
        activity.status === ActivityStatus.CANCELLED
      ) {
        return { code: 4, message: '已结束或已取消的活动不能修改' };
      }

      // 验证新的时间逻辑（如果提供了时间更新）
      const start_time = data.start_time || activity.start_time;
      const end_time = data.end_time || activity.end_time;
      const registration_deadline =
        data.registration_deadline || activity.registration_deadline;

      if (start_time >= end_time) {
        return { code: 5, message: '开始时间必须早于结束时间' };
      }
      if (registration_deadline >= start_time) {
        return { code: 6, message: '报名截止时间必须早于活动开始时间' };
      }

      // 验证场馆（如果更新了场馆）
      if (data.venue_id) {
        const venue = await this.venueModel.findOne({
          where: { id: data.venue_id },
        });
        if (!venue || !venue.is_active) {
          return { code: 7, message: '场馆不存在或不可用' };
        }
      }

      // 更新活动
      Object.assign(activity, data);
      await this.activityModel.save(activity);

      return {
        code: 0,
        message: '活动更新成功',
        data: await this.getActivityWithDetails(activityId),
      };
    } catch (error) {
      return { code: 999, message: '更新活动失败', error: error.message };
    }
  }

  // 更新活动状态
  async updateActivityStatus(
    activityId: number,
    status: ActivityStatus,
    operatorId: number
  ) {
    try {
      const activity = await this.activityModel.findOne({
        where: { id: activityId },
        relations: ['creator'],
      });

      if (!activity) {
        return { code: 1, message: '活动不存在' };
      }

      // 权限检查
      const operator = await this.userModel.findOne({
        where: { id: operatorId },
      });
      if (!operator) {
        return { code: 2, message: '操作者不存在' };
      }

      if (
        activity.creator_id !== operatorId &&
        operator.role !== 'super_admin'
      ) {
        return { code: 3, message: '权限不足' };
      }

      // 状态转换逻辑验证
      const now = new Date();
      switch (status) {
        case ActivityStatus.OPEN:
          if (activity.registration_deadline <= now) {
            return { code: 4, message: '报名截止时间已过，不能重新开放报名' };
          }
          break;
        case ActivityStatus.ONGOING:
          if (activity.start_time > now) {
            return { code: 5, message: '活动尚未开始，不能设为进行中' };
          }
          break;
        case ActivityStatus.ENDED:
          // 可以手动结束活动
          break;
        case ActivityStatus.CANCELLED:
          if (activity.status === ActivityStatus.ENDED) {
            return { code: 6, message: '已结束的活动不能取消' };
          }
          break;
      }

      activity.status = status;
      await this.activityModel.save(activity);

      return {
        code: 0,
        message: '活动状态更新成功',
        data: await this.getActivityWithDetails(activityId),
      };
    } catch (error) {
      return { code: 999, message: '更新状态失败', error: error.message };
    }
  }

  // 删除活动（软删除 - 通过状态标记）
  async deleteActivity(activityId: number, operatorId: number) {
    return this.updateActivityStatus(
      activityId,
      ActivityStatus.CANCELLED,
      operatorId
    );
  }

  // 自动更新活动状态（定时任务可调用）
  async autoUpdateActivityStatus() {
    const now = new Date();

    // 更新报名截止的活动
    await this.activityModel.update(
      {
        status: ActivityStatus.OPEN,
        registration_deadline: { $lte: now } as any,
      },
      { status: ActivityStatus.CLOSED }
    );

    // 更新已开始的活动
    await this.activityModel.update(
      {
        status: ActivityStatus.CLOSED,
        start_time: { $lte: now } as any,
      },
      { status: ActivityStatus.ONGOING }
    );

    // 更新已结束的活动
    await this.activityModel.update(
      {
        status: ActivityStatus.ONGOING,
        end_time: { $lte: now } as any,
      },
      { status: ActivityStatus.ENDED }
    );

    return { code: 0, message: '活动状态自动更新完成' };
  }
}
