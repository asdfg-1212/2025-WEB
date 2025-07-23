import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityDetailModal from '../components/ActivityDetailModal';
import { getActivities } from '../services/activity';

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

const RegistrationOpen: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // 只获取报名中的活动
        const data = await getActivities({ status: 'open' });
        setActivities(data);
        setError(null);
      } catch (err: any) {
        console.error('获取活动列表失败:', err);
        setError(err.message || '获取活动列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleRegister = async (activityId: string) => {
    try {
      // TODO: 实现报名逻辑
      console.log('报名活动:', activityId);
      alert('报名成功！');
      // 重新获取活动列表以更新报名人数
      const data = await getActivities({ status: 'open' });
      setActivities(data);
    } catch (err: any) {
      console.error('报名失败:', err);
      alert('报名失败: ' + (err.message || '未知错误'));
    }
  };

  const handleUnregister = async (activityId: string) => {
    try {
      // TODO: 实现取消报名逻辑
      console.log('取消报名:', activityId);
      alert('取消报名成功！');
      // 重新获取活动列表以更新报名人数
      const data = await getActivities({ status: 'open' });
      setActivities(data);
    } catch (err: any) {
      console.error('取消报名失败:', err);
      alert('取消报名失败: ' + (err.message || '未知错误'));
    }
  };

  const handlePostComment = async (activityId: string, content: string) => {
    try {
      // TODO: 实现发表评论逻辑
      console.log('发表评论:', activityId, content);
      alert('评论发表成功！');
    } catch (err: any) {
      console.error('发表评论失败:', err);
      alert('发表评论失败: ' + (err.message || '未知错误'));
    }
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

  return (
    <>
      <ActivityList
        activities={activities}
        title="报名中的活动"
        onActivityClick={handleActivityClick}
      />
      
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        onPostComment={handlePostComment}
      />
    </>
  );
};

export default RegistrationOpen;
