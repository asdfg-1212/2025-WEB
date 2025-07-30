import {
  Inject,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Body,
  Param,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import {
  VenueService,
  CreateVenueDTO,
  UpdateVenueDTO,
} from '../service/venue.service';

@Controller('/api/venues')
export class VenueController {
  @Inject()
  ctx: Context;

  @Inject()
  venueService: VenueService;

  // 创建场馆 POST /api/venues
  @Post('/')
  async createVenue(@Body() body: CreateVenueDTO & { operator_id: number }) {
    try {
      const { operator_id, ...venueData } = body;

      // 基础参数验证
      if (!venueData.name || !operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null,
        };
      }

      const result = await this.venueService.createVenue(
        venueData,
        operator_id
      );

      if (result.code === 0) {
        this.ctx.status = 201; // Created
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = 400; // Bad Request
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 获取场馆列表 GET /api/venues
  @Get('/')
  async getVenues(
    @Query('is_active') is_active?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string
  ) {
    try {
      const params = {
        is_active:
          is_active === 'true'
            ? true
            : is_active === 'false'
            ? false
            : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        search,
      };

      const result = await this.venueService.getVenues(params);

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 获取可用场馆列表 GET /api/venues/available
  @Get('/available')
  async getAvailableVenues() {
    try {
      const result = await this.venueService.getAvailableVenues();

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 获取场馆统计 GET /api/venues/stats
  @Get('/stats')
  async getVenueStats() {
    try {
      const result = await this.venueService.getVenueStats();

      return {
        success: true,
        message: result.message,
        data: result.data,
      };
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 获取单个场馆详情 GET /api/venues/:id
  @Get('/:id')
  async getVenue(@Param('id') id: string) {
    try {
      const venueId = Number(id);
      if (isNaN(venueId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的场馆ID',
          data: null,
        };
      }

      const result = await this.venueService.getVenueById(venueId);

      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = 404;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 更新场馆 PUT /api/venues/:id
  @Put('/:id')
  async updateVenue(
    @Param('id') id: string,
    @Body() body: UpdateVenueDTO & { operator_id: number }
  ) {
    try {
      const venueId = Number(id);
      if (isNaN(venueId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的场馆ID',
          data: null,
        };
      }

      const { operator_id, ...updateData } = body;
      if (!operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少操作者ID',
          data: null,
        };
      }

      const result = await this.venueService.updateVenue(
        venueId,
        updateData,
        operator_id
      );

      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 切换场馆状态 PUT /api/venues/:id/toggle
  @Put('/:id/toggle')
  async toggleVenueStatus(
    @Param('id') id: string,
    @Body() body: { operator_id: number }
  ) {
    try {
      const venueId = Number(id);
      if (isNaN(venueId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的场馆ID',
          data: null,
        };
      }

      const { operator_id } = body;
      if (!operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少操作者ID',
          data: null,
        };
      }

      const result = await this.venueService.toggleVenueStatus(
        venueId,
        operator_id
      );

      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }

  // 批量创建场馆 POST /api/venues/batch
  @Post('/batch')
  async batchCreateVenues(
    @Body() body: { venues: CreateVenueDTO[]; operator_id: number }
  ) {
    try {
      const { venues, operator_id } = body;

      if (
        !venues ||
        !Array.isArray(venues) ||
        venues.length === 0 ||
        !operator_id
      ) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数或场馆列表为空',
          data: null,
        };
      }

      const result = await this.venueService.batchCreateVenues(
        venues,
        operator_id
      );

      if (result.code === 0) {
        this.ctx.status = 201;
        return {
          success: true,
          message: result.message,
          data: result.data,
        };
      } else {
        this.ctx.status = 400;
        return {
          success: false,
          message: result.message,
          data: null,
        };
      }
    } catch (error) {
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null,
        error: error.message,
      };
    }
  }
}
