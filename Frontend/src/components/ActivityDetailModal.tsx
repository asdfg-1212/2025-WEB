import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import ParticipantsModal from './ParticipantsModal';
import EditActivityModal from './EditActivityModal';
import type { ActivityDisplay } from '../types/activity';
import { getActivityComments, createComment } from '../services/comment';
import { getUserAvatar } from '../utils/avatar';
import '../styles/activity-detail-modal.css';

interface Comment {
  id: number;
  content: string;
  user_id: number;
  activity_id: number;
  parent_id: number | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    username: string;
    avatar_emoji?: string;
  };
  replies?: Comment[];
}

interface ActivityDetailModalProps {
  activity: ActivityDisplay | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister?: (activityId: number) => void;
  onUnregister?: (activityId: number) => void;
  onPostComment?: (activityId: number, content: string) => void;
  onActivityUpdated?: () => void;
  onActivityDeleted?: () => void;
  isUserRegistered?: boolean; // 新增：用户是否已报名该活动
}

const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  isOpen,
  onClose,
  onRegister,
  onUnregister,
  onPostComment,
  onActivityUpdated,
  onActivityDeleted,
  isUserRegistered = false // 新增参数，默认为 false
}) => {
  const { user } = useUser();
  const [commentText, setCommentText] = useState('');
  const [isCommentExpanded, setIsCommentExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [postingComment, setPostingComment] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // 添加内部状态来跟踪用户报名状态，这样在模态框内操作时能立即更新按钮
  const [internalUserRegistered, setInternalUserRegistered] = useState(isUserRegistered);

  // 当外部传入的报名状态改变时，更新内部状态
  useEffect(() => {
    setInternalUserRegistered(isUserRegistered);
  }, [isUserRegistered]);

  if (!isOpen || !activity) return null;

  // 判断是否还能报名（基于报名截止时间）
  const now = new Date();
  const registrationDeadline = new Date(activity.registration_deadline);
  const isRegistrationOpen = registrationDeadline > now && activity.status !== 'cancelled';
  
  // 判断活动是否已结束（基于报名截止时间）
  const isActivityEnded = registrationDeadline < now;
  
  const isAdmin = user?.role === 'admin';

  // 加载评论数据
  const loadComments = async () => {
    if (!activity) return;
    
    try {
      setLoadingComments(true);
      const response = await getActivityComments(activity.id);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // 监听活动变化，重新加载评论
  useEffect(() => {
    if (activity && isOpen) {
      loadComments();
    }
  }, [activity, isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRegister = async () => {
    if (onRegister) {
      try {
        await onRegister(activity.id);
        // 如果报名成功且没有抛出错误，更新内部状态
        setInternalUserRegistered(true);
      } catch (error) {
        // 如果报名失败，不更新状态
        console.error('报名失败:', error);
      }
    }
  };

  const handleUnregister = async () => {
    if (onUnregister) {
      try {
        await onUnregister(activity.id);
        // 如果取消报名成功且没有抛出错误，更新内部状态
        setInternalUserRegistered(false);
      } catch (error) {
        // 如果取消报名失败，不更新状态
        console.error('取消报名失败:', error);
      }
    }
  };

  const handleEditActivity = () => {
    setIsEditModalOpen(true);
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !user || !activity) return;
    
    try {
      setPostingComment(true);
      const response = await createComment({
        content: commentText.trim(),
        user_id: user.id,
        activity_id: activity.id
      });
      
      if (response.success) {
        setCommentText('');
        setIsCommentExpanded(false);
        // 重新加载评论
        await loadComments();
        
        // 调用父组件的回调（如果有的话）
        if (onPostComment) {
          onPostComment(activity.id, commentText.trim());
        }
      }
    } catch (error) {
      console.error('发表评论失败:', error);
      alert('发表评论失败，请重试');
    } finally {
      setPostingComment(false);
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
                        <span className="info-value">
                          {new Date(activity.start_time).toLocaleString()} - {new Date(activity.end_time).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📍</span>
                      <div className="info-content">
                        <span className="info-label">活动地点</span>
                        <span className="info-value">
                          {activity.venue || '未指定场馆'}
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">👥</span>
                      <div className="info-content">
                        <span className="info-label">报名人数</span>
                        <span className="info-value">
                          {activity.registeredCount || 0}/{activity.max_participants} 人
                        </span>
                      </div>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">⏰</span>
                      <div className="info-content">
                        <span className="info-label">报名截止</span>
                        <span className="info-value">{new Date(activity.registration_deadline).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 报名进度条 */}
                <div className="registration-progress">
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${isActivityEnded ? 'progress-fill-ended' : ''}`}
                      style={{ 
                        width: isActivityEnded 
                          ? '100%' 
                          : `${Math.min(((activity.registeredCount || 0) / activity.max_participants) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <span className="progress-text">
                    {isActivityEnded 
                      ? '已结束' 
                      : (activity.registeredCount || 0) >= activity.max_participants 
                        ? '已满员' 
                        : '正在报名中'}
                  </span>
                </div>
              </div>

              {/* 评论区 */}
              <div className="comments-section">
                <h4>评论区</h4>
                <div className="comments-list">
                  {loadingComments ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      加载评论中...
                    </div>
                  ) : comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      暂无评论，来发表第一条评论吧！
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        <div className="comment-avatar">
                          {getUserAvatar({ 
                            id: comment.user.id, 
                            username: comment.user.username,
                            email: '',
                            role: 'user',
                            avatar_emoji: comment.user.avatar_emoji 
                          }) ? (
                            <img 
                              src={getUserAvatar({ 
                                id: comment.user.id, 
                                username: comment.user.username,
                                email: '',
                                role: 'user',
                                avatar_emoji: comment.user.avatar_emoji 
                              })} 
                              alt={`${comment.user.username}的头像`}
                              style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                            />
                          ) : (
                            comment.user.avatar_emoji || '👤'
                          )}
                        </div>
                        <div className="comment-content">
                          <div className="comment-header">
                            <span className="comment-username">{comment.user.username}</span>
                            <span className="comment-time">
                              {new Date(comment.created_at).toLocaleString('zh-CN')}
                            </span>
                          </div>
                          <p className="comment-text">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
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
                internalUserRegistered ? (
                  <button className="btn btn-danger btn-large" onClick={handleUnregister}>
                    取消报名
                  </button>
                ) : (activity.registeredCount || 0) >= activity.max_participants ? (
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
                    disabled={!commentText.trim() || postingComment}
                  >
                    {postingComment ? '发送中...' : '发送'}
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
      
      {/* 编辑活动模态框 */}
      <EditActivityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        activity={activity}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onActivityUpdated?.();
        }}
        onDelete={() => {
          setIsEditModalOpen(false);
          onClose(); // 关闭详情模态框
          onActivityDeleted?.();
        }}
      />
    </div>
  );
};

export default ActivityDetailModal;
