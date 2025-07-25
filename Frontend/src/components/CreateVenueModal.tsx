import React, { useState } from 'react';
import { createVenue } from '../services/admin';
import { useUser } from '../contexts/UserContext';
import '../styles/create-modals.css';

interface CreateVenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateVenueModal: React.FC<CreateVenueModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    
    try {
      await createVenue({
        name: formData.name,
        location: formData.location,
        operator_id: user.id
      });
      
      alert('场馆创建成功！');
      setFormData({
        name: '',
        location: ''
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('创建场馆失败:', error);
      alert('创建场馆失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🏢 创建新场馆</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>场馆名称</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              placeholder="请输入场馆名称"
              required 
            />
          </div>

          <div className="form-group">
            <label>场馆位置</label>
            <input 
              type="text" 
              name="location" 
              value={formData.location} 
              onChange={handleChange}
              placeholder="请输入场馆地址"
              required 
            />
          </div>

          {/*<div className="form-group">
            <label>容纳人数</label>
            <input 
              type="number" 
              name="capacity" 
              value={formData.capacity} 
              onChange={handleChange}
              placeholder="请输入最大容纳人数"
              min="1"
              required 
            />
          </div>

          <div className="form-group">
            <label>设施说明</label>
            <textarea 
              name="facilities" 
              value={formData.facilities} 
              onChange={handleChange}
              placeholder="请描述场馆的设施和特色（如：篮球架、更衣室、停车场等）"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>场馆描述</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="请输入场馆的详细描述"
              rows={4}
            />
          </div>*/}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              取消
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? '创建中...' : '创建场馆'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVenueModal;
