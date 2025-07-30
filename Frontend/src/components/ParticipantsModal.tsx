import React, { useState, useEffect } from 'react';
import type { ActivityDisplay } from '../types/activity';
import { getActivityParticipants } from '../services/activity';
import '../styles/participants-modal.css';

interface Participant {
  id: number;
  user_id: number;
  username: string;
  email: string;
  registered_at: string;
  avatar_emoji?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface ParticipantsModalProps {
  activity: ActivityDisplay | null;
  isOpen: boolean;
  onClose: () => void;
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  activity,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取参与者列表
  useEffect(() => {
    if (isOpen && activity) {
      fetchParticipants();
    }
  }, [isOpen, activity]);

  const fetchParticipants = async () => {
    if (!activity) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getActivityParticipants(activity.id);
      if (data && data.registrations) {
        // 转换数据格式
        const participantList = data.registrations.map((reg: any) => ({
          id: reg.id,
          user_id: reg.user_id,
          username: reg.user.username,
          email: reg.user.email,
          registered_at: reg.registered_at,
          avatar_emoji: reg.user.avatar_emoji,
          status: reg.status
        }));
        setParticipants(participantList);
      } else {
        setParticipants([]);
      }
    } catch (err: any) {
      console.error('获取参与者列表失败:', err);
      setError(err.message || '获取参与者列表失败');
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !activity) return null;

  // 过滤参与者 (只显示已确认的)
  const filteredParticipants = participants.filter(participant => 
    participant.status === 'confirmed' &&
    (participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
     participant.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 格式化注册时间
  const formatRegistrationTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="participants-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="participants-modal-content">
        {/* Modal Header */}
        <div className="participants-modal-header">
          <div className="header-info">
            <h2>报名名单</h2>
            <p className="activity-info">
              {activity.type} · {activity.venue}
            </p>
          </div>
          <button className="close-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="participants-filters">
          <input
            type="text"
            placeholder="🔍搜索参与者姓名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <div className="count-info">
            显示 {filteredParticipants.length} / {participants.length} 人
          </div>
        </div>

        {/* Participants List */}
        <div className="participants-modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="loading-icon">⏳</div>
              <p>加载中...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">❌</div>
              <p>获取参与者列表失败: {error}</p>
              <button onClick={fetchParticipants} className="retry-btn">重试</button>
            </div>
          ) : filteredParticipants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>没有找到符合条件的参与者</p>
            </div>
          ) : (
            <div className="participants-list">
              {filteredParticipants.map((participant) => (
                <div key={participant.id} className="participant-card">
                  <div className="participant-avatar">
                    {participant.avatar_emoji || '👤'}
                  </div>
                  <div className="participant-details">
                    <div className="participant-main">
                      <span className="participant-name">{participant.username}</span>
                    </div>
                    <div className="participant-contact">
                      <span className="participant-email">{participant.email}</span>
                    </div>
                    <div className="participant-time">
                      报名时间: {formatRegistrationTime(participant.registered_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="participants-modal-footer">
          <div className="footer-stats">
            <span className="stat-item">
              <strong>总参与人数:</strong> {participants.filter(p => p.status === 'confirmed').length}人
            </span>
          </div>
          <div className="footer-actions">
            <button className="btn btn-secondary" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantsModal;
