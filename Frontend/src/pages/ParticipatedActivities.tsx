import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';

interface Activity {
  id: string;
  type: string;
  venue: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  registeredCount: number;
  maxCount: number;
}

const ParticipatedActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // TODO: 这里需要实现获取用户已参与的活动
        // 目前先返回空数组，等用户认证系统完善后再实现
        setActivities([]);
        setError(null);
      } catch (err: any) {
        console.error('获取已参与活动列表失败:', err);
        setError(err.message || '获取活动列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityClick = (activity: Activity) => {
    console.log('点击了已参与活动:', activity);
    // 这里后续实现跳转到活动详情页面
  };

  if (loading) {
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

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontSize: '18px',
        color: '#ff4757'
      }}>
        <p>错误: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重新加载
        </button>
      </div>
    );
  }

  // 如果没有已参与的活动，显示提示信息
  if (activities.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontSize: '18px',
        color: '#666'
      }}>
        <p>暂无已参与的活动</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          参与活动后，会在这里显示历史记录
        </p>
      </div>
    );
  }

  return (
    <>
      <ActivityList
        activities={activities}
        title="已参与的活动"
        onActivityClick={handleActivityClick}
      />
    </>
  );
};

export default ParticipatedActivities;
