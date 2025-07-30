import React, { createContext, useState, useEffect } from 'react';
import type { User, UserContextType } from '../types/user';
import * as authService from '../services/auth';

// 创建用户上下文
export const UserContext = createContext<UserContextType | undefined>(undefined);

// 用户上下文提供者组件
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 计算是否已认证
  const isAuthenticated = !!user;

  // 登录函数
  const login = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.login(email, username, password);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : '登录失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 注册函数
  const register = async (email: string, username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.register(email, username, password);
      setUser(response.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : '注册失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const userInfo = await authService.getCurrentUser();
      setUser(userInfo);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      // 如果获取失败，清除本地token
      authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 更新用户信息
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  // 组件挂载时检查用户登录状态
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const contextValue: UserContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    updateUser
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
