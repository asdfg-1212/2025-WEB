import React from 'react';
import type { ActivityDisplay } from '../types/activity';
import '../styles/activity-card.css';

interface ActivityCardProps {
  activity: ActivityDisplay;
  onClick?: (activity: ActivityDisplay) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(activity);
    }
  };

  return (
    <div className="activity-card" onClick={handleClick}>
      {/* 顶部状态标签和人数信息 */}
      <div className="activity-header">
        <div className="activity-status-badge">
          {activity.registeredCount}/{activity.maxCount}
        </div>
      </div>

      {/* 渐变背景区域 */}
      <div className="activity-gradient-section">
        <div className="activity-title">
          {activity.title}
        </div>
        <div className="activity-type">
          {activity.type}
        </div>
      </div>

      {/* 活动信息区域 */}
      <div className="activity-info">
        <div className="activity-info-item">
          <span className="activity-info-label">场馆：{activity.venue}</span>
        </div>
        <div className="activity-info-item">
          <span className="activity-info-label">活动起止时间：{activity.startTime} ~ {activity.endTime}</span>
        </div>
        <div className="activity-info-item">
          <span className="activity-info-label">报名截止时间：{activity.registrationDeadline}</span>
        </div>
      </div>

      {/* 底部按钮 */}
      <div className="activity-action">
        <button className="activity-action-btn">
          查看详情
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;
