// 统一的活动类型定义

// 后端返回的原始活动数据
export interface ActivityBackend {
  id: number;
  title: string;
  description?: string;
  type: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  venue_id: number;
  notes?: string;
  allow_comments?: boolean;
  current_participants?: number;
  venue?: {
    id: number;
    name: string;
    location?: string;
  };
}

// 前端显示用的活动数据（经过transformActivityData转换）
export interface ActivityDisplay {
  id: number;
  title: string;
  type: string;
  venue: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  registeredCount: number;
  maxCount: number;
  // 保持完整的活动信息用于详情页面
  description?: string;
  notes?: string;
  allow_comments?: boolean;
  venue_id: number;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
}

// ActivityCard 和 ActivityList 使用的简化接口
export interface ActivityCard {
  id: string | number;
  title: string;
  type: string;
  venue: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  registeredCount: number;
  maxCount: number;
}

// ActivityDetailModal 使用的完整接口
export interface ActivityDetail {
  id: number;
  title: string;
  description?: string;
  type: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  venue_id: number;
  notes?: string;
  allow_comments?: boolean;
  registeredCount?: number;
  venue?: {
    id: number;
    name: string;
    location?: string;
  };
}
