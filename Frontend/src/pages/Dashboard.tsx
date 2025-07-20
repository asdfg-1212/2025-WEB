import React, { useState, useEffect } from 'react';
import '../styles/dashboard.css';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  name?: string;
  avatar?: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟从token获取用户信息
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // 这里模拟用户信息，实际应该从后端API获取
    // 专注于普通用户界面
    const mockUser: User = {
      id: '1',
      email: 'user@example.com',
      role: 'user', // 固定为普通用户
      name: '用户名',
      avatar: '/api/placeholder/40/40'
    };

    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* 顶部导航栏 */}
      <header className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome!</h1>
          <h2 className="welcome-subtitle">体育活动室</h2>
        </div>
        
        <div className="user-section">
          <div className="message-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#666"/>
              <circle cx="18" cy="6" r="3" fill="#ff4757"/>
            </svg>
          </div>
          <div className="user-avatar">
            <img 
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40NzcgMTMuNDc3IDIyIDIwIDIyQzI2LjUyMyAyMiAzMiAyNi40NzcgMzIgMzJWMzRIOFYzMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
              alt="用户头像" 
            />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            退出
          </button>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="dashboard-main">
        <div className="content-grid">
          {/* 左侧 - 活动列表 */}
          <div className="content-section activity-list-section">
            <div className="section-header">
              <h3>活动列表</h3>
              <p>发现重要点活动</p>
            </div>
            
            <div className="action-cards">
              <div className="action-card">
                <span>报名中</span>
              </div>
              <div className="action-card">
                <span>已结束</span>
              </div>
            </div>
          </div>

          {/* 右侧 - 我的活动 */}
          <div className="content-section my-activity-section">
            <div className="section-header-right">
              <h3>我的活动</h3>
              <p>突出重要点活动</p>
            </div>
            
            <div className="search-container">
              <div className="search-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.6851 13.6011L19.7359 18.6519C20.088 19.004 20.088 19.5727 19.7359 19.9248C19.3838 20.2769 18.8151 20.2769 18.463 19.9248L13.4122 14.874C11.9454 16.0444 10.0905 16.6667 8.33333 16.6667C3.73333 16.6667 0 12.9333 0 8.33333C0 3.73333 3.73333 0 8.33333 0C12.9333 0 16.6667 3.73333 16.6667 8.33333C16.6667 10.0905 16.0444 11.9454 14.6851 13.6011ZM8.33333 14.1667C11.5083 14.1667 14.1667 11.5083 14.1667 8.33333C14.1667 5.15833 11.5083 2.5 8.33333 2.5C5.15833 2.5 2.5 5.15833 2.5 8.33333C2.5 11.5083 5.15833 14.1667 8.33333 14.1667Z" fill="#999"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Search here..."
                />
              </div>
            </div>

            <div className="user-activities">
              <div className="activity-status">
                <div className="status-item">
                  <span className="status-number">3</span>
                  <span className="status-label">已参与</span>
                </div>
                <div className="status-item">
                  <span className="status-number">2</span>
                  <span className="status-label">待参与</span>
                </div>
                <div className="status-item">
                  <span className="status-number">1</span>
                  <span className="status-label">已收藏</span>
                </div>
              </div>
            
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
