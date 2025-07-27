import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getUserAvatar, getRandomAvatar, updateUserAvatar } from '../utils/avatar';
import '../styles/profile-modal.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useUser();
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleAvatarChange = async () => {
    try {
      setIsChangingAvatar(true);
      const randomAvatar = getRandomAvatar();
      setNewAvatar(randomAvatar);
      
      // 调用后端API更新头像
      await updateUserAvatar(user.id, randomAvatar);
      
      // 更新本地用户信息
      updateUser({ ...user, avatar_emoji: randomAvatar });
      
      // 短暂显示新头像后重置
      setTimeout(() => {
        setNewAvatar(null);
        setIsChangingAvatar(false);
      }, 1000);
    } catch (error) {
      console.error('更新头像失败:', error);
      setIsChangingAvatar(false);
      setNewAvatar(null);
    }
  };

  const handleClose = () => {
    onClose();
    // 清理状态
    setTimeout(() => {
      setNewAvatar(null);
      setIsChangingAvatar(false);
    }, 300);
  };

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button className="profile-modal-close" onClick={handleClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* 用户头像 */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-container">
            <img 
              src={newAvatar || getUserAvatar(user)}
              alt={`${user.username}的头像`}
              className={`profile-avatar ${isChangingAvatar ? 'changing' : ''}`}
            />
            {isChangingAvatar && (
              <div className="avatar-loading">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
          {user.role !== 'admin' && (
            <button 
              className="change-avatar-btn"
              onClick={handleAvatarChange}
              disabled={isChangingAvatar}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 7V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M15 14L12 17L9 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {isChangingAvatar ? '更换中...' : '随机更换头像'}
            </button>
          )}
          {user.role === 'admin' && (
            <div className="admin-avatar-notice">
              👑 管理员专属头像
            </div>
          )}
        </div>

        {/* 用户信息 */}
        <div className="profile-info-section">
          <div className="profile-info-item">
            <label>用户名</label>
            <div className="profile-info-value">{user.username}</div>
          </div>
          
          <div className="profile-info-item">
            <label>邮箱</label>
            <div className="profile-info-value">{user.email}</div>
          </div>

          <div className="profile-info-item">
            <label>角色</label>
            <div className="profile-info-value">
              <span className={`role-badge ${user.role === 'admin' ? 'admin' : 'user'}`}>
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </span>
            </div>
          </div>

          <div className="profile-info-item">
            <label>注册时间</label>
            <div className="profile-info-value">
              {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '未知'}
            </div>
          </div>
        </div>

        {/* 底部操作区域 */}
        <div className="profile-actions">
          <div className="profile-tip">
            {user.role === 'admin' ? 
              '👑 管理员专属皇冠头像，不可更换' : 
              '💡 点击上方按钮可随机更换头像'
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
