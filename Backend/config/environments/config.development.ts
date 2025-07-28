import { MidwayConfig } from '@midwayjs/core';

export default {
  // 开发环境配置
  cors: {
    origin: 'http://localhost:5173', // Vite开发服务器地址
    credentials: true,
  },
  
  // 数据库配置 - 开发环境使用SQLite
  typeorm: {
    dataSource: {
      default: {
        type: 'sqlite',
        database: './database.sqlite',
        synchronize: true, // 开发环境可以自动同步
        logging: true,
        entities: ['src/entity/*{.ts,.js}'],
      },
    },
  },
  
  // 日志配置
  midwayLogger: {
    default: {
      level: 'info',
      enableConsole: true,
      enableFile: true,
    },
  },
  
  // 安全配置
  security: {
    jwt: {
      secret: 'dev-secret-key',
      expiresIn: '7d',
    },
  },
  
  // 服务器配置
  koa: {
    port: 7001,
    hostname: '127.0.0.1',
  },
  
} as MidwayConfig;
