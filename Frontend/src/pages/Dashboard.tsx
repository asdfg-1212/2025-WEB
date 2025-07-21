import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  const handleStatusClick = (type: string) => {
    switch (type) {
      case 'registration-open':
        navigate('/activities/registration-open');
        break;
      case 'ended':
        navigate('/activities/ended');
        break;
      case 'participated':
        navigate('/activities/participated');
        break;
      case 'pending':
        navigate('/activities/pending');
        break;
      default:
        break;
    }
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
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#666"/>
              {/*未读私信<circle cx="18" cy="6" r="3" fill="#ff4757"/>*/}
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
          {/* 左侧 - 活动大全 */}
          <div className="content-section activity-list-section">
            <div className="section-header">
              <h3>活动大全</h3>
              <p>Find Activities</p>
            </div>
            
            <div className="activity-status">
              <div className="status-item" onClick={() => handleStatusClick('registration-open')}>
                <span className="status-number">5</span>
                <span className="status-label">报名中</span>
              </div>
              <div className="status-item" onClick={() => handleStatusClick('ended')}>
                <span className="status-number">8</span>
                <span className="status-label">已结束</span>
              </div>
            </div>
          </div>

          {/* 右侧 - 我的活动 */}
          <div className="content-section my-activity-section">
            <div className="section-header-right">
              <h3>我的活动</h3>
              <p>My Activities</p>
            </div>

            <div className="user-activities">
              <div className="activity-status">
                <div className="status-item" onClick={() => handleStatusClick('participated')}>
                  <span className="status-number">3</span>
                  <span className="status-label">已参与</span>
                </div>
                <div className="status-item" onClick={() => handleStatusClick('pending')}>
                  <span className="status-number">2</span>
                  <span className="status-label">待参与</span>
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
