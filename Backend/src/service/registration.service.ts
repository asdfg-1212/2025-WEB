import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import {
  Registration,
  RegistrationStatus,
} from '../entity/registration.entity';
import { Activity, ActivityStatus } from '../entity/activity.entity';
import { User } from '../entity/user.entity';

export interface RegisterActivityDTO {
  user_id: number;
  activity_id: number;
}

// 统一的服务响应类型
export interface ServiceResult<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 报名详情（用于管理员查看）
export interface RegistrationDetail {
  id: number;
  user_id: number;
  status: RegistrationStatus;
  registered_at: Date;
  cancelled_at: Date | null;
  user: {
    id: number;
    username: string;
    email: string;
    avatar_emoji?: string;
  };
}

// 活动报名列表结果
export interface ActivityRegistrationsResult {
  activity: {
    id: number;
    title: string;
    max_participants: number;
    current_participants: number;
  };
  registrations: RegistrationDetail[];
  total: number;
}

@Provide()
export class RegistrationService {
  @InjectEntityModel(Registration)
  registrationModel: Repository<Registration>;

  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  // 1. 用户报名活动
  async registerActivity(
    data: RegisterActivityDTO
  ): Promise<ServiceResult<Registration>> {
    try {
      const { user_id, activity_id } = data;

      // 验证用户是否存在
      const user = await this.userModel.findOne({
        where: { id: user_id },
      });
      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
          data: null,
        };
      }

      // 验证活动是否存在
      const activity = await this.activityModel.findOne({
        where: { id: activity_id },
      });
      if (!activity) {
        return {
          code: 404,
          message: '活动不存在',
          data: null,
        };
      }

      // 检查活动状态
      if (activity.status !== ActivityStatus.OPEN) {
        return {
          code: 400,
          message: '活动未开放报名或已结束',
          data: null,
        };
      }

      // 检查是否已经报名
      const existingRegistration = await this.registrationModel.findOne({
        where: {
          user_id,
          activity_id,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      if (existingRegistration) {
        return {
          code: 400,
          message: '您已经报名了此活动',
          data: null,
        };
      }

      // 检查活动是否已满
      if (activity.current_participants >= activity.max_participants) {
        return {
          code: 400,
          message: '活动报名人数已满',
          data: null,
        };
      }

      // 创建报名记录
      const registration = this.registrationModel.create({
        user_id,
        activity_id,
        status: RegistrationStatus.CONFIRMED,
        registered_at: new Date(),
      });

      const savedRegistration = await this.registrationModel.save(registration);

      // 更新活动参与人数
      await this.updateActivityParticipantCount(activity_id);

      return {
        code: 0,
        message: '报名成功',
        data: savedRegistration,
      };
    } catch (error) {
      console.error('报名失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 2. 用户取消报名
  async cancelRegistration(
    userId: number,
    activityId: number
  ): Promise<ServiceResult<Registration>> {
    try {
      // 查找报名记录
      const registration = await this.registrationModel.findOne({
        where: {
          user_id: userId,
          activity_id: activityId,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      if (!registration) {
        return {
          code: 404,
          message: '未找到有效的报名记录',
          data: null,
        };
      }

      // 检查活动是否已经开始（可选的业务逻辑）
      const activity = await this.activityModel.findOne({
        where: { id: activityId },
      });

      if (activity && new Date() >= activity.start_time) {
        return {
          code: 400,
          message: '活动已开始，无法取消报名',
          data: null,
        };
      }

      // 更新报名状态
      registration.status = RegistrationStatus.CANCELLED;
      registration.cancelled_at = new Date();

      const updatedRegistration = await this.registrationModel.save(
        registration
      );

      // 更新活动参与人数
      await this.updateActivityParticipantCount(activityId);

      return {
        code: 0,
        message: '取消报名成功',
        data: updatedRegistration,
      };
    } catch (error) {
      console.error('取消报名失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 3. 管理员查看某活动的报名列表
  async getActivityRegistrations(
    activityId: number
  ): Promise<ServiceResult<ActivityRegistrationsResult>> {
    try {
      // 验证活动是否存在
      const activity = await this.activityModel.findOne({
        where: { id: activityId },
      });

      if (!activity) {
        return {
          code: 404,
          message: '活动不存在',
          data: null,
        };
      }

      // 获取报名列表
      const registrations = await this.registrationModel.find({
        where: { activity_id: activityId },
        relations: ['user'],
        select: {
          id: true,
          user_id: true,
          status: true,
          registered_at: true,
          cancelled_at: true,
          user: {
            id: true,
            username: true,
            email: true,
            avatar_emoji: true,
          },
        },
        order: {
          registered_at: 'ASC',
        },
      });

      // 转换为需要的格式
      const registrationDetails: RegistrationDetail[] = registrations.map(
        reg => ({
          id: reg.id,
          user_id: reg.user_id,
          status: reg.status,
          registered_at: reg.registered_at,
          cancelled_at: reg.cancelled_at,
          user: {
            id: reg.user.id,
            username: reg.user.username,
            email: reg.user.email,
            avatar_emoji: reg.user.avatar_emoji,
          },
        })
      );

      return {
        code: 0,
        message: '获取报名列表成功',
        data: {
          activity: {
            id: activity.id,
            title: activity.title,
            max_participants: activity.max_participants,
            current_participants: activity.current_participants,
          },
          registrations: registrationDetails,
          total: registrationDetails.length,
        },
      };
    } catch (error) {
      console.error('获取活动报名列表失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 4. 检查用户是否已报名某活动
  async checkUserRegistration(
    userId: number,
    activityId: number
  ): Promise<
    ServiceResult<{ isRegistered: boolean; registration?: Registration }>
  > {
    try {
      const registration = await this.registrationModel.findOne({
        where: {
          user_id: userId,
          activity_id: activityId,
          status: RegistrationStatus.CONFIRMED,
        },
      });

      return {
        code: 0,
        message: registration ? '用户已报名' : '用户未报名',
        data: {
          isRegistered: !!registration,
          registration: registration || undefined,
        },
      };
    } catch (error) {
      console.error('检查用户报名状态失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 私有方法：更新活动参与人数
  private async updateActivityParticipantCount(
    activityId: number
  ): Promise<void> {
    const confirmedCount = await this.registrationModel.count({
      where: {
        activity_id: activityId,
        status: RegistrationStatus.CONFIRMED,
      },
    });

    await this.activityModel.update(
      { id: activityId },
      { current_participants: confirmedCount }
    );
  }

  // 5. 获取用户的所有报名活动
  async getUserRegistrations(userId: number): Promise<ServiceResult<any[]>> {
    try {
      const registrations = await this.registrationModel.find({
        where: {
          user_id: userId,
          status: RegistrationStatus.CONFIRMED,
        },
        relations: ['activity', 'activity.venue'],
        order: { registered_at: 'DESC' },
      });

      const registrationDetails = registrations.map(registration => ({
        id: registration.id,
        registered_at: registration.registered_at,
        status: registration.status,
        activity: {
          id: registration.activity.id,
          title: registration.activity.title,
          description: registration.activity.description,
          type: registration.activity.type,
          start_time: registration.activity.start_time,
          end_time: registration.activity.end_time,
          registration_deadline: registration.activity.registration_deadline,
          max_participants: registration.activity.max_participants,
          current_participants: registration.activity.current_participants,
          status: registration.activity.status,
          venue: registration.activity.venue,
          allow_comments: registration.activity.allow_comments,
          notes: registration.activity.notes,
        },
      }));

      return {
        code: 0,
        message: '获取用户报名活动成功',
        data: registrationDetails,
      };
    } catch (error) {
      console.error('获取用户报名活动失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null,
      };
    }
  }
}
