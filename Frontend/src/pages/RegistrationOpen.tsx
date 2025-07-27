import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityDetailModal from '../components/ActivityDetailModal';
import type { ActivityDisplay } from '../types/activity';
import { 
  getActivities, 
  registerForActivity, 
  unregisterFromActivity, 
  postActivityComment
} from '../services/activity';

const RegistrationOpen: React.FC = () => {
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // 只获取报名中的活动
        const response = await getActivities({ status: 'open' });
        setActivities(response.data);
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

  const handleActivityClick = (activity: ActivityDisplay) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleRegister = async (activityId: number) => {
    try {
      await registerForActivity(activityId.toString());
      alert('报名成功！');
      // 重新获取活动列表以更新报名人数
      const response = await getActivities({ status: 'open' });
      setActivities(response.data);
    } catch (err: any) {
      console.error('报名失败:', err);
      alert('报名失败: ' + (err.message || '未知错误'));
    }
  };

  const handleUnregister = async (activityId: number) => {
    try {
      await unregisterFromActivity(activityId.toString());
      alert('取消报名成功！');
      // 重新获取活动列表以更新报名人数
      const response = await getActivities({ status: 'open' });
      setActivities(response.data);
    } catch (err: any) {
      console.error('取消报名失败:', err);
      alert('取消报名失败: ' + (err.message || '未知错误'));
    }
  };

  const handlePostComment = async (activityId: number, content: string) => {
    try {
      await postActivityComment(activityId.toString(), content);
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
        onActivityClick={(listActivity) => {
          // 根据ID找到原始activity对象
          const originalActivity = activities.find(a => a.id.toString() === listActivity.id.toString());
          if (originalActivity) {
            handleActivityClick(originalActivity);
          }
        }}
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
