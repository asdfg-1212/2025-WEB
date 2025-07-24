import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, isLoading } = useUser();

  // 加载中显示加载状态
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  // 未认证重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 需要管理员权限但用户不是管理员
  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <h2>权限不足</h2>
        <p>您没有访问此页面的权限</p>
        <button onClick={() => window.history.back()}>
          返回上一页
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
