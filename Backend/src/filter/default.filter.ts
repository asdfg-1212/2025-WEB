import { Catch } from '@midwayjs/core';

@Catch()
export class DefaultErrorFilter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async catch(err: Error, ..._args: any[]) {
    // 所有的未分类错误会到这里
    return {
      success: false,
      message: err.message,
    };
  }
}
