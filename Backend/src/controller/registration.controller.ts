import { Inject, Controller, Get, Post, Put, Query, Body, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { RegistrationService, RegisterActivityDTO } from '../service/registration.service';
import { RegistrationStatus } from '../entity/registration.entity';

@Controller('/api/registrations')
export class RegistrationController {
  @Inject()
  ctx: Context;

  @Inject()
  registrationService: RegistrationService;

  // 用户报名活动 POST /api/registrations
  @Post('/')
  async registerActivity(@Body() body: RegisterActivityDTO) {
    try {
      const { user_id, activity_id } = body;
      
      if (!user_id || !activity_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.registrationService.registerActivity({
        user_id: Number(user_id),
        activity_id: Number(activity_id)
      });
      
      if (result.code === 0) {
        this.ctx.status = 201;
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 取消报名 POST /api/registrations/cancel
  @Post('/cancel')
  async cancelRegistration(@Body() body: { user_id: number; activity_id: number }) {
    try {
      const { user_id, activity_id } = body;
      
      if (!user_id || !activity_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.registrationService.cancelRegistration(
        Number(user_id),
        Number(activity_id)
      );
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 管理员更新报名状态 PUT /api/registrations/:id/status
  @Put('/:id/status')
  async updateRegistrationStatus(
    @Param('id') id: string, 
    @Body() body: { status: RegistrationStatus; operator_id: number }
  ) {
    try {
      const registrationId = Number(id);
      if (isNaN(registrationId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的报名ID',
          data: null
        };
      }

      const { status, operator_id } = body;
      if (!status || !operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.registrationService.updateRegistrationStatus(
        registrationId,
        status,
        operator_id
      );
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 获取用户报名列表 GET /api/registrations/user/:userId
  @Get('/user/:userId')
  async getUserRegistrations(
    @Param('userId') userId: string,
    @Query('status') status?: RegistrationStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    try {
      const user_id = Number(userId);
      if (isNaN(user_id)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的用户ID',
          data: null
        };
      }

      const params = {
        status,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10
      };

      const result = await this.registrationService.getUserRegistrations(user_id, params);
      
      return {
        success: true,
        message: result.message,
        data: result.data
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 获取活动报名列表 GET /api/registrations/activity/:activityId
  @Get('/activity/:activityId')
  async getActivityRegistrations(
    @Param('activityId') activityId: string,
    @Query('status') status?: RegistrationStatus,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    try {
      const activity_id = Number(activityId);
      if (isNaN(activity_id)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null
        };
      }

      const params = {
        status,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20
      };

      const result = await this.registrationService.getActivityRegistrations(activity_id, params);
      
      return {
        success: true,
        message: result.message,
        data: result.data
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 获取报名详情 GET /api/registrations/:id
  @Get('/:id')
  async getRegistrationDetails(@Param('id') id: string) {
    try {
      const registrationId = Number(id);
      if (isNaN(registrationId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的报名ID',
          data: null
        };
      }

      const registration = await this.registrationService.getRegistrationWithDetails(registrationId);
      
      if (!registration) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '报名记录不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '获取报名详情成功',
        data: registration
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 批量签到 POST /api/registrations/batch-checkin
  @Post('/batch-checkin')
  async batchCheckIn(@Body() body: { activity_id: number; user_ids: number[]; operator_id: number }) {
    try {
      const { activity_id, user_ids, operator_id } = body;
      
      if (!activity_id || !user_ids || !Array.isArray(user_ids) || !operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数或参数格式错误',
          data: null
        };
      }

      const result = await this.registrationService.batchCheckIn(
        activity_id,
        user_ids.map(id => Number(id)),
        operator_id
      );
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 标记缺席用户 POST /api/registrations/mark-absent
  @Post('/mark-absent')
  async markAbsentUsers(@Body() body: { activity_id: number; operator_id: number }) {
    try {
      const { activity_id, operator_id } = body;
      
      if (!activity_id || !operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.registrationService.markAbsentUsers(activity_id, operator_id);
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 获取报名统计 GET /api/registrations/stats
  @Get('/stats')
  async getRegistrationStats(@Query('activity_id') activity_id?: string) {
    try {
      const activityId = activity_id ? Number(activity_id) : undefined;
      
      if (activity_id && isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null
        };
      }

      const result = await this.registrationService.getRegistrationStats(activityId);
      
      return {
        success: true,
        message: result.message,
        data: result.data
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 获取报名状态列表 GET /api/registrations/statuses
  @Get('/statuses')
  async getRegistrationStatuses() {
    try {
      const statuses = Object.values(RegistrationStatus).map(status => ({
        value: status,
        label: this.getRegistrationStatusLabel(status)
      }));

      return {
        success: true,
        message: '获取报名状态成功',
        data: statuses
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message
      };
    }
  }

  // 工具方法：获取报名状态的中文标签
  private getRegistrationStatusLabel(status: RegistrationStatus): string {
    const labels = {
      [RegistrationStatus.PENDING]: '待确认',
      [RegistrationStatus.CONFIRMED]: '已确认',
      [RegistrationStatus.CANCELLED]: '已取消',
      [RegistrationStatus.ATTENDED]: '已参加',
      [RegistrationStatus.ABSENT]: '缺席'
    };
    return labels[status] || status;
  }
}
