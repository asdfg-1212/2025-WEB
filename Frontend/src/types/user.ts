// 用户相关类型定义
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar_emoji?: string | null;
  created_at?: string;
}

// 用户上下文状态类型
export interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

// API 响应类型
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
