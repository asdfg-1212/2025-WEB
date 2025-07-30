import axios from "axios";
import type { ActivityBackend, ActivityDisplay } from '../types/activity';

const API_BASE = "http://localhost:7001/api";

// 配置axios默认设置
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 活动相关接口
export async function getActivities(options?: {
  status?: 'draft' | 'open' | 'full' | 'closed' | 'ongoing' | 'ended' | 'cancelled';
  type?: string;
  venue_id?: number;
  creator_id?: number;
  page?: number;
  pageSize?: number;
}) {
  const params = new URLSearchParams();
  
  if (options?.status) params.append('status', options.status);
  if (options?.type) params.append('type', options.type);
  if (options?.venue_id) params.append('venue_id', options.venue_id.toString());
  if (options?.creator_id) params.append('creator_id', options.creator_id.toString());
  if (options?.page) params.append('page', options.page.toString());
  if (options?.pageSize) params.append('pageSize', options.pageSize.toString());

  const url = params.toString() ? `/activities?${params.toString()}` : '/activities';
  try {
    const res = await apiClient.get(url);
    console.log('API Response:', res.data);
    
    if (res.data.success) {
      return {
        success: true,
        data: res.data.data.activities.map(transformActivityData)
      };
    }
    throw new Error(res.data.message || '获取活动列表失败');
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// 获取活动统计数据
export async function getActivityCounts(userId?: number) {
  try {
    // 获取所有活动和用户报名信息
    const [allActivitiesResponse, myRegistrationsResponse] = await Promise.all([
      getActivities(), // 使用 getActivities 函数而不是直接调用 API
      userId ? getMyRegistrations(userId) : Promise.resolve([])
    ]);

    const now = new Date();
    let openCount = 0;
    let endedCount = 0;
    let pendingCount = 0;
    let participatedCount = 0;

    // 计算报名中和已结束的活动数量（基于报名截止时间）
    if (allActivitiesResponse && allActivitiesResponse.success && Array.isArray(allActivitiesResponse.data)) {
      allActivitiesResponse.data.forEach((activity: any) => {
        if (activity.status !== 'cancelled') {
          const registrationDeadline = new Date(activity.registration_deadline);
          
          if (registrationDeadline > now) {
            openCount++; // 报名截止之前的活动
          } else {
            endedCount++; // 报名截止之后的活动
          }
        }
      });
    }

    // 计算用户的待参与和已参与活动数量
    if (userId && Array.isArray(myRegistrationsResponse)) {
      myRegistrationsResponse.forEach((reg: any) => {
        const activity = reg.activity;
        if (activity.status !== 'cancelled') {
          const startTime = new Date(activity.start_time);
          
          if (startTime > now) {
            pendingCount++; // 活动开始时间之前的已报名活动
          } else {
            participatedCount++; // 活动开始时间之后的已报名活动
          }
        }
      });
    }

    return {
      open: openCount,
      ended: endedCount,
      pending: pendingCount,
      participated: participatedCount
    };
  } catch (error) {
    console.error('获取活动统计失败:', error);
    return { open: 0, ended: 0, pending: 0, participated: 0 };
  }
}

// 数据转换函数：将后端数据格式转换为前端期望的格式
function transformActivityData(backendActivity: ActivityBackend): ActivityDisplay {
  // 活动类型映射
  const typeMapping: { [key: string]: string } = {
    'basketball': '篮球',
    'football': '足球',
    'badminton': '羽毛球',
    'tennis': '网球',
    'pingpong': '乒乓球',
    'volleyball': '排球',
    'billiards': '台球',
    'golf': '高尔夫',
    'running': '跑步',
    'swimming': '游泳',
    'martial arts': '武术',
    'dance': '舞蹈',
    'fencing': '击剑',
    'taekwondo': '跆拳道',
    'shooting': '射击',
    'skating': '滑冰',
    'other': '其他'
  };

  return {
    id: backendActivity.id,
    title: backendActivity.title, // 活动标题
    type: typeMapping[backendActivity.type] || backendActivity.type, // 正确的活动类型
    venue: (backendActivity.venue ? `${backendActivity.venue.name}${backendActivity.venue.location ? ` - ${backendActivity.venue.location}` : ''}` : '未知场馆'),
    startTime: formatDateTime(backendActivity.start_time),
    endTime: formatDateTime(backendActivity.end_time),
    registrationDeadline: formatDateTime(backendActivity.registration_deadline),
    registeredCount: backendActivity.current_participants || 0,
    maxCount: backendActivity.max_participants || 0,
    // 保持完整的活动信息用于详情页面
    status: backendActivity.status, // 添加状态字段
    description: backendActivity.description,
    notes: backendActivity.notes,
    allow_comments: backendActivity.allow_comments,
    venue_id: backendActivity.venue_id,
    start_time: backendActivity.start_time,
    end_time: backendActivity.end_time,
    registration_deadline: backendActivity.registration_deadline,
    max_participants: backendActivity.max_participants
  };
}

// 日期格式化函数
function formatDateTime(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

export async function getActivityById(id: number) {
  const res = await axios.get(`${API_BASE}/activities/${id}`);
  return res.data;
}

export async function createActivity(activity: {
  title: string;
  description: string;
  type: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  venue_id: number;
  creator_id: number;
  notes?: string;
  allow_comments?: boolean;
}) {
  const res = await apiClient.post('/activities', activity);
  if (res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || '创建活动失败');
}

export async function updateActivity(id: number, activity: any) {
  const res = await apiClient.put(`/activities/${id}`, activity);
  if (res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || '更新活动失败');
}

export async function deleteActivity(id: number) {
  const res = await apiClient.delete(`/activities/${id}`);
  if (res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || '删除活动失败');
}

// 活动报名相关接口
export async function registerForActivity(activityId: string) {
  // 获取当前用户信息
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('请先登录');
  }
  
  const user = JSON.parse(userStr);
  const res = await apiClient.post(`/activities/${activityId}/register`, {
    user_id: user.id
  });
  
  if (res.data.success) {
    return res.data;
  }
  throw new Error(res.data.message || '报名失败');
}

export async function unregisterFromActivity(activityId: string) {
  // 获取当前用户信息
  const userStr = localStorage.getItem('user');
  if (!userStr) {
    throw new Error('请先登录');
  }
  
  const user = JSON.parse(userStr);
  const res = await apiClient.delete(`/activities/${activityId}/register`, {
    data: { user_id: user.id }
  });
  
  if (res.data.success) {
    return res.data;
  }
  throw new Error(res.data.message || '取消报名失败');
}

// 获取用户的活动报名状态
export async function getRegistrationStatus(activityId: string) {
  try {
    // 获取当前用户信息
    const userStr = localStorage.getItem('user');
    let userId = null;
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
    }
    
    const url = userId 
      ? `/activities/${activityId}/registration-status?user_id=${userId}`
      : `/activities/${activityId}/registration-status`;
      
    const res = await apiClient.get(url);
    if (res.data.success) {
      return { isRegistered: res.data.data.isRegistered || false };
    }
    return { isRegistered: false };
  } catch (error) {
    console.error('获取报名状态失败:', error);
    return { isRegistered: false };
  }
}

// 获取活动参与者列表
export async function getActivityParticipants(activityId: string | number) {
  try {
    const res = await apiClient.get(`/registrations/activity/${activityId}`);
    if (res.data.success) {
      return res.data.data;
    }
    throw new Error(res.data.message || '获取参与者列表失败');
  } catch (error: any) {
    console.error('获取参与者列表失败:', error);
    throw new Error(error.message || '获取参与者列表失败');
  }
}

// 发表活动评论 - 使用用户token
export async function postActivityComment(activityId: string, content: string) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    throw new Error('用户未登录');
  }
  
  const user = JSON.parse(userStr);
  
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      content,
      user_id: user.id,
      activity_id: parseInt(activityId)
    })
  });
  
  const data = await res.json();
  if (data.code === 0) {
    return data.data;
  }
  throw new Error(data.message || '发表评论失败');
}

// 获取活动评论
export async function getActivityComments(activityId: string) {
  const res = await fetch(`/api/comments/activity/${activityId}`);
  const data = await res.json();
  if (data.code === 0) {
    return data.data.comments;
  }
  throw new Error(data.message || '获取评论失败');
}

// 更新所有活动状态
export async function refreshActivityStatus() {
  const res = await apiClient.post('/activities/refresh-status');
  if (res.data.success) {
    return res.data;
  }
  throw new Error(res.data.message || '更新活动状态失败');
}

// 获取用户报名的活动列表
export async function getMyRegistrations(userId: number) {
  const res = await apiClient.get(`/activities/my-registrations?userId=${userId}`);
  if (res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || '获取报名活动失败');
}
