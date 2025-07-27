import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityCounts } from '../services/activity';
import { useUser } from '../contexts/UserContext';
import CreateActivityModal from '../components/CreateActivityModal';
import CreateVenueModal from '../components/CreateVenueModal';
import ProfileModal from '../components/ProfileModal';
import { getUserAvatar } from '../utils/avatar';
import '../styles/dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [activityCounts, setActivityCounts] = useState({
    open: 0,
    ended: 0,
    participated: 0,
    pending: 0
  });
  const [isCreateActivityModalOpen, setIsCreateActivityModalOpen] = useState(false);
  const [isCreateVenueModalOpen, setIsCreateVenueModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 获取活动统计数据
    const loadActivityCounts = async () => {
      try {
        const counts = await getActivityCounts(user?.id);
        setActivityCounts({
          open: counts.open,
          ended: counts.ended,
          pending: counts.pending,
          participated: counts.participated
        });
      } catch (error) {
        console.error('获取活动统计失败:', error);
        // 如果获取失败，保持默认值0
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadActivityCounts();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusClick = (type: string) => {
    // 管理员的特殊处理
    if (user?.role === 'admin') {
      switch (type) {
        case 'create-activity':
          setIsCreateActivityModalOpen(true);
          return;
        case 'create-venue':
          setIsCreateVenueModalOpen(true);
          return;
        case 'registration-open':
          navigate('/activities/registration-open');
          break;
        case 'ended':
          navigate('/activities/ended');
          break;
        default:
          break;
      }
    } else {
      // 普通用户的处理
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
          <h1 className="welcome-title">Welcome, {user?.username || '用户'}!</h1>
          <h2 className="welcome-subtitle">体育活动室</h2>
        </div>
        
        <div className="user-section">
          <div className="message-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#666"/>
              {/*未读私信<circle cx="18" cy="6" r="3" fill="#ff4757"/>*/}
            </svg>
          </div>
          <div className="user-avatar" onClick={() => setIsProfileModalOpen(true)} style={{ cursor: 'pointer' }}>
            <img 
              src={getUserAvatar(user)}
              alt={`${user?.username || '用户'}的头像`} 
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
            <div className="section-header-right">
              <h3>活动大全</h3>
              <p>Find Activities</p>
            </div>
            
            <div className="activity-status">
              <div className="status-item" onClick={() => handleStatusClick('registration-open')}>
                <span className="status-number">{activityCounts.open}</span>
                <span className="status-label">报名中</span>
              </div>
              <div className="status-item" onClick={() => handleStatusClick('ended')}>
                <span className="status-number">{activityCounts.ended}</span>
                <span className="status-label">已结束</span>
              </div>
            </div>
          </div>

          {/* 右侧 - 根据用户角色显示不同内容 */}
          <div className="content-section my-activity-section">
            <div className="section-header-right">
              <h3>{user?.role === 'admin' ? '创建发布' : '我的活动'}</h3>
              <p>{user?.role === 'admin' ? 'Create & Publish' : 'My Activities'}</p>
            </div>

            <div className="activity-status">
              {user?.role === 'admin' ? (
                <>
                  <div className="status-item" onClick={() => handleStatusClick('create-activity')}>
                    <span className="status-number admin-emoji">📝</span>
                    <span className="status-label">活动发布</span>
                  </div>
                  <div className="status-item" onClick={() => handleStatusClick('create-venue')}>
                    <span className="status-number admin-emoji">🏢</span>
                    <span className="status-label">场馆创建</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="status-item" onClick={() => handleStatusClick('participated')}>
                    <span className="status-number">{activityCounts.participated}</span>
                    <span className="status-label">已参与</span>
                  </div>
                  <div className="status-item" onClick={() => handleStatusClick('pending')}>
                    <span className="status-number">{activityCounts.pending}</span>
                    <span className="status-label">待参与</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 模态框 */}
      <CreateActivityModal 
        isOpen={isCreateActivityModalOpen} 
        onClose={() => setIsCreateActivityModalOpen(false)} 
      />
      <CreateVenueModal 
        isOpen={isCreateVenueModalOpen} 
        onClose={() => setIsCreateVenueModalOpen(false)} 
      />
      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
