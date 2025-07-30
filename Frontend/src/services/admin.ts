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

// 创建活动
export async function createActivity(activity: {
  title: string;
  description?: string;
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

// 创建场馆
export async function createVenue(venue: {
  name: string;
  location?: string;
  operator_id: number;
}) {
  const res = await apiClient.post('/venues', venue);
  if (res.data.success) {
    return res.data.data;
  }
  throw new Error(res.data.message || '创建场馆失败');
}

// 获取可用场馆列表
export async function getAvailableVenues() {
  const res = await apiClient.get('/venues/available');
  if (res.data.success) {
    return res.data.data; // 直接返回venues数组
  }
  throw new Error(res.data.message || '获取场馆列表失败');
}
