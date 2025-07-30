import { MidwayConfig } from '@midwayjs/core';

export default {
  // 生产环境配置
  cors: {
    origin: process.env.FRONTEND_URL || 'https://your-domain.com',
    credentials: true,
  },

  // 数据库配置 - 生产环境应使用MySQL等
  typeorm: {
    dataSource: {
      default: {
        type: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        username: process.env.DB_USERNAME || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'sports_activity',
        synchronize: false, // 生产环境不自动同步
        logging: false,
        entities: ['dist/entity/*{.ts,.js}'],
        timezone: '+08:00',
      },
    },
  },

  // 日志配置
  midwayLogger: {
    default: {
      level: 'warn',
      enableConsole: false,
      enableFile: true,
    },
  },

  // 安全配置
  security: {
    jwt: {
      secret:
        process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      expiresIn: '7d',
    },
  },

  // 服务器配置
  koa: {
    port: parseInt(process.env.PORT) || 7001,
    hostname: '0.0.0.0',
  },
} as MidwayConfig;
