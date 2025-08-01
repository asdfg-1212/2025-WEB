import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { getUserAvatar } from '../utils/avatar';
import '../styles/dashboard.css';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title = "体育活动", 
  subtitle = "Sports Activities",
  showBackButton = false
}) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return null;
  }

  return (
    <header className="dashboard-header">
      <div className="header-left">
        {showBackButton && (
          <button 
            className="back-button" 
            onClick={handleBackToHome}
            style={{
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '8px 16px',
              marginRight: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#666'
            }}
          >
            ← 返回主页
          </button>
        )}
        <div className="welcome-section">
          <h1 className="welcome-title">{title}</h1>
          <h2 className="welcome-subtitle">{subtitle}</h2>
        </div>
      </div>
      
      <div className="user-section">
        <div className="user-avatar">
          <img 
            src={getUserAvatar(user)}
            alt={`${user?.username || '用户'}的头像`} 
          />
        </div>
        <span className="user-name" style={{ margin: '0 10px', color: '#333' }}>
          {user?.username}
        </span>
        {user?.role === 'admin' && (
          <span className="admin-badge" style={{ marginRight: '10px' }}>👑</span>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          退出
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
