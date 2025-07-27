import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityDetailModal from '../components/ActivityDetailModal';
import type { ActivityDisplay } from '../types/activity';
import { useUser } from '../contexts/UserContext';
import { 
  getActivities, 
  registerForActivity, 
  unregisterFromActivity, 
  postActivityComment,
  getRegistrationStatus
} from '../services/activity';

const RegistrationOpen: React.FC = () => {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // 获取所有活动，然后筛选出报名截止时间还没到的活动
        const response = await getActivities();
        
        if (response && response.success && Array.isArray(response.data)) {
          // 筛选出报名中的活动（未被删除的、报名截止时间还没到的活动）
          const openActivities = response.data.filter((activity: any) => {
            const now = new Date();
            const registrationDeadline = new Date(activity.registration_deadline);
            
            // 未被删除的、报名截止时间还没到的活动
            return activity.status !== 'cancelled' && registrationDeadline > now;
          });
          
          setActivities(openActivities);
        } else {
          setActivities([]);
        }
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

  const handleActivityClick = async (activity: ActivityDisplay) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
    
    // 检查用户是否已报名该活动
    if (user) {
      try {
        const registrationStatus = await getRegistrationStatus(activity.id.toString());
        setIsUserRegistered(registrationStatus.isRegistered || false);
      } catch (error) {
        console.error('检查报名状态失败:', error);
        setIsUserRegistered(false);
      }
    } else {
      setIsUserRegistered(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
    setIsUserRegistered(false); // 重置报名状态
  };

  const handleRegister = async (activityId: number) => {
    try {
      await registerForActivity(activityId.toString());
      alert('报名成功！');
      setIsUserRegistered(true); // 更新报名状态
      // 重新获取活动列表以更新报名人数
      const response = await getActivities();
      if (response && response.success && Array.isArray(response.data)) {
        const openActivities = response.data.filter((activity: any) => {
          const now = new Date();
          const registrationDeadline = new Date(activity.registration_deadline);
          return activity.status !== 'cancelled' && registrationDeadline > now;
        });
        setActivities(openActivities);
      }
    } catch (err: any) {
      console.error('报名失败:', err);
      alert('报名失败: ' + (err.message || '未知错误'));
      throw err; // 重新抛出错误，让 ActivityDetailModal 能够捕获
    }
  };

  const handleUnregister = async (activityId: number) => {
    try {
      await unregisterFromActivity(activityId.toString());
      alert('取消报名成功！');
      setIsUserRegistered(false); // 更新报名状态
      // 重新获取活动列表以更新报名人数
      const response = await getActivities();
      if (response && response.success && Array.isArray(response.data)) {
        const openActivities = response.data.filter((activity: any) => {
          const now = new Date();
          const registrationDeadline = new Date(activity.registration_deadline);
          return activity.status !== 'cancelled' && registrationDeadline > now;
        });
        setActivities(openActivities);
      }
    } catch (err: any) {
      console.error('取消报名失败:', err);
      alert('取消报名失败: ' + (err.message || '未知错误'));
      throw err; // 重新抛出错误，让 ActivityDetailModal 能够捕获
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
        isUserRegistered={isUserRegistered}
      />
    </>
  );
};

export default RegistrationOpen;
