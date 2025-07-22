import { Inject, Controller, Get, Post, Put, Query, Body, Param } from '@midwayjs/core';
import { Del } from '@midwayjs/decorator';
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
      
      // 基础参数验证
      if (!content || !user_id || !activity_id) {
        this.ctx.status = 400;
        return {
          code: 400,
          message: '缺少必要参数：content, user_id, activity_id',
          data: null
        };
      }

      // 内容长度验证
      if (content.trim().length === 0) {
        this.ctx.status = 400;
        return {
          code: 400,
          message: '评论内容不能为空',
          data: null
        };
      }

      if (content.length > 1000) {
        this.ctx.status = 400;
        return {
          code: 400,
          message: '评论内容不能超过1000个字符',
          data: null
        };
      }

      const commentData: CreateCommentDTO = {
        content: content.trim(),
        user_id: Number(user_id),
        activity_id: Number(activity_id),
        parent_id: parent_id ? Number(parent_id) : undefined
      };

      const result = await this.commentService.createComment(commentData);
      
      if (result.code === 0) {
        this.ctx.status = 201; // Created
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = result.code === 404 ? 404 : 400;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      console.error('创建评论失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 获取活动的所有评论 GET /api/comments/activity/:activityId
  @Get('/activity/:activityId')
  async getActivityComments(@Param('activityId') activityId: string) {
    try {
      if (!activityId || isNaN(Number(activityId))) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null
        };
      }

      const result = await this.commentService.getActivityComments(Number(activityId));
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      console.error('获取活动评论失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 获取单个评论详情 GET /api/comments/:commentId
  @Get('/:commentId')
  async getCommentById(@Param('commentId') commentId: string) {
    try {
      if (!commentId || isNaN(Number(commentId))) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      const result = await this.commentService.getCommentById(Number(commentId));
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      console.error('获取评论详情失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 更新评论 PUT /api/comments/:commentId
  @Put('/:commentId')
  async updateComment(
    @Param('commentId') commentId: string, 
    @Body() body: UpdateCommentDTO & { user_id: number }
  ) {
    try {
      const { content, user_id } = body;

      if (!commentId || isNaN(Number(commentId))) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      if (!user_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少用户ID',
          data: null
        };
      }

      if (!content) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '评论内容不能为空',
          data: null
        };
      }

      if (content.trim().length === 0) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '评论内容不能为空',
          data: null
        };
      }

      if (content.length > 1000) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '评论内容不能超过1000个字符',
          data: null
        };
      }

      const updateData: UpdateCommentDTO = {
        content: content.trim()
      };

      const result = await this.commentService.updateComment(
        Number(commentId), 
        Number(user_id), 
        updateData
      );
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      console.error('更新评论失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 删除评论 DELETE /api/comments/:commentId
  @Del('/:commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @Body() body: { user_id: number }
  ) {
    try {
      const { user_id } = body;

      if (!commentId || isNaN(Number(commentId))) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的评论ID',
          data: null
        };
      }

      if (!user_id) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少用户ID',
          data: null
        };
      }

      const result = await this.commentService.deleteComment(
        Number(commentId), 
        Number(user_id)
      );
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: null
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 获取用户的所有评论 GET /api/comments/user/:userId
  @Get('/user/:userId')
  async getUserComments(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10'
  ) {
    try {
      if (!userId || isNaN(Number(userId))) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的用户ID',
          data: null
        };
      }

      const pageNum = parseInt(page) || 1;
      const pageSizeNum = parseInt(pageSize) || 10;

      // 限制每页最大数量
      if (pageSizeNum > 50) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '每页最多只能获取50条记录',
          data: null
        };
      }

      const result = await this.commentService.getUserComments(
        Number(userId), 
        pageNum, 
        pageSizeNum
      );
      
      if (result.code === 0) {
        return {
          success: true,
          message: result.message,
          data: result.data
        };
      } else {
        this.ctx.status = result.code;
        return {
          success: false,
          message: result.message,
          data: null
        };
      }
    } catch (error) {
      console.error('获取用户评论失败:', error);
      this.ctx.status = 500;
      return {
        success: false,
        message: '服务器内部错误',
        data: null
      };
    }
  }
}
