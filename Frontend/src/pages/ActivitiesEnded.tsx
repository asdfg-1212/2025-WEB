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

const ActivitiesEnded: React.FC = () => {
  // 模拟数据 - 已结束的活动
  const activities: Activity[] = [
    {
      id: '6',
      type: '游泳',
      venue: '游泳馆',
      startTime: '2025年7月20日 14:00',
      endTime: '2025年7月20日 16:00',
      registrationDeadline: '2025年7月19日 12:00',
      registeredCount: 18,
      maxCount: 20,
    },
    {
      id: '7',
      type: '瑜伽',
      venue: '瑜伽室A',
      startTime: '2025年7月19日 18:00',
      endTime: '2025年7月19日 19:30',
      registrationDeadline: '2025年7月19日 10:00',
      registeredCount: 12,
      maxCount: 15,
    },
    {
      id: '8',
      type: '跑步',
      venue: '操场',
      startTime: '2025年7月18日 06:00',
      endTime: '2025年7月18日 07:30',
      registrationDeadline: '2025年7月17日 20:00',
      registeredCount: 25,
      maxCount: 30,
    },
    {
      id: '9',
      type: '健身',
      venue: '健身房',
      startTime: '2025年7月17日 20:00',
      endTime: '2025年7月17日 21:30',
      registrationDeadline: '2025年7月17日 12:00',
      registeredCount: 10,
      maxCount: 12,
    },
    {
      id: '10',
      type: '太极拳',
      venue: '太极拳室',
      startTime: '2025年7月16日 07:00',
      endTime: '2025年7月16日 08:30',
      registrationDeadline: '2025年7月15日 18:00',
      registeredCount: 8,
      maxCount: 10,
    },
    {
      id: '11',
      type: '排球',
      venue: '排球场',
      startTime: '2025年7月15日 16:00',
      endTime: '2025年7月15日 18:00',
      registrationDeadline: '2025年7月14日 20:00',
      registeredCount: 14,
      maxCount: 16,
    },
    {
      id: '12',
      type: '舞蹈',
      venue: '舞蹈室B',
      startTime: '2025年7月14日 19:00',
      endTime: '2025年7月14日 20:30',
      registrationDeadline: '2025年7月14日 10:00',
      registeredCount: 20,
      maxCount: 20,
    },
    {
      id: '13',
      type: '武术',
      venue: '武术馆',
      startTime: '2025年7月13日 15:00',
      endTime: '2025年7月13日 17:00',
      registrationDeadline: '2025年7月12日 22:00',
      registeredCount: 6,
      maxCount: 8,
    },
  ];

  const handleActivityClick = (activity: Activity) => {
    console.log('点击了已结束活动:', activity);
    // 这里后续实现跳转到活动详情页面
  };

  return (
    <ActivityList
      activities={activities}
      title="已结束的活动"
      onActivityClick={handleActivityClick}
    />
  );
};

export default ActivitiesEnded;
