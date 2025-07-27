import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityDetailModal from '../components/ActivityDetailModal';
import type { ActivityDisplay } from '../types/activity';
import { useUser } from '../contexts/UserContext';
import { 
  getMyRegistrations, 
  refreshActivityStatus,
  unregisterFromActivity,
  postActivityComment
} from '../services/activity';

// 创建本地的数据转换函数
const transformToActivityDisplay = (backendActivity: any): ActivityDisplay => {
  const typeMapping: { [key: string]: string } = {
    'basketball': '篮球',
    'football': '足球',
    'badminton': '羽毛球',
    'tennis': '网球',
    'pingpong': '乒乓球',
    'volleyball': '排球',
    'billiards': '台球',
    'golf': '高尔夫',
    'running': '跑步',
    'swimming': '游泳',
    'martial arts': '武术',
    'dance': '舞蹈',
    'fencing': '击剑',
    'taekwondo': '跆拳道',
    'shooting': '射击',
    'skating': '滑冰',
    'other': '其他'
  };

  // 日期格式化函数
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}年${month}月${day}日 ${hour}:${minute}`;
  };

  return {
    id: backendActivity.id,
    title: backendActivity.title,
    type: typeMapping[backendActivity.type] || backendActivity.type,
    venue: backendActivity.venue ? `${backendActivity.venue.name}${backendActivity.venue.location ? ` - ${backendActivity.venue.location}` : ''}` : '未知场馆',
    startTime: formatDateTime(backendActivity.start_time),
    endTime: formatDateTime(backendActivity.end_time),
    registrationDeadline: formatDateTime(backendActivity.registration_deadline),
    registeredCount: backendActivity.current_participants || 0,
    maxCount: backendActivity.max_participants || 0,
    description: backendActivity.description,
    notes: backendActivity.notes,
    allow_comments: backendActivity.allow_comments,
    venue_id: backendActivity.venue_id,
    start_time: backendActivity.start_time,
    end_time: backendActivity.end_time,
    registration_deadline: backendActivity.registration_deadline,
    max_participants: backendActivity.max_participants
  };
};

const PendingActivities: React.FC = () => {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPendingActivities();
    } else {
      setActivities([]);
      setLoading(false);
    }
  }, [user]);

  const fetchPendingActivities = async () => {
    try {
      setLoading(true);
      
      // 先刷新活动状态
      await refreshActivityStatus();
      
      // 获取用户报名的活动
      const registrations = await getMyRegistrations(user!.id);
      
      // 筛选出待参与的活动（已报名且未开始的活动）
      const pendingActivities = registrations
        .filter((reg: any) => {
          const activity = reg.activity;
          const now = new Date();
          const startTime = new Date(activity.start_time);
          
          // 活动状态为open、closed或ongoing，且开始时间在当前时间之后
          return (
            (activity.status === 'open' || activity.status === 'closed') && 
            startTime > now
          );
        })
        .map((reg: any) => transformToActivityDisplay(reg.activity));
      
      setActivities(pendingActivities);
      setError(null);
    } catch (err: any) {
      console.error('获取待参与活动列表失败:', err);
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

  const handleUnregister = async (activityId: number) => {
    try {
      await unregisterFromActivity(activityId.toString());
      alert('取消报名成功！');
      // 重新获取活动列表
      fetchPendingActivities();
    } catch (err: any) {
      console.error('取消报名失败:', err);
      alert('取消报名失败: ' + (err.message || '未知错误'));
    }
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

  // 如果没有待参与的活动，显示提示信息
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
        <p>暂无待参与的活动</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          报名活动后，会在这里显示即将参与的活动
        </p>
      </div>
    );
  }

  return (
    <>
      <ActivityList
        activities={activities}
        title="待参与的活动"
        onActivityClick={handleActivityClick}
      />
      
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRegister={() => {}} // 已经报名了，不需要再报名
        onUnregister={handleUnregister}
        onPostComment={handlePostComment}
      />
    </>
  );
};

export default PendingActivities;
