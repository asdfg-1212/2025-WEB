import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityDetailModal from '../components/ActivityDetailModal';
import type { ActivityDisplay } from '../types/activity';
import { getActivities, postActivityComment } from '../services/activity';

const ActivitiesEnded: React.FC = () => {
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      console.log('开始获取活动数据...');
      const response = await getActivities();
      console.log('API响应:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        console.log('活动数据:', response.data);
        // 筛选出已结束的活动
        const endedActivities = response.data.filter((activity: any) => 
          activity.status === 'ended' || new Date(activity.end_time) < new Date()
        );
        console.log('已结束的活动:', endedActivities);
        setActivities(endedActivities);
        setError(null);
      } else {
        console.error('获取活动数据失败:', response);
        setError('获取活动数据失败');
      }
    } catch (err: any) {
      console.error('获取已结束活动列表失败:', err);
      setError(err.message || '获取活动列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = (activity: ActivityDisplay) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handlePostComment = async (activityId: number, content: string) => {
    try {
      await postActivityComment(activityId.toString(), content);
      alert('评论发表成功！');
      return true;
    } catch (err: any) {
      console.error('发表评论失败:', err);
      alert('发表评论失败: ' + (err.message || '未知错误'));
      return false;
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
        <p>暂无已结束的活动</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          活动结束后会在这里显示
        </p>
      </div>
    );
  }

  return (
    <>
      <ActivityList
        activities={activities}
        title="已结束的活动"
        onActivityClick={handleActivityClick}
      />
      
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRegister={() => {}} // 已结束的活动不能报名
        onUnregister={() => {}} // 已结束的活动不能取消报名
        onPostComment={handlePostComment}
      />
    </>
  );
};

export default ActivitiesEnded;
