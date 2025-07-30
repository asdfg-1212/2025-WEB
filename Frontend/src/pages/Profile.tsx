import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import HeaderUserInfo from '../components/HeaderUserInfo';
import { getUserAvatar } from '../utils/avatar';
import '../styles/profile.css';

const Profile: React.FC = () => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar_emoji: user?.avatar_emoji || ''
  });

  const handleSave = async () => {
    try {
      // TODO: 实现保存用户信息的API调用
      console.log('保存用户信息:', formData);
      alert('用户信息已保存！');
      setIsEditing(false);
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      avatar_emoji: user?.avatar_emoji || ''
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="profile-page">
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <HeaderUserInfo />
      
      <div className="profile-container">
        <div className="profile-header">
          <h1>个人信息</h1>
          <p>管理您的账户信息和偏好设置</p>
        </div>

        <div className="profile-content">
          {/* 用户头像部分 */}
          <div className="avatar-section">
            <div className="avatar-display">
              <img 
                src={getUserAvatar(user)}
                alt={`${user.username}的头像`}
                className="profile-avatar"
              />
              {user.role === 'admin' && (
                <div className="profile-admin-badge">👑</div>
              )}
            </div>
            <div className="avatar-info">
              <h3>{user.username}</h3>
              <span className="role-badge">
                {user.role === 'admin' ? '管理员' : '普通用户'}
              </span>
            </div>
          </div>

          {/* 用户信息表单 */}
          <div className="info-section">
            <div className="section-header">
              <h3>基本信息</h3>
              {!isEditing ? (
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  编辑
                </button>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="save-btn"
                    onClick={handleSave}
                  >
                    保存
                  </button>
                  <button 
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    取消
                  </button>
                </div>
              )}
            </div>

            <div className="form-grid">
              <div className="form-field">
                <label>用户名</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="form-value">{user.username}</div>
                )}
              </div>

              <div className="form-field">
                <label>邮箱</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                  />
                ) : (
                  <div className="form-value">{user.email}</div>
                )}
              </div>

              <div className="form-field">
                <label>注册时间</label>
                <div className="form-value">
                  {user.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '未知'}
                </div>
              </div>

              <div className="form-field">
                <label>用户角色</label>
                <div className="form-value">
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </div>
              </div>
            </div>
          </div>

          {/* 安全设置 */}
          <div className="security-section">
            <h3>安全设置</h3>
            <div className="security-item">
              <div>
                <h4>修改密码</h4>
                <p>定期更换密码以保护账户安全</p>
              </div>
              <button className="security-btn">
                修改密码
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
