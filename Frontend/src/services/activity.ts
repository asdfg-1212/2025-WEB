import axios from "axios";

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
function transformActivityData(backendActivity: any) {
  return {
    id: backendActivity.id.toString(),
    type: backendActivity.title, // 使用标题作为类型显示
    venue: backendActivity.venue_name || backendActivity.venue?.name || '未知场馆',
    startTime: formatDateTime(backendActivity.start_time),
    endTime: formatDateTime(backendActivity.end_time),
    registrationDeadline: formatDateTime(backendActivity.registration_deadline),
    registeredCount: backendActivity.current_participants || 0,
    maxCount: backendActivity.max_participants || 0,
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
