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

const RegistrationOpen: React.FC = () => {
  // 模拟数据 - 实际应该从后端API获取
  const activities: Activity[] = [
    {
      id: '1',
      type: '篮球',
      venue: '体育馆A',
      startTime: '2025年7月25日 14:00',
      endTime: '2025年7月25日 16:00',
      registrationDeadline: '2025年7月24日 12:00',
      registeredCount: 8,
      maxCount: 20,
    },
    {
      id: '2',
      type: '足球',
      venue: '足球场1号',
      startTime: '2025年7月26日 10:00',
      endTime: '2025年7月26日 12:00',
      registrationDeadline: '2025年7月25日 18:00',
      registeredCount: 15,
      maxCount: 22,
    },
    {
      id: '3',
      type: '乒乓球',
      venue: '乒乓球室',
      startTime: '2025年7月27日 19:00',
      endTime: '2025年7月27日 21:00',
      registrationDeadline: '2025年7月27日 12:00',
      registeredCount: 4,
      maxCount: 8,
    },
    {
      id: '4',
      type: '羽毛球',
      venue: '羽毛球馆B',
      startTime: '2025年7月28日 15:00',
      endTime: '2025年7月28日 17:00',
      registrationDeadline: '2025年7月27日 20:00',
      registeredCount: 6,
      maxCount: 12,
    },
    {
      id: '5',
      type: '网球',
      venue: '网球场2号',
      startTime: '2025年7月29日 09:00',
      endTime: '2025年7月29日 11:00',
      registrationDeadline: '2025年7月28日 22:00',
      registeredCount: 2,
      maxCount: 4,
    },
  ];

  const handleActivityClick = (activity: Activity) => {
    console.log('点击了活动:', activity);
    // 这里后续实现跳转到活动详情页面
  };

  return (
    <ActivityList
      activities={activities}
      title="报名中的活动"
      onActivityClick={handleActivityClick}
    />
  );
};

export default RegistrationOpen;
