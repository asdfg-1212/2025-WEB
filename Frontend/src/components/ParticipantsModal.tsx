import React, { useState } from 'react';
import '../styles/participants-modal.css';

interface Participant {
  id: string;
  userId: string;
  username: string;
  email?: string;
  phone?: string;
  registrationTime: string;
  avatar?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

interface Activity {
  id: string;
  type: string;
  venue: string;
  startTime: string;
  endTime: string;
  registeredCount: number;
  maxCount: number;
}

interface ParticipantsModalProps {
  activity: Activity | null;
  isOpen: boolean;
  onClose: () => void;
  onRemoveParticipant?: (participantId: string) => void;
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  activity,
  isOpen,
  onClose,
  onRemoveParticipant
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending' | 'cancelled'>('all');

  if (!isOpen || !activity) return null;

  // 模拟参与者数据
  const mockParticipants: Participant[] = Array.from({ length: activity.registeredCount }, (_, index) => ({
    id: `participant-${index + 1}`,
    userId: `user-${index + 1}`,
    username: `参与者${index + 1}`,
    email: `user${index + 1}@example.com`,
    phone: `138****${String(1000 + index).slice(-4)}`,
    registrationTime: `2025年07月${20 + (index % 3)}日 ${10 + index}:${30 + (index * 7) % 60}`,
    avatar: ['🏃‍♂️', '💪', '🏊‍♀️', '🚴‍♂️', '🧘‍♀️', '⚽', '🏀', '🎾'][index % 8],
    status: ['confirmed', 'pending'][index % 2] as 'confirmed' | 'pending'
  }));

  // 过滤参与者
  const filteredParticipants = mockParticipants.filter(participant => {
    const matchesSearch = participant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         participant.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || participant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleRemoveParticipant = (participantId: string, username: string) => {
    if (window.confirm(`确认移除参与者 "${username}" 吗？`)) {
      if (onRemoveParticipant) {
        onRemoveParticipant(participantId);
      }
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return '已确认';
      case 'pending': return '待确认';
      case 'cancelled': return '已取消';
      default: return '未知';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-unknown';
    }
  };

  return (
    <div className="participants-modal-overlay" onClick={handleOverlayClick}>
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

        {/* Filters */}
        <div className="participants-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="搜索参与者姓名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="status-filter"
            >
              <option value="all">全部状态</option>
              <option value="confirmed">已确认</option>
              <option value="pending">待确认</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div className="count-info">
            显示 {filteredParticipants.length} / {mockParticipants.length} 人
          </div>
        </div>

        {/* Participants List */}
        <div className="participants-modal-body">
          {filteredParticipants.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <p>没有找到符合条件的参与者</p>
            </div>
          ) : (
            <div className="participants-list">
              {filteredParticipants.map((participant) => (
                <div key={participant.id} className="participant-card">
                  <div className="participant-avatar">
                    {participant.avatar}
                  </div>
                  <div className="participant-details">
                    <div className="participant-main">
                      <span className="participant-name">{participant.username}</span>
                      <span className={`participant-status ${getStatusClass(participant.status!)}`}>
                        {getStatusText(participant.status!)}
                      </span>
                    </div>
                    <div className="participant-contact">
                      <span className="participant-email">{participant.email}</span>
                      <span className="participant-phone">{participant.phone}</span>
                    </div>
                    <div className="participant-time">
                      报名时间: {participant.registrationTime}
                    </div>
                  </div>
                  <div className="participant-actions">
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveParticipant(participant.id, participant.username)}
                      title="移除参与者"
                    >
                      移除
                    </button>
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
              <strong>总报名:</strong> {activity.registeredCount}人
            </span>
            <span className="stat-item">
              <strong>已确认:</strong> {mockParticipants.filter(p => p.status === 'confirmed').length}人
            </span>
            <span className="stat-item">
              <strong>待确认:</strong> {mockParticipants.filter(p => p.status === 'pending').length}人
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
