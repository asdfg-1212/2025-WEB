import React from 'react';
import ActivityCard from './ActivityCard';
import '../styles/activity-list.css';

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

interface ActivityListProps {
  activities: Activity[];
  title: string;
  onActivityClick?: (activity: Activity) => void;
}

const ActivityList: React.FC<ActivityListProps> = ({ activities, title, onActivityClick }) => {
  return (
    <div className="activity-list-container">
      <div className="activity-list-header">
        <h2 className="activity-list-title">{title}</h2>
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
