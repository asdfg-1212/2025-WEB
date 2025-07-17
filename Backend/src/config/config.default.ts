import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1751522415118_1020',
  koa: {
    port: 7001,
  },
  orm: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '你的密码',
    database: '你的数据库名',
    synchronize: true, // 自动同步实体
    logging: true,
  },
} as MidwayConfig;
