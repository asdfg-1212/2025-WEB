import React from 'react';
import { useUser } from '../hooks/useUser';
import { getUserAvatar } from '../utils/avatar';
import '../styles/user-profile.css';

const UserProfile: React.FC = () => {
  const { user, isLoading, logout } = useUser();

  if (isLoading) {
    return (
      <div className="user-profile loading">
        <div className="user-avatar skeleton"></div>
        <div className="user-info">
          <div className="skeleton-text"></div>
          <div className="skeleton-text small"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="user-profile">
      <div className="user-avatar">
        <img 
          src={getUserAvatar(user)}
          alt={`${user.username}的头像`}
          onError={(e) => {
            // 如果头像加载失败，使用默认头像
            e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40NzcgMTMuNDc3IDIyIDIwIDIyQzI2LjUyMyAyMiAzMiAyNi40NzcgMzIgMzJWMzRIOFYzMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=";
          }}
        />
        {user.role === 'admin' && (
          <div className="admin-badge" title="管理员">
            👑
          </div>
        )}
      </div>
      
      <div className="user-info">
        <div className="user-name">{user.username}</div>
        <div className="user-email">{user.email}</div>
        <div className="user-role">
          {user.role === 'admin' ? '管理员' : '用户'}
        </div>
      </div>
      
      <div className="user-actions">
        <button 
          className="logout-btn"
          onClick={logout}
          title="退出登录"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5z" fill="currentColor"/>
            <path d="M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="currentColor"/>
          </svg>
          退出
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
