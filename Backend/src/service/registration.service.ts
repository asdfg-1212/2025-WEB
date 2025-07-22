import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Registration, RegistrationStatus } from '../entity/registration.entity';
import { Activity, ActivityStatus } from '../entity/activity.entity';
import { User } from '../entity/user.entity';

export interface RegisterActivityDTO {
  user_id: number;
  activity_id: number;
}

export interface UpdateRegistrationDTO {
  status: RegistrationStatus;
}

@Provide()
export class RegistrationService {
  @InjectEntityModel(Registration)
  registrationModel: Repository<Registration>;

  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  // 用户报名参加活动
  async registerActivity(data: RegisterActivityDTO) {
    try {
      const { user_id, activity_id } = data;

      // 检查用户是否存在
      const user = await this.userModel.findOne({ where: { id: user_id } });
      if (!user) {
        return { code: 1, message: '用户不存在' };
      }

      // 检查活动是否存在
      const activity = await this.activityModel.findOne({ 
        where: { id: activity_id },
        relations: ['venue']
      });
      if (!activity) {
        return { code: 2, message: '活动不存在' };
      }

      // 检查活动状态
      if (activity.status !== ActivityStatus.OPEN) {
        const statusMessages = {
          [ActivityStatus.DRAFT]: '活动尚未开放报名',
          [ActivityStatus.FULL]: '活动报名已满',
          [ActivityStatus.CLOSED]: '活动报名已截止',
          [ActivityStatus.ONGOING]: '活动已经开始，无法报名',
          [ActivityStatus.ENDED]: '活动已结束',
          [ActivityStatus.CANCELLED]: '活动已取消'
        };
        return { code: 3, message: statusMessages[activity.status] || '活动状态不允许报名' };
      }

      // 检查报名截止时间
      if (new Date() > activity.registration_deadline) {
        return { code: 4, message: '报名时间已截止' };
      }

      // 检查是否已经报名
      const existingRegistration = await this.registrationModel.findOne({
        where: { user_id, activity_id }
      });
      if (existingRegistration && existingRegistration.status !== RegistrationStatus.CANCELLED) {
        return { code: 5, message: '您已经报名了此活动' };
      }

      // 检查活动是否已满
      const currentParticipants = await this.registrationModel.count({
        where: { 
          activity_id, 
          status: RegistrationStatus.CONFIRMED 
        }
      });

      if (currentParticipants >= activity.max_participants) {
        // 更新活动状态为已满
        activity.status = ActivityStatus.FULL;
        await this.activityModel.save(activity);
        return { code: 6, message: '活动报名已满' };
      }

      // 创建或更新报名记录
      let registration: Registration;
      
      if (existingRegistration && existingRegistration.status === RegistrationStatus.CANCELLED) {
        // 如果之前取消过，重新激活
        existingRegistration.status = RegistrationStatus.CONFIRMED;
        existingRegistration.registered_at = new Date();
        existingRegistration.cancelled_at = null;
        registration = await this.registrationModel.save(existingRegistration);
      } else {
        // 创建新的报名记录
        registration = new Registration();
        registration.user_id = user_id;
        registration.activity_id = activity_id;
        registration.status = RegistrationStatus.CONFIRMED;
        registration = await this.registrationModel.save(registration);
      }

      // 更新活动的当前参与人数
      const newParticipants = currentParticipants + 1;
      activity.current_participants = newParticipants;
      
      // 如果刚好满员，更新状态
      if (newParticipants >= activity.max_participants) {
        activity.status = ActivityStatus.FULL;
      }
      
      await this.activityModel.save(activity);

      return {
        code: 0,
        message: '报名成功',
        data: await this.getRegistrationWithDetails(registration.id)
      };
    } catch (error) {
      return { code: 999, message: '报名失败', error: error.message };
    }
  }

  // 取消报名
  async cancelRegistration(user_id: number, activity_id: number) {
    try {
      // 检查报名记录是否存在
      const registration = await this.registrationModel.findOne({
        where: { user_id, activity_id }
      });

      if (!registration) {
        return { code: 1, message: '未找到报名记录' };
      }

      if (registration.status === RegistrationStatus.CANCELLED) {
        return { code: 2, message: '报名已经取消' };
      }

      // 检查活动状态
      const activity = await this.activityModel.findOne({ where: { id: activity_id } });
      if (!activity) {
        return { code: 3, message: '活动不存在' };
      }

      if (activity.status === ActivityStatus.ONGOING || activity.status === ActivityStatus.ENDED) {
        return { code: 4, message: '活动已开始或已结束，无法取消报名' };
      }

      // 检查取消时间限制（可以设置一个取消截止时间，比如活动开始前2小时）
      const cancelDeadline = new Date(activity.start_time.getTime() - 2 * 60 * 60 * 1000); // 开始前2小时
      if (new Date() > cancelDeadline) {
        return { code: 5, message: '取消报名时间已过（活动开始前2小时截止取消）' };
      }

      // 更新报名状态
      registration.status = RegistrationStatus.CANCELLED;
      registration.cancelled_at = new Date();
      await this.registrationModel.save(registration);

      // 更新活动参与人数和状态
      const currentParticipants = await this.registrationModel.count({
        where: { 
          activity_id, 
          status: RegistrationStatus.CONFIRMED 
        }
      });

      activity.current_participants = currentParticipants;
      
      // 如果之前是满员状态，现在有空位了，改回开放状态
      if (activity.status === ActivityStatus.FULL && currentParticipants < activity.max_participants) {
        // 检查是否还在报名期内
        if (new Date() <= activity.registration_deadline) {
          activity.status = ActivityStatus.OPEN;
        } else {
          activity.status = ActivityStatus.CLOSED;
        }
      }
      
      await this.activityModel.save(activity);

      return {
        code: 0,
        message: '取消报名成功',
        data: registration
      };
    } catch (error) {
      return { code: 999, message: '取消报名失败', error: error.message };
    }
  }

  // 管理员更新报名状态
  async updateRegistrationStatus(registration_id: number, status: RegistrationStatus, operator_id: number) {
    try {
      // 权限检查
      const operator = await this.userModel.findOne({ where: { id: operator_id } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }

      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以修改报名状态' };
      }

      // 检查报名记录
      const registration = await this.registrationModel.findOne({
        where: { id: registration_id },
        relations: ['user', 'activity']
      });

      if (!registration) {
        return { code: 3, message: '报名记录不存在' };
      }

      const oldStatus = registration.status;
      registration.status = status;

      // 根据状态更新时间字段
      if (status === RegistrationStatus.CANCELLED) {
        registration.cancelled_at = new Date();
      } else if (oldStatus === RegistrationStatus.CANCELLED) {
        registration.cancelled_at = null;
        registration.registered_at = new Date();
      }

      await this.registrationModel.save(registration);

      // 更新活动参与人数
      await this.updateActivityParticipants(registration.activity_id);

      return {
        code: 0,
        message: '报名状态更新成功',
        data: await this.getRegistrationWithDetails(registration_id)
      };
    } catch (error) {
      return { code: 999, message: '更新报名状态失败', error: error.message };
    }
  }

  // 获取用户的报名列表
  async getUserRegistrations(user_id: number, params: {
    status?: RegistrationStatus;
    page?: number;
    pageSize?: number;
  }) {
    try {
      const { status, page = 1, pageSize = 10 } = params;

      const queryBuilder = this.registrationModel.createQueryBuilder('registration')
        .leftJoinAndSelect('registration.activity', 'activity')
        .leftJoinAndSelect('activity.venue', 'venue')
        .leftJoinAndSelect('activity.creator', 'creator')
        .where('registration.user_id = :user_id', { user_id })
        .orderBy('registration.created_at', 'DESC');

      if (status) {
        queryBuilder.andWhere('registration.status = :status', { status });
      }

      const total = await queryBuilder.getCount();
      const registrations = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      return {
        code: 0,
        message: '获取报名列表成功',
        data: {
          registrations,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      return { code: 999, message: '获取报名列表失败', error: error.message };
    }
  }

  // 获取活动的报名列表
  async getActivityRegistrations(activity_id: number, params: {
    status?: RegistrationStatus;
    page?: number;
    pageSize?: number;
  }) {
    try {
      const { status, page = 1, pageSize = 20 } = params;

      const queryBuilder = this.registrationModel.createQueryBuilder('registration')
        .leftJoinAndSelect('registration.user', 'user')
        .leftJoinAndSelect('registration.activity', 'activity')
        .where('registration.activity_id = :activity_id', { activity_id })
        .orderBy('registration.registered_at', 'ASC');

      if (status) {
        queryBuilder.andWhere('registration.status = :status', { status });
      }

      const total = await queryBuilder.getCount();
      const registrations = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      return {
        code: 0,
        message: '获取活动报名列表成功',
        data: {
          registrations,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      return { code: 999, message: '获取活动报名列表失败', error: error.message };
    }
  }

  // 获取报名详情
  async getRegistrationWithDetails(registration_id: number) {
    try {
      const registration = await this.registrationModel.findOne({
        where: { id: registration_id },
        relations: ['user', 'activity', 'activity.venue', 'activity.creator']
      });

      if (!registration) {
        return null;
      }

      return {
        ...registration,
        user_name: registration.user.username,
        user_email: registration.user.email,
        activity_title: registration.activity.title,
        venue_name: registration.activity.venue.name,
        creator_name: registration.activity.creator.username
      };
    } catch (error) {
      return null;
    }
  }

  // 批量签到（活动进行时）
  async batchCheckIn(activity_id: number, user_ids: number[], operator_id: number) {
    try {
      // 权限检查
      const operator = await this.userModel.findOne({ where: { id: operator_id } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }

      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以签到' };
      }

      // 检查活动状态
      const activity = await this.activityModel.findOne({ where: { id: activity_id } });
      if (!activity) {
        return { code: 3, message: '活动不存在' };
      }

      if (activity.status !== ActivityStatus.ONGOING) {
        return { code: 4, message: '只有进行中的活动才能签到' };
      }

      const results = [];
      const errors = [];

      for (const user_id of user_ids) {
        try {
          const registration = await this.registrationModel.findOne({
            where: { user_id, activity_id, status: RegistrationStatus.CONFIRMED }
          });

          if (!registration) {
            errors.push(`用户 ${user_id} 未报名或报名状态异常`);
            continue;
          }

          registration.status = RegistrationStatus.ATTENDED;
          await this.registrationModel.save(registration);
          results.push(user_id);
        } catch (error) {
          errors.push(`用户 ${user_id} 签到失败: ${error.message}`);
        }
      }

      return {
        code: 0,
        message: `批量签到完成，成功 ${results.length} 人，失败 ${errors.length} 人`,
        data: {
          success: results,
          errors: errors
        }
      };
    } catch (error) {
      return { code: 999, message: '批量签到失败', error: error.message };
    }
  }

  // 活动结束后标记缺席
  async markAbsentUsers(activity_id: number, operator_id: number) {
    try {
      // 权限检查
      const operator = await this.userModel.findOne({ where: { id: operator_id } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }

      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以标记缺席' };
      }

      // 检查活动状态
      const activity = await this.activityModel.findOne({ where: { id: activity_id } });
      if (!activity) {
        return { code: 3, message: '活动不存在' };
      }

      if (activity.status !== ActivityStatus.ENDED) {
        return { code: 4, message: '只有已结束的活动才能标记缺席' };
      }

      // 将所有确认报名但未签到的用户标记为缺席
      const result = await this.registrationModel.update(
        { 
          activity_id, 
          status: RegistrationStatus.CONFIRMED 
        },
        { 
          status: RegistrationStatus.ABSENT 
        }
      );

      return {
        code: 0,
        message: `标记缺席完成，共标记 ${result.affected} 人`,
        data: { affected: result.affected }
      };
    } catch (error) {
      return { code: 999, message: '标记缺席失败', error: error.message };
    }
  }

  // 更新活动参与人数（内部工具方法）
  private async updateActivityParticipants(activity_id: number) {
    const confirmedCount = await this.registrationModel.count({
      where: { 
        activity_id, 
        status: RegistrationStatus.CONFIRMED 
      }
    });

    await this.activityModel.update(
      { id: activity_id },
      { current_participants: confirmedCount }
    );
  }

  // 获取报名统计
  async getRegistrationStats(activity_id?: number) {
    try {
      const queryBuilder = this.registrationModel.createQueryBuilder('registration');
      
      if (activity_id) {
        queryBuilder.where('registration.activity_id = :activity_id', { activity_id });
      }

      const total = await queryBuilder.getCount();
      const confirmed = await queryBuilder.clone().andWhere('registration.status = :status', { status: RegistrationStatus.CONFIRMED }).getCount();
      const cancelled = await queryBuilder.clone().andWhere('registration.status = :status', { status: RegistrationStatus.CANCELLED }).getCount();
      const attended = await queryBuilder.clone().andWhere('registration.status = :status', { status: RegistrationStatus.ATTENDED }).getCount();
      const absent = await queryBuilder.clone().andWhere('registration.status = :status', { status: RegistrationStatus.ABSENT }).getCount();

      return {
        code: 0,
        message: '获取报名统计成功',
        data: {
          total,
          confirmed,
          cancelled,
          attended,
          absent,
          attendanceRate: confirmed > 0 ? Math.round((attended / confirmed) * 100) : 0
        }
      };
    } catch (error) {
      return { code: 999, message: '获取报名统计失败', error: error.message };
    }
  }
}
