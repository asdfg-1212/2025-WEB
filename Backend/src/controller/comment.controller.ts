import { Inject, Controller, Get, Post, Put, Query, Body, Param } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CommentService, CreateCommentDTO, UpdateCommentDTO } from '../service/comment.service';

@Controller('/api/comments')
export class CommentController {
  @Inject()
  ctx: Context;

  @Inject()
  commentService: CommentService;

  // 创建评论 POST /api/comments
  @Post('/')
  async createComment(@Body() body: CreateCommentDTO) {
    try {
      const { content, user_id, activity_id, parent_id } = body;
      
      if (!content || !user_id || !activity_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.commentService.createComment({
        content,
        user_id: Number(user_id),
        activity_id: Number(activity_id),
        parent_id: parent_id ? Number(parent_id) : undefined
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

  // 获取活动评论列表 GET /api/comments/activity/:activityId
  @Get('/activity/:activityId')
  async getActivityComments(
    @Param('activityId') activityId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('include_replies') include_replies?: string
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
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        include_replies: include_replies !== 'false' // 默认包含回复
      };

      const result = await this.commentService.getActivityComments(activity_id, params);
      
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

  // 获取用户评论列表 GET /api/comments/user/:userId
  @Get('/user/:userId')
  async getUserComments(
    @Param('userId') userId: string,
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
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10
      };

      const result = await this.commentService.getUserComments(user_id, params);
      
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

  // 获取评论详情 GET /api/comments/:id
  @Get('/:id')
  async getCommentDetails(@Param('id') id: string) {
    try {
      const commentId = Number(id);
      if (isNaN(commentId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      const comment = await this.commentService.getCommentWithDetails(commentId);
      
      if (!comment) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '评论不存在',
          data: null
        };
      }

      return {
        success: true,
        message: '获取评论详情成功',
        data: comment
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

  // 更新评论 PUT /api/comments/:id
  @Put('/:id')
  async updateComment(
    @Param('id') id: string, 
    @Body() body: UpdateCommentDTO & { user_id: number }
  ) {
    try {
      const commentId = Number(id);
      if (isNaN(commentId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      const { user_id, content } = body;
      if (!user_id || !content) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.commentService.updateComment(
        commentId,
        { content },
        user_id
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

  // 删除评论 POST /api/comments/:id/delete
  @Post('/:id/delete')
  async deleteComment(
    @Param('id') id: string,
    @Body() body: { user_id: number; is_admin?: boolean }
  ) {
    try {
      const commentId = Number(id);
      if (isNaN(commentId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      const { user_id, is_admin = false } = body;
      if (!user_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少用户ID',
          data: null
        };
      }

      const result = await this.commentService.deleteComment(commentId, user_id, is_admin);
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: null
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

  // 批量删除评论 POST /api/comments/batch-delete
  @Post('/batch-delete')
  async batchDeleteComments(
    @Body() body: { comment_ids: number[]; operator_id: number }
  ) {
    try {
      const { comment_ids, operator_id } = body;
      
      if (!comment_ids || !Array.isArray(comment_ids) || !operator_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数或参数格式错误',
          data: null
        };
      }

      const result = await this.commentService.batchDeleteComments(
        comment_ids.map(id => Number(id)),
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

  // 举报评论 POST /api/comments/:id/report
  @Post('/:id/report')
  async reportComment(
    @Param('id') id: string,
    @Body() body: { reporter_id: number; reason: string }
  ) {
    try {
      const commentId = Number(id);
      if (isNaN(commentId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      const { reporter_id, reason } = body;
      if (!reporter_id || !reason) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null
        };
      }

      const result = await this.commentService.reportComment(commentId, reporter_id, reason);
      
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

  // 获取评论统计 GET /api/comments/stats
  @Get('/stats')
  async getCommentStats(@Query('activity_id') activity_id?: string) {
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

      const result = await this.commentService.getCommentStats(activityId);
      
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
}
