import { Inject, Controller, Get, Post, Body, Param } from '@midwayjs/core';
import { Del } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import {
  RegistrationService,
  RegisterActivityDTO,
} from '../service/registration.service';

@Controller('/api/registrations')
export class RegistrationController {
  @Inject()
  ctx: Context;

  @Inject()
  registrationService: RegistrationService;

  // 1. 报名参加活动 POST /api/registrations
  @Post('/')
  async registerActivity(@Body() body: RegisterActivityDTO) {
    try {
      const { user_id, activity_id } = body;

      // 基础参数验证
      if (!user_id || !activity_id) {
        return {
          code: 400,
          message: '缺少必要参数：user_id, activity_id',
          data: null,
        };
      }

      const registrationData: RegisterActivityDTO = {
        user_id: Number(user_id),
        activity_id: Number(activity_id),
      };

      const result = await this.registrationService.registerActivity(
        registrationData
      );

      if (result.code === 0) {
        this.ctx.status = 201; // Created
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = result.code === 404 ? 404 : 400;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      console.error('报名失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 2. 取消报名 DELETE /api/registrations/:userId/:activityId
  @Del('/:userId/:activityId')
  async cancelRegistration(
    @Param('userId') userId: string,
    @Param('activityId') activityId: string
  ) {
    try {
      if (
        !userId ||
        isNaN(Number(userId)) ||
        !activityId ||
        isNaN(Number(activityId))
      ) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的用户ID或活动ID',
          data: null,
        };
      }

      const result = await this.registrationService.cancelRegistration(
        Number(userId),
        Number(activityId)
      );

      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      console.error('取消报名失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 3. 管理员查看某活动的报名列表 GET /api/registrations/activity/:activityId
  @Get('/activity/:activityId')
  async getActivityRegistrations(@Param('activityId') activityId: string) {
    try {
      if (!activityId || isNaN(Number(activityId))) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const result = await this.registrationService.getActivityRegistrations(
        Number(activityId)
      );

      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      console.error('获取活动报名列表失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
      };
    }
  }

  // 4. 检查用户是否已报名某活动 GET /api/registrations/check/:userId/:activityId
  @Get('/check/:userId/:activityId')
  async checkUserRegistration(
    @Param('userId') userId: string,
    @Param('activityId') activityId: string
  ) {
    try {
      if (
        !userId ||
        isNaN(Number(userId)) ||
        !activityId ||
        isNaN(Number(activityId))
      ) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的用户ID或活动ID',
          data: null,
        };
      }

      const result = await this.registrationService.checkUserRegistration(
        Number(userId),
        Number(activityId)
      );

      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      console.error('检查用户报名状态失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
      };
    }
  }
}
