import type { User } from '../types/user';

// TODO: 替换为实际的后端地址
const API_BASE = 'http://localhost:7001';

export async function login(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, username, password })
  });

  if (!response.ok) {
    throw new Error('登录失败');
  }

  const result = await response.json();
  
  // 检查后端返回的错误
  if (result.code !== 0) {
    throw new Error(result.message || '登录失败');
  }

  // 后端没有返回token，我们暂时生成一个假的token
  // TODO: 后端需要实现JWT token生成
  const token = 'fake-jwt-token-' + Date.now();
  
  // 存储到 localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(result.data));
  
  return { user: result.data, token };
}

export async function register(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });

  if (!response.ok) {
    throw new Error('注册失败');
  }

  const result = await response.json();
  
  // 检查后端返回的错误
  if (result.code && result.code !== 0) {
    throw new Error(result.message || '注册失败');
  }

  // 注册成功后自动登录
  return await login(email, username, password);
}

export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) {
    return null;
  }

  try {
    // 先尝试从localStorage获取用户数据
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }

    // 如果localStorage没有用户数据，清除token
    logout();
    return null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    logout(); // 清除无效数据
    return null;
  }
}
