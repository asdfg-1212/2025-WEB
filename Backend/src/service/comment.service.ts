import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entity/comment.entity';
import { Activity } from '../entity/activity.entity';
import { User } from '../entity/user.entity';

export interface CreateCommentDTO {
  content: string;
  user_id: number;
  activity_id: number;
  parent_id?: number; // 父评论ID，用于回复功能
}

export interface UpdateCommentDTO {
  content: string;
}

@Provide()
export class CommentService {
  @InjectEntityModel(Comment)
  commentModel: Repository<Comment>;

  @InjectEntityModel(Activity)
  activityModel: Repository<Activity>;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  // 创建评论
  async createComment(data: CreateCommentDTO) {
    try {
      const { content, user_id, activity_id, parent_id } = data;

      // 检查用户是否存在
      const user = await this.userModel.findOne({ where: { id: user_id } });
      if (!user) {
        return { code: 1, message: '用户不存在' };
      }

      // 检查活动是否存在
      const activity = await this.activityModel.findOne({ where: { id: activity_id } });
      if (!activity) {
        return { code: 2, message: '活动不存在' };
      }

      // 检查活动是否允许评论
      if (!activity.allow_comments) {
        return { code: 3, message: '该活动不允许评论' };
      }

      // 如果是回复评论，检查父评论是否存在
      if (parent_id) {
        const parentComment = await this.commentModel.findOne({ 
          where: { id: parent_id, activity_id, is_deleted: false } 
        });
        if (!parentComment) {
          return { code: 4, message: '父评论不存在或已被删除' };
        }
      }

      // 内容长度验证
      if (!content || content.trim().length === 0) {
        return { code: 5, message: '评论内容不能为空' };
      }
      if (content.length > 1000) {
        return { code: 6, message: '评论内容不能超过1000字符' };
      }

      // 创建评论
      const comment = new Comment();
      comment.content = content.trim();
      comment.user_id = user_id;
      comment.activity_id = activity_id;
      comment.parent_id = parent_id || null;

      const savedComment = await this.commentModel.save(comment);
      
      return { 
        code: 0, 
        message: '评论创建成功', 
        data: await this.getCommentWithDetails(savedComment.id)
      };
    } catch (error) {
      return { code: 999, message: '创建评论失败', error: error.message };
    }
  }

  // 获取活动的评论列表（树形结构）
  async getActivityComments(activity_id: number, params: {
    page?: number;
    pageSize?: number;
    include_replies?: boolean;
  }) {
    try {
      const { page = 1, pageSize = 20, include_replies = true } = params;

      // 检查活动是否存在
      const activity = await this.activityModel.findOne({ where: { id: activity_id } });
      if (!activity) {
        return { code: 1, message: '活动不存在', data: null };
      }

      // 先获取顶级评论（parent_id 为 null）
      const queryBuilder = this.commentModel.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.user', 'user')
        .where('comment.activity_id = :activity_id', { activity_id })
        .andWhere('comment.is_deleted = :is_deleted', { is_deleted: false })
        .andWhere('comment.parent_id IS NULL')
        .orderBy('comment.created_at', 'DESC');

      const total = await queryBuilder.getCount();
      const topLevelComments = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      // 如果需要包含回复，为每个顶级评论获取回复
      const commentsWithReplies = [];
      
      for (const comment of topLevelComments) {
        const commentData = {
          ...comment,
          user_name: comment.user.username,
          user_avatar: comment.user.avatar_emoji,
          replies: []
        };

        if (include_replies) {
          const replies = await this.commentModel.find({
            where: { 
              parent_id: comment.id, 
              is_deleted: false 
            },
            relations: ['user'],
            order: { created_at: 'ASC' }
          });

          commentData.replies = replies.map(reply => ({
            ...reply,
            user_name: reply.user.username,
            user_avatar: reply.user.avatar_emoji
          }));
        }

        commentsWithReplies.push(commentData);
      }

      return {
        code: 0,
        message: '获取评论列表成功',
        data: {
          comments: commentsWithReplies,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      return { code: 999, message: '获取评论列表失败', error: error.message };
    }
  }

  // 更新评论
  async updateComment(comment_id: number, data: UpdateCommentDTO, user_id: number) {
    try {
      // 检查评论是否存在
      const comment = await this.commentModel.findOne({ 
        where: { id: comment_id, is_deleted: false },
        relations: ['user']
      });

      if (!comment) {
        return { code: 1, message: '评论不存在或已被删除' };
      }

      // 权限检查：只有评论作者可以修改
      if (comment.user_id !== user_id) {
        return { code: 2, message: '只能修改自己的评论' };
      }

      // 检查是否超过修改时限（比如发布后30分钟内可修改）
      const now = new Date();
      const timeDiff = now.getTime() - comment.created_at.getTime();
      const maxEditTime = 30 * 60 * 1000; // 30分钟

      if (timeDiff > maxEditTime) {
        return { code: 3, message: '评论发布超过30分钟后不能修改' };
      }

      // 内容验证
      if (!data.content || data.content.trim().length === 0) {
        return { code: 4, message: '评论内容不能为空' };
      }
      if (data.content.length > 1000) {
        return { code: 5, message: '评论内容不能超过1000字符' };
      }

      // 更新评论
      comment.content = data.content.trim();
      const updatedComment = await this.commentModel.save(comment);

      return { 
        code: 0, 
        message: '评论更新成功', 
        data: await this.getCommentWithDetails(updatedComment.id)
      };
    } catch (error) {
      return { code: 999, message: '更新评论失败', error: error.message };
    }
  }

  // 删除评论（软删除）
  async deleteComment(comment_id: number, user_id: number, is_admin: boolean = false) {
    try {
      // 检查评论是否存在
      const comment = await this.commentModel.findOne({ 
        where: { id: comment_id, is_deleted: false },
        relations: ['user']
      });

      if (!comment) {
        return { code: 1, message: '评论不存在或已被删除' };
      }

      // 权限检查：评论作者或管理员可以删除
      if (comment.user_id !== user_id && !is_admin) {
        return { code: 2, message: '只能删除自己的评论或需要管理员权限' };
      }

      // 软删除评论
      comment.is_deleted = true;
      await this.commentModel.save(comment);

      // 如果这是一个顶级评论，也需要删除所有回复
      if (!comment.parent_id) {
        await this.commentModel.update(
          { parent_id: comment_id },
          { is_deleted: true }
        );
      }

      return { 
        code: 0, 
        message: '评论删除成功'
      };
    } catch (error) {
      return { code: 999, message: '删除评论失败', error: error.message };
    }
  }

  // 获取用户的评论列表
  async getUserComments(user_id: number, params: {
    page?: number;
    pageSize?: number;
  }) {
    try {
      const { page = 1, pageSize = 10 } = params;

      const queryBuilder = this.commentModel.createQueryBuilder('comment')
        .leftJoinAndSelect('comment.activity', 'activity')
        .leftJoinAndSelect('activity.venue', 'venue')
        .where('comment.user_id = :user_id', { user_id })
        .andWhere('comment.is_deleted = :is_deleted', { is_deleted: false })
        .orderBy('comment.created_at', 'DESC');

      const total = await queryBuilder.getCount();
      const comments = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      const commentsWithDetails = comments.map(comment => ({
        ...comment,
        activity_title: comment.activity.title,
        venue_name: comment.activity.venue.name
      }));

      return {
        code: 0,
        message: '获取用户评论列表成功',
        data: {
          comments: commentsWithDetails,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      return { code: 999, message: '获取用户评论列表失败', error: error.message };
    }
  }

  // 获取评论详情
  async getCommentWithDetails(comment_id: number) {
    try {
      const comment = await this.commentModel.findOne({
        where: { id: comment_id, is_deleted: false },
        relations: ['user', 'activity', 'parent']
      });

      if (!comment) {
        return null;
      }

      // 获取回复数量
      const replyCount = await this.commentModel.count({
        where: { parent_id: comment_id, is_deleted: false }
      });

      return {
        ...comment,
        user_name: comment.user.username,
        user_avatar: comment.user.avatar_emoji,
        activity_title: comment.activity.title,
        parent_user_name: comment.parent?.user?.username,
        reply_count: replyCount
      };
    } catch (error) {
      return null;
    }
  }

  // 管理员批量删除评论
  async batchDeleteComments(comment_ids: number[], operator_id: number) {
    try {
      // 权限检查
      const operator = await this.userModel.findOne({ where: { id: operator_id } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }

      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以批量删除评论' };
      }

      const result = await this.commentModel.update(
        { id: { $in: comment_ids } as any },
        { is_deleted: true }
      );

      return {
        code: 0,
        message: `批量删除完成，共删除 ${result.affected} 条评论`,
        data: { affected: result.affected }
      };
    } catch (error) {
      return { code: 999, message: '批量删除评论失败', error: error.message };
    }
  }

  // 获取评论统计
  async getCommentStats(activity_id?: number) {
    try {
      const queryBuilder = this.commentModel.createQueryBuilder('comment')
        .where('comment.is_deleted = :is_deleted', { is_deleted: false });
      
      if (activity_id) {
        queryBuilder.andWhere('comment.activity_id = :activity_id', { activity_id });
      }

      const total = await queryBuilder.getCount();
      const topLevel = await queryBuilder.clone().andWhere('comment.parent_id IS NULL').getCount();
      const replies = total - topLevel;

      // 获取最活跃的评论者（如果没有指定活动）
      let topCommenters = [];
      if (!activity_id) {
        const topCommenterQuery = await this.commentModel.createQueryBuilder('comment')
          .select('comment.user_id', 'user_id')
          .addSelect('COUNT(*)', 'comment_count')
          .leftJoin('comment.user', 'user')
          .addSelect('user.username', 'username')
          .where('comment.is_deleted = :is_deleted', { is_deleted: false })
          .groupBy('comment.user_id')
          .addGroupBy('user.username')
          .orderBy('comment_count', 'DESC')
          .limit(5)
          .getRawMany();

        topCommenters = topCommenterQuery.map(item => ({
          user_id: item.user_id,
          username: item.username,
          comment_count: parseInt(item.comment_count)
        }));
      }

      return {
        code: 0,
        message: '获取评论统计成功',
        data: {
          total,
          topLevel,
          replies,
          topCommenters
        }
      };
    } catch (error) {
      return { code: 999, message: '获取评论统计失败', error: error.message };
    }
  }

  // 举报评论（可以扩展为审核功能）
  async reportComment(comment_id: number, reporter_id: number, reason: string) {
    try {
      // 检查评论是否存在
      const comment = await this.commentModel.findOne({ 
        where: { id: comment_id, is_deleted: false } 
      });

      if (!comment) {
        return { code: 1, message: '评论不存在或已被删除' };
      }

      // 检查举报者是否存在
      const reporter = await this.userModel.findOne({ where: { id: reporter_id } });
      if (!reporter) {
        return { code: 2, message: '举报者不存在' };
      }

      // 这里可以创建一个举报表来记录举报信息
      // 现在简单实现：记录到日志或直接处理
      
      // 如果举报理由严重，可以直接标记为删除
      const seriousReasons = ['spam', 'abuse', 'inappropriate'];
      if (seriousReasons.some(reason_type => reason.toLowerCase().includes(reason_type))) {
        comment.is_deleted = true;
        await this.commentModel.save(comment);
        
        return {
          code: 0,
          message: '举报已处理，评论已被删除',
          data: { action: 'deleted' }
        };
      }

      return {
        code: 0,
        message: '举报已提交，管理员将进行审核',
        data: { action: 'reported' }
      };
    } catch (error) {
      return { code: 999, message: '举报评论失败', error: error.message };
    }
  }
}
