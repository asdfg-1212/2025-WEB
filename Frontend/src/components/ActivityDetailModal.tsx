import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import ParticipantsModal from './ParticipantsModal';
import '../styles/activity-detail-modal.css';

interface Activity {
  id: string;
  type: string;
  venue: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  registeredCount: number;
  maxCount: number;
  description?: string; // 活动详情描述
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  avatar?: string;
}

interface ActivityDetailModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (activityId: string) => void;
  onUnregister?: (activityId: string) => void;
  onEditActivity?: (activityId: string) => void;
  onPostComment?: (activityId: string, content: string) => void;
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
  onEditActivity,
  onPostComment
}) => {
  const { user } = useUser();
  const [commentText, setCommentText] = useState('');
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);

  if (!isOpen || !activity) return null;

  // TODO: 从用户上下文获取这些信息
  const isRegistrationOpen = true; // 根据时间判断是否还能报名
  const isUserRegistered = false; // 根据用户状态判断是否已报名
  const isAdmin = user?.role === 'admin';
  // const currentUser = { id: '1', username: '当前用户' }; // 当前用户信息 - 暂时注释

  // 模拟评论数据
  const comments: Comment[] = [
    {
      id: '1',
      userId: '2',
      username: '运动爱好者',
      content: '这个活动看起来很不错，期待参加！',
      createdAt: '2025年07月23日 14:30',
      avatar: '🏃‍♂️'
    },
    {
      id: '2',
      userId: '3',
      username: '健身达人',
      content: '场地怎么样？有更衣室吗？',
      createdAt: '2025年07月23日 15:15',
      avatar: '💪'
    }
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister(activity.id);
    }
  };

  const handleUnregister = () => {
    if (onUnregister) {
      onUnregister(activity.id);
    }
  };

  const handleEditActivity = () => {
    if (onEditActivity) {
      onEditActivity(activity.id);
    }
  };

  const handlePostComment = () => {
    if (commentText.trim() && onPostComment) {
      onPostComment(activity.id, commentText.trim());
      setCommentText('');
      setIsCommentExpanded(false);
    }
  };

  const handleViewParticipants = () => {
    setIsParticipantsModalOpen(true);
  };

  const handleCloseParticipantsModal = () => {
    setIsParticipantsModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>活动详情</h2>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="modal-body">
          <div className="activity-details">
            {/* 活动基本信息 */}
            <div className="detail-section">
              <h3 className="activity-title">{activity.type}</h3>
              
              {/* 活动描述 */}
              <div className="activity-description">
                <h4>活动描述</h4>
                <p>
                  {activity.description || `欢迎参加${activity.type}活动！本次活动将为大家提供专业的运动体验，请准时到场参与。活动期间请注意安全，遵守场馆规定。`}
                </p>
              </div>

                {/* 活动信息 */}
                <div className="activity-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <div className="info-content">
                        <span className="info-label">活动时间</span>
                        <span className="info-value">{activity.startTime} - {activity.endTime}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <div className="info-content">
                        <span className="info-label">活动地点</span>
                        <span className="info-value">{activity.venue}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">👥</span>
                      <div className="info-content">
                        <span className="info-label">报名人数</span>
                        <span className="info-value">
                          {activity.registeredCount}/{activity.maxCount} 人
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">⏰</span>
                      <div className="info-content">
                        <span className="info-label">报名截止</span>
                        <span className="info-value">{activity.registrationDeadline}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 报名进度条 */}
                <div className="registration-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min((activity.registeredCount / activity.maxCount) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {activity.registeredCount >= activity.maxCount ? '已满员' : '正在报名中'}
                  </span>
                </div>
              </div>

              {/* 评论区 */}
              <div className="comments-section">
                <h4>评论区</h4>
                <div className="comments-list">
                  {comments.map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="comment-avatar">{comment.avatar}</div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-username">{comment.username}</span>
                          <span className="comment-time">{comment.createdAt}</span>
                        </div>
                        <p className="comment-text">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        {/* Action Buttons */}
        <div className="modal-footer">
          <div className="footer-actions">
            {/* 左侧操作区 */}
            <div className="left-actions">
              {isRegistrationOpen && !isAdmin ? (
                isUserRegistered ? (
                  <button className="btn btn-danger btn-large" onClick={handleUnregister}>
                    取消报名
                  </button>
                ) : activity.registeredCount >= activity.maxCount ? (
                  <button className="btn btn-disabled btn-large" disabled>
                    已满员
                  </button>
                ) : (
                  <button className="btn btn-primary btn-large" onClick={handleRegister}>
                    立即报名
                  </button>
                )
              ) : !isAdmin && (
                <button className="btn btn-disabled btn-large" disabled>
                  报名已截止
                </button>
              )}

              {/* 管理员操作 */}
              {isAdmin && (
                <>
                  <button className="btn btn-secondary btn-large" onClick={handleEditActivity}>
                    编辑活动
                  </button>
                  <button className="btn btn-info btn-large" onClick={handleViewParticipants}>
                    查看名单
                  </button>
                </>
              )}
            </div>

            {/* 右侧评论输入区 */}
            <div className="right-actions">
              {!isCommentExpanded ? (
                <button 
                  className="btn btn-comment btn-large" 
                  onClick={() => setIsCommentExpanded(true)}
                >
                  写评论...
                </button>
              ) : (
                <div className="comment-input-group">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写下你的想法..."
                    className="comment-input"
                    autoFocus
                  />
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handlePostComment}
                    disabled={!commentText.trim()}
                  >
                    发送
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => {
                      setIsCommentExpanded(false);
                      setCommentText('');
                    }}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* 参与者名单模态框 */}
      <ParticipantsModal
        activity={activity}
        isOpen={isParticipantsModalOpen}
        onClose={handleCloseParticipantsModal}
      />
    </div>
  );
};

export default ActivityDetailModal;
