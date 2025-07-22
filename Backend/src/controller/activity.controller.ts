import { Inject, Controller, Get, Post, Put, Query, Body, Param } from '@midwayjs/core';
import { Del } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { ActivityService, CreateActivityDTO, UpdateActivityDTO } from '../service/activity.service';
import { ActivityStatus, ActivityType } from '../entity/activity.entity';

@Controller('/api/activities')
export class ActivityController {
  @Inject()
  ctx: Context;

  @Inject()
  activityService: ActivityService;

  // 创建活动 POST /api/activities
  @Post('/')
  async createActivity(@Body() body: CreateActivityDTO) {
    try {
      const { title, description, type, start_time, end_time, registration_deadline, max_participants, venue_id, creator_id, notes, allow_comments } = body;
      
      // 基础参数验证
      if (!title || !type || !start_time || !end_time || !registration_deadline || !max_participants || !venue_id || !creator_id) {
        return {
          code: 400,
          message: '缺少必要参数',
          data: null
        };
      }

      // 转换日期字符串为Date对象
      const activityData: CreateActivityDTO = {
        title,
        description,
        type,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        registration_deadline: new Date(registration_deadline),
        max_participants: Number(max_participants),
        venue_id: Number(venue_id),
        creator_id: Number(creator_id),
        notes,
        allow_comments
      };

      const result = await this.activityService.createActivity(activityData);
      
      if (result.code === 0) {
        this.ctx.status = 201; // Created
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = 400; // Bad Request
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

  // 获取活动列表 GET /api/activities
  @Get('/')
  async getActivities(
    @Query('status') status?: ActivityStatus,
    @Query('type') type?: ActivityType,
    @Query('venue_id') venue_id?: string,
    @Query('creator_id') creator_id?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    try {
      const params = {
        status,
        type,
        venue_id: venue_id ? Number(venue_id) : undefined,
        creator_id: creator_id ? Number(creator_id) : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10
      };

      const result = await this.activityService.getActivities(params);
      
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

  // 获取单个活动详情 GET /api/activities/:id
  @Get('/:id')
  async getActivity(@Param('id') id: string) {
    try {
      const activityId = Number(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null
        };
      }

      const activity = await this.activityService.getActivityWithDetails(activityId);
      
      if (!activity) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '活动不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '获取活动详情成功',
        data: activity
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

  // 更新活动 PUT /api/activities/:id
  @Put('/:id')
  async updateActivity(@Param('id') id: string, @Body() body: UpdateActivityDTO & { operator_id: number }) {
    try {
      const activityId = Number(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null
        };
      }

      const { operator_id, ...updateData } = body;
      if (!operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少操作者ID',
          data: null
        };
      }

      // 转换日期字符串为Date对象
      if (updateData.start_time) {
        updateData.start_time = new Date(updateData.start_time);
      }
      if (updateData.end_time) {
        updateData.end_time = new Date(updateData.end_time);
      }
      if (updateData.registration_deadline) {
        updateData.registration_deadline = new Date(updateData.registration_deadline);
      }

      const result = await this.activityService.updateActivity(activityId, updateData, operator_id);
      
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

  // 更新活动状态 PUT /api/activities/:id/status
  @Put('/:id/status')
  async updateActivityStatus(@Param('id') id: string, @Body() body: { status: ActivityStatus; operator_id: number }) {
    try {
      const activityId = Number(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
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

      const result = await this.activityService.updateActivityStatus(activityId, status, operator_id);
      
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

  // 删除活动 DELETE /api/activities/:id
  @Del('/:id')
  async deleteActivity(@Param('id') id: string, @Body() body: { operator_id: number }) {
    try {
      const activityId = Number(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null
        };
      }

      const { operator_id } = body;
      if (!operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少操作者ID',
          data: null
        };
      }

      const result = await this.activityService.deleteActivity(activityId, operator_id);
      
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

  // 获取活动类型列表 GET /api/activities/types
  @Get('/types')
  async getActivityTypes() {
    try {
      const types = Object.values(ActivityType).map(type => ({
        value: type,
        label: this.getActivityTypeLabel(type)
      }));

      return {
        success: true,
        message: '获取活动类型成功',
        data: types
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

  // 获取活动状态列表 GET /api/activities/statuses
  @Get('/statuses')
  async getActivityStatuses() {
    try {
      const statuses = Object.values(ActivityStatus).map(status => ({
        value: status,
        label: this.getActivityStatusLabel(status)
      }));

      return {
        success: true,
        message: '获取活动状态成功',
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

  // 手动触发活动状态自动更新 POST /api/activities/auto-update-status
  @Post('/auto-update-status')
  async autoUpdateStatus(@Body() body: { operator_id: number }) {
    try {
      const { operator_id } = body;
      if (!operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少操作者ID',
          data: null
        };
      }

      // 这里可以添加权限检查，只允许管理员触发
      // 暂时先简单处理

      const result = await this.activityService.autoUpdateActivityStatus();
      
      return {
        success: true,
        message: result.message,
        data: null
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

  // 工具方法：获取活动类型的中文标签
  private getActivityTypeLabel(type: ActivityType): string {
    const labels = {
      [ActivityType.BASKETBALL]: '篮球',
      [ActivityType.FOOTBALL]: '足球',
      [ActivityType.TENNIS]: '网球',
      [ActivityType.BADMINTON]: '羽毛球',
      [ActivityType.VOLLEYBALL]: '排球',
      [ActivityType.PINGPONG]: '乒乓球',
      [ActivityType.SWIMMING]: '游泳',
      [ActivityType.GYM]: '健身',
      [ActivityType.OTHER]: '其他'
    };
    return labels[type] || type;
  }

  // 工具方法：获取活动状态的中文标签
  private getActivityStatusLabel(status: ActivityStatus): string {
    const labels = {
      [ActivityStatus.DRAFT]: '草稿',
      [ActivityStatus.OPEN]: '报名中',
      [ActivityStatus.FULL]: '报名已满',
      [ActivityStatus.CLOSED]: '报名截止',
      [ActivityStatus.ONGOING]: '进行中',
      [ActivityStatus.ENDED]: '已结束',
      [ActivityStatus.CANCELLED]: '已取消'
    };
    return labels[status] || status;
  }
}
