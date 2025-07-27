import React from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from './ActivityCard';
import type { ActivityDisplay } from '../types/activity';
import '../styles/activity-list.css';

interface ActivityListProps {
  activities: ActivityDisplay[];
  title: string;
  onActivityClick?: (activity: ActivityDisplay) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, title, onActivityClick }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="activity-list-container">
      <div className="activity-list-header">
        <div className="header-content">
          <button className="back-button" onClick={handleBackClick}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回主页
          </button>
          <h2 className="activity-list-title">{title}</h2>
        </div>
      </div>
      
      <div className="activity-list-scroll">
        <div className="activity-list-grid">
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onClick={onActivityClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityList;
