import { useContext } from 'react';
import { UserContext, UserContextType } from '../contexts/UserContext';

// 自定义Hook：使用用户上下文
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
