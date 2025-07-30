import { Controller, Get, Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

@Controller('/api')
export class HealthController {
  @Inject()
  ctx: Context;

  @Get('/health')
  async health() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    };

    return {
      success: true,
      data: health,
    };
  }

  @Get('/ready')
  async ready() {
    // 这里可以添加更详细的就绪检查
    // 例如数据库连接检查等
    try {
      // 简单的数据库连接检查可以在这里添加
      return {
        success: true,
        message: 'Service is ready',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.ctx.status = 503;
      return {
        success: false,
        message: 'Service is not ready',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
