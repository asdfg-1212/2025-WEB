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
  parent_id?: number;
}

export interface UpdateCommentDTO {
  content?: string;
}

export interface CommentWithUser {
  id: number;
  content: string;
  user_id: number;
  activity_id: number;
  parent_id: number | null;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  user: {
    id: number;
    username: string;
    avatar_emoji?: string;
  };
  replies?: CommentWithUser[];
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

      // 验证活动是否存在
      const activity = await this.activityModel.findOne({
        where: { id: activity_id }
      });

      if (!activity) {
        return {
          code: 404,
          message: '活动不存在',
          data: null
        };
      }

      // 验证用户是否存在
      const user = await this.userModel.findOne({
        where: { id: user_id }
      });

      if (!user) {
        return {
          code: 404,
          message: '用户不存在',
          data: null
        };
      }

      // 如果是回复评论，验证父评论是否存在
      if (parent_id) {
        const parentComment = await this.commentModel.findOne({
          where: { 
            id: parent_id,
            activity_id: activity_id,
            is_deleted: false
          }
        });

        if (!parentComment) {
          return {
            code: 404,
            message: '父评论不存在',
            data: null
          };
        }
      }

      // 创建评论
      const comment = this.commentModel.create({
        content,
        user_id,
        activity_id,
        parent_id: parent_id || null
      });

      const savedComment = await this.commentModel.save(comment);

      // 获取完整的评论信息（包含用户信息）
      const fullComment = await this.commentModel.findOne({
        where: { id: savedComment.id },
        relations: ['user'],
        select: {
          id: true,
          content: true,
          user_id: true,
          activity_id: true,
          parent_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          user: {
            id: true,
            username: true,
            avatar_emoji: true
          }
        }
      });

      return {
        code: 0,
        message: '评论创建成功',
        data: fullComment
      };
    } catch (error) {
      console.error('创建评论失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 获取活动的所有评论（树形结构）
  async getActivityComments(activityId: number) {
    try {
      // 验证活动是否存在
      const activity = await this.activityModel.findOne({
        where: { id: activityId }
      });

      if (!activity) {
        return {
          code: 404,
          message: '活动不存在',
          data: null
        };
      }

      // 获取所有评论（未删除的）
      const comments = await this.commentModel.find({
        where: { 
          activity_id: activityId,
          is_deleted: false
        },
        relations: ['user'],
        select: {
          id: true,
          content: true,
          user_id: true,
          activity_id: true,
          parent_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          user: {
            id: true,
            username: true,
            avatar_emoji: true
          }
        },
        order: {
          created_at: 'ASC'
        }
      });

      // 构建树形结构
      const commentTree = this.buildCommentTree(comments);

      return {
        code: 0,
        message: '获取评论成功',
        data: commentTree
      };
    } catch (error) {
      console.error('获取活动评论失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 获取单个评论详情
  async getCommentById(commentId: number) {
    try {
      const comment = await this.commentModel.findOne({
        where: { 
          id: commentId,
          is_deleted: false
        },
        relations: ['user', 'activity'],
        select: {
          id: true,
          content: true,
          user_id: true,
          activity_id: true,
          parent_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          user: {
            id: true,
            username: true,
            avatar_emoji: true
          },
          activity: {
            id: true,
            title: true
          }
        }
      });

      if (!comment) {
        return {
          code: 404,
          message: '评论不存在',
          data: null
        };
      }

      return {
        code: 0,
        message: '获取评论成功',
        data: comment
      };
    } catch (error) {
      console.error('获取评论详情失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 更新评论
  async updateComment(commentId: number, userId: number, data: UpdateCommentDTO) {
    try {
      const comment = await this.commentModel.findOne({
        where: { 
          id: commentId,
          is_deleted: false
        }
      });

      if (!comment) {
        return {
          code: 404,
          message: '评论不存在',
          data: null
        };
      }

      // 验证是否是评论作者
      if (comment.user_id !== userId) {
        return {
          code: 403,
          message: '只能修改自己的评论',
          data: null
        };
      }

      // 更新评论
      await this.commentModel.update(commentId, {
        ...data,
        updated_at: new Date()
      });

      // 获取更新后的评论
      const updatedComment = await this.commentModel.findOne({
        where: { id: commentId },
        relations: ['user'],
        select: {
          id: true,
          content: true,
          user_id: true,
          activity_id: true,
          parent_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          user: {
            id: true,
            username: true,
            avatar_emoji: true
          }
        }
      });

      return {
        code: 0,
        message: '评论更新成功',
        data: updatedComment
      };
    } catch (error) {
      console.error('更新评论失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 删除评论（软删除）
  async deleteComment(commentId: number, userId: number) {
    try {
      const comment = await this.commentModel.findOne({
        where: { 
          id: commentId,
          is_deleted: false
        }
      });

      if (!comment) {
        return {
          code: 404,
          message: '评论不存在',
          data: null
        };
      }

      // 验证是否是评论作者
      if (comment.user_id !== userId) {
        return {
          code: 403,
          message: '只能删除自己的评论',
          data: null
        };
      }

      // 软删除评论
      await this.commentModel.update(commentId, {
        is_deleted: true,
        updated_at: new Date()
      });

      return {
        code: 0,
        message: '评论删除成功',
        data: null
      };
    } catch (error) {
      console.error('删除评论失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 获取用户的所有评论
  async getUserComments(userId: number, page: number = 1, pageSize: number = 10) {
    try {
      const skip = (page - 1) * pageSize;

      const [comments, total] = await this.commentModel.findAndCount({
        where: { 
          user_id: userId,
          is_deleted: false
        },
        relations: ['activity'],
        select: {
          id: true,
          content: true,
          user_id: true,
          activity_id: true,
          parent_id: true,
          is_deleted: true,
          created_at: true,
          updated_at: true,
          activity: {
            id: true,
            title: true
          }
        },
        order: {
          created_at: 'DESC'
        },
        skip,
        take: pageSize
      });

      return {
        code: 0,
        message: '获取用户评论成功',
        data: {
          comments,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      console.error('获取用户评论失败:', error);
      return {
        code: 500,
        message: '服务器内部错误',
        data: null
      };
    }
  }

  // 构建评论树形结构的辅助方法
  private buildCommentTree(comments: any[]): CommentWithUser[] {
    const commentMap = new Map<number, CommentWithUser>();
    const rootComments: CommentWithUser[] = [];

    // 第一遍：将所有评论转换为树节点格式
    comments.forEach(comment => {
      const treeNode: CommentWithUser = {
        ...comment,
        replies: []
      };
      commentMap.set(comment.id, treeNode);
    });

    // 第二遍：构建树形结构
    comments.forEach(comment => {
      const treeNode = commentMap.get(comment.id)!;
      
      if (comment.parent_id === null) {
        // 根评论
        rootComments.push(treeNode);
      } else {
        // 回复评论
        const parentNode = commentMap.get(comment.parent_id);
        if (parentNode) {
          parentNode.replies!.push(treeNode);
        }
      }
    });

    return rootComments;
  }
}
