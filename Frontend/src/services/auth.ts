import type { User } from '../types/user';

// TODO: 替换为实际的后端地址
const API_BASE = 'http://localhost:7001';

export async function login(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, username, password })
  });

  if (!response.ok) {
    throw new Error('登录失败');
  }

  const data = await response.json();
  const token = data.token;
  
  // 存储到 localStorage
  localStorage.setItem('token', token);
  
  return { user: data.user, token };
}

export async function register(email: string, username: string, password: string): Promise<{ user: User; token: string }> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  });

  if (!response.ok) {
    throw new Error('注册失败');
  }

  const data = await response.json();
  const token = data.token;
  
  // 存储到 localStorage
  localStorage.setItem('token', token);
  
  return { user: data.user, token };
}

export function logout(): void {
  localStorage.removeItem('token');
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
    const response = await fetch(`${API_BASE}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('获取用户信息失败');
    }

    const user = await response.json();
    return user;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    logout(); // 清除无效token
    return null;
  }
}
