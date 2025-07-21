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

const PendingActivities: React.FC = () => {
  // 模拟数据 - 用户待参与的活动
  const activities: Activity[] = [
    {
      id: '17',
      type: '羽毛球',
      venue: '羽毛球馆A',
      startTime: '2025年7月25日 10:00',
      endTime: '2025年7月25日 12:00',
      registrationDeadline: '2025年7月24日 18:00',
      registeredCount: 10,
      maxCount: 12,
    },
    {
      id: '18',
      type: '游泳',
      venue: '游泳馆',
      startTime: '2025年7月30日 15:00',
      endTime: '2025年7月30日 17:00',
      registrationDeadline: '2025年7月29日 12:00',
      registeredCount: 12,
      maxCount: 20,
    },
  ];

  const handleActivityClick = (activity: Activity) => {
    console.log('点击了待参与活动:', activity);
    // 这里后续实现跳转到活动详情页面
  };

  return (
    <ActivityList
      activities={activities}
      title="待参与的活动"
      onActivityClick={handleActivityClick}
    />
  );
};

export default PendingActivities;
