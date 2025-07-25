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
  const res = await apiClient.get(url);
  
  if (res.data.success) {
    return res.data.data.activities.map(transformActivityData);
  }
  throw new Error(res.data.message || '获取活动列表失败');
}

// 获取活动统计数据
export async function getActivityCounts() {
  try {
    const [openResponse, endedResponse] = await Promise.all([
      apiClient.get('/activities?status=open&pageSize=1'),
      apiClient.get('/activities?status=ended&pageSize=1')
    ]);

    return {
      open: openResponse.data.success ? openResponse.data.data.pagination.total : 0,
      ended: endedResponse.data.success ? endedResponse.data.data.pagination.total : 0
    };
  } catch (error) {
    console.error('获取活动统计失败:', error);
    return { open: 0, ended: 0 };
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
  const res = await axios.post(`${API_BASE}/activities`, activity);
  return res.data;
}

export async function updateActivity(id: number, activity: any) {
  const res = await axios.put(`${API_BASE}/activities/${id}`, activity);
  return res.data;
}

export async function deleteActivity(id: number) {
  const res = await axios.delete(`${API_BASE}/activities/${id}`);
  return res.data;
}

// 活动报名相关接口
export async function registerForActivity(activityId: string) {
  const res = await apiClient.post(`/activities/${activityId}/register`);
  if (res.data.success) {
    return res.data;
  }
  throw new Error(res.data.message || '报名失败');
}

export async function unregisterFromActivity(activityId: string) {
  const res = await apiClient.delete(`/activities/${activityId}/register`);
  if (res.data.success) {
    return res.data;
  }
  throw new Error(res.data.message || '取消报名失败');
}

// 获取用户的活动报名状态
export async function getRegistrationStatus(activityId: string) {
  try {
    const res = await apiClient.get(`/activities/${activityId}/registration-status`);
    if (res.data.success) {
      return res.data.data.isRegistered;
    }
    return false;
  } catch (error) {
    console.error('获取报名状态失败:', error);
    return false;
  }
}

// 获取活动参与者列表
export async function getActivityParticipants(activityId: string) {
  const res = await apiClient.get(`/activities/${activityId}/participants`);
  if (res.data.success) {
    return res.data.data.participants;
  }
  throw new Error(res.data.message || '获取参与者列表失败');
}

// 发表活动评论
export async function postActivityComment(activityId: string, content: string) {
  const res = await apiClient.post(`/activities/${activityId}/comments`, { content });
  if (res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || '发表评论失败');
}

// 获取活动评论
export async function getActivityComments(activityId: string) {
  const res = await apiClient.get(`/activities/${activityId}/comments`);
  if (res.data.success) {
    return res.data.data.comments;
  }
  throw new Error(res.data.message || '获取评论失败');
}
