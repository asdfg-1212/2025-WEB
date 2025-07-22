import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from '../entity/venue.entity';
import { User } from '../entity/user.entity';

export interface CreateVenueDTO {
  name: string;
  is_active?: boolean;
}

export interface UpdateVenueDTO {
  name?: string;
  is_active?: boolean;
}

@Provide()
export class VenueService {
  @InjectEntityModel(Venue)
  venueModel: Repository<Venue>;

  @InjectEntityModel(User)
  userModel: Repository<User>;

  // 创建场馆
  async createVenue(data: CreateVenueDTO, operatorId: number) {
    try {
      // 权限检查：只有管理员可以创建场馆
      const operator = await this.userModel.findOne({ where: { id: operatorId } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }
      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以创建场馆' };
      }

      // 检查场馆名称是否已存在
      const existingVenue = await this.venueModel.findOne({ where: { name: data.name } });
      if (existingVenue) {
        return { code: 3, message: '场馆名称已存在' };
      }

      // 创建场馆
      const venue = new Venue();
      venue.name = data.name;
      venue.is_active = data.is_active ?? true; // 默认为可用状态

      const savedVenue = await this.venueModel.save(venue);
      
      return { 
        code: 0, 
        message: '场馆创建成功', 
        data: savedVenue
      };
    } catch (error) {
      return { code: 999, message: '创建场馆失败', error: error.message };
    }
  }

  // 获取场馆列表
  async getVenues(params: {
    is_active?: boolean;
    page?: number;
    pageSize?: number;
    search?: string;
  }) {
    try {
      const { is_active, page = 1, pageSize = 20, search } = params;
      
      const queryBuilder = this.venueModel.createQueryBuilder('venue')
        .orderBy('venue.created_at', 'DESC');

      // 添加筛选条件
      if (typeof is_active === 'boolean') {
        queryBuilder.andWhere('venue.is_active = :is_active', { is_active });
      }

      // 搜索功能
      if (search) {
        queryBuilder.andWhere('venue.name LIKE :search', { search: `%${search}%` });
      }

      // 分页
      const total = await queryBuilder.getCount();
      const venues = await queryBuilder
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getMany();

      return {
        code: 0,
        message: '获取场馆列表成功',
        data: {
          venues,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
          }
        }
      };
    } catch (error) {
      return { code: 999, message: '获取场馆列表失败', error: error.message };
    }
  }

  // 获取单个场馆详情
  async getVenueById(venueId: number) {
    try {
      const venue = await this.venueModel.findOne({ where: { id: venueId } });
      
      if (!venue) {
        return { code: 1, message: '场馆不存在', data: null };
      }

      return {
        code: 0,
        message: '获取场馆详情成功',
        data: venue
      };
    } catch (error) {
      return { code: 999, message: '获取场馆详情失败', error: error.message };
    }
  }

  // 获取可用场馆列表（用于活动创建时的选择）
  async getAvailableVenues() {
    try {
      const venues = await this.venueModel.find({
        where: { is_active: true },
        order: { name: 'ASC' }
      });

      return {
        code: 0,
        message: '获取可用场馆成功',
        data: venues
      };
    } catch (error) {
      return { code: 999, message: '获取可用场馆失败', error: error.message };
    }
  }

  // 更新场馆
  async updateVenue(venueId: number, data: UpdateVenueDTO, operatorId: number) {
    try {
      // 权限检查：只有管理员可以修改场馆
      const operator = await this.userModel.findOne({ where: { id: operatorId } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }
      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以修改场馆' };
      }

      // 检查场馆是否存在
      const venue = await this.venueModel.findOne({ where: { id: venueId } });
      if (!venue) {
        return { code: 3, message: '场馆不存在' };
      }

      // 如果要修改名称，检查新名称是否已被其他场馆使用
      if (data.name && data.name !== venue.name) {
        const existingVenue = await this.venueModel.findOne({ 
          where: { name: data.name } 
        });
        if (existingVenue && existingVenue.id !== venueId) {
          return { code: 4, message: '场馆名称已存在' };
        }
      }

      // 更新场馆
      Object.assign(venue, data);
      const updatedVenue = await this.venueModel.save(venue);

      return { 
        code: 0, 
        message: '场馆更新成功', 
        data: updatedVenue
      };
    } catch (error) {
      return { code: 999, message: '更新场馆失败', error: error.message };
    }
  }

  // 启用/禁用场馆
  async toggleVenueStatus(venueId: number, operatorId: number) {
    try {
      // 权限检查
      const operator = await this.userModel.findOne({ where: { id: operatorId } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }
      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以修改场馆状态' };
      }

      // 检查场馆是否存在
      const venue = await this.venueModel.findOne({ where: { id: venueId } });
      if (!venue) {
        return { code: 3, message: '场馆不存在' };
      }

      // 切换状态
      venue.is_active = !venue.is_active;
      const updatedVenue = await this.venueModel.save(venue);

      const statusText = updatedVenue.is_active ? '启用' : '禁用';
      return { 
        code: 0, 
        message: `场馆${statusText}成功`, 
        data: updatedVenue
      };
    } catch (error) {
      return { code: 999, message: '修改场馆状态失败', error: error.message };
    }
  }

  // 删除场馆（软删除 - 通过禁用实现）
  async deleteVenue(venueId: number, operatorId: number) {
    try {
      // 权限检查：只有超级管理员可以删除场馆
      const operator = await this.userModel.findOne({ where: { id: operatorId } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }
      if (operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有超级管理员可以删除场馆' };
      }

      // 检查场馆是否存在
      const venue = await this.venueModel.findOne({ where: { id: venueId } });
      if (!venue) {
        return { code: 3, message: '场馆不存在' };
      }

      // 检查是否有活动在使用该场馆
      // 这里简单处理，实际项目中可能需要更复杂的检查
      // 可以检查是否有未结束的活动在使用此场馆

      // 软删除：设置为不可用
      venue.is_active = false;
      await this.venueModel.save(venue);

      return { 
        code: 0, 
        message: '场馆删除成功（已设为不可用）'
      };
    } catch (error) {
      return { code: 999, message: '删除场馆失败', error: error.message };
    }
  }

  // 批量创建场馆（用于初始化数据）
  async batchCreateVenues(venues: CreateVenueDTO[], operatorId: number) {
    try {
      // 权限检查
      const operator = await this.userModel.findOne({ where: { id: operatorId } });
      if (!operator) {
        return { code: 1, message: '操作者不存在' };
      }
      if (operator.role !== 'admin' && operator.role !== 'super_admin') {
        return { code: 2, message: '权限不足，只有管理员可以批量创建场馆' };
      }

      const results = [];
      const errors = [];

      for (let i = 0; i < venues.length; i++) {
        const venueData = venues[i];
        
        // 检查名称是否已存在
        const existingVenue = await this.venueModel.findOne({ 
          where: { name: venueData.name } 
        });
        
        if (existingVenue) {
          errors.push(`场馆 "${venueData.name}" 已存在`);
          continue;
        }

        // 创建场馆
        const venue = new Venue();
        venue.name = venueData.name;
        venue.is_active = venueData.is_active ?? true;

        const savedVenue = await this.venueModel.save(venue);
        results.push(savedVenue);
      }

      return {
        code: 0,
        message: `批量创建完成，成功 ${results.length} 个，失败 ${errors.length} 个`,
        data: {
          created: results,
          errors: errors
        }
      };
    } catch (error) {
      return { code: 999, message: '批量创建场馆失败', error: error.message };
    }
  }

  // 获取场馆统计信息
  async getVenueStats() {
    try {
      const total = await this.venueModel.count();
      const active = await this.venueModel.count({ where: { is_active: true } });
      const inactive = total - active;

      return {
        code: 0,
        message: '获取场馆统计成功',
        data: {
          total,
          active,
          inactive,
          activeRate: total > 0 ? Math.round((active / total) * 100) : 0
        }
      };
    } catch (error) {
      return { code: 999, message: '获取场馆统计失败', error: error.message };
    }
  }
}
