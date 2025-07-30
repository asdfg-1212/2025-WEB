import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import type { UserContextType } from '../types/user';

// 自定义Hook：使用用户上下文
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
