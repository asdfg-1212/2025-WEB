import { MidwayConfig } from '@midwayjs/core';
import { User } from '../entity/user.entity';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1751522415118_1020',
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource:{
      default: {
        type: 'sqlite',
        database: './database.sqlite', // SQLite 数据库文件路径
        synchronize: true, // 自动同步实体
        logging: true, // 日志输出
        entities: [User],
      },
    },
  },
} as MidwayConfig;
