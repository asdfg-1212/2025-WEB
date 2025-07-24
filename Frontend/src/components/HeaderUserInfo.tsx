import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { getUserAvatar } from '../utils/avatar';
import '../styles/header-user-info.css';

const HeaderUserInfo: React.FC = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="header-user-info">
      <div className="header-user-content">
        <div className="header-user-avatar">
          <img 
            src={getUserAvatar(user)}
            alt={`${user.username}的头像`}
          />
          {user.role === 'admin' && (
            <div className="header-admin-badge">👑</div>
          )}
        </div>
        
        <div className="header-user-details">
          <div 
            className="header-username"
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
            title="查看个人信息"
          >
            {user.username}
          </div>
          <div className="header-user-role">
            {user.role === 'admin' ? '管理员' : '用户'}
          </div>
        </div>
        
        <button 
          className="header-logout-btn"
          onClick={handleLogout}
          title="退出登录"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z" fill="currentColor"/>
            <path d="M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default HeaderUserInfo;
