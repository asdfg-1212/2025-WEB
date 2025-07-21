import React from 'react';
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
  // 模拟数据 - 用户已参与的活动
  const activities: Activity[] = [
    {
      id: '14',
      type: '篮球',
      venue: '体育馆A',
      startTime: '2025年7月10日 14:00',
      endTime: '2025年7月10日 16:00',
      registrationDeadline: '2025年7月09日 12:00',
      registeredCount: 16,
      maxCount: 20,
    },
    {
      id: '15',
      type: '乒乓球',
      venue: '乒乓球室',
      startTime: '2025年7月08日 19:00',
      endTime: '2025年7月08日 21:00',
      registrationDeadline: '2025年7月08日 12:00',
      registeredCount: 8,
      maxCount: 8,
    },
    {
      id: '16',
      type: '跑步',
      venue: '操场',
      startTime: '2025年7月05日 06:00',
      endTime: '2025年7月05日 07:30',
      registrationDeadline: '2025年7月04日 20:00',
      registeredCount: 28,
      maxCount: 30,
    },
  ];

  const handleActivityClick = (activity: Activity) => {
    console.log('点击了已参与活动:', activity);
    // 这里后续实现跳转到活动详情页面
  };

  return (
    <ActivityList
      activities={activities}
      title="我已参与的活动"
      onActivityClick={handleActivityClick}
    />
  );
};

export default ParticipatedActivities;
