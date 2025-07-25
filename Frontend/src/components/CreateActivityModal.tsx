import React, { useState, useEffect } from 'react';
import { createActivity, getAvailableVenues } from '../services/admin';
import { useUser } from '../contexts/UserContext';
import '../styles/create-modals.css';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface Venue {
  id: number;
  name: string;
  location?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useUser();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    venue_id: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    max_participants: '',
    notes: '',
    allow_comments: true
  });

  // 获取场馆列表
  useEffect(() => {
    if (isOpen) {
      loadVenues();
    }
  }, [isOpen]);

  const loadVenues = async () => {
    try {
      console.log('开始加载场馆列表...');
      const venueList = await getAvailableVenues();
      console.log('获取到的场馆列表:', venueList);
      setVenues(venueList || []);
    } catch (error) {
      console.error('获取场馆列表失败:', error);
      // 如果API失败，显示错误提示
      alert('获取场馆列表失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('请先登录');
      return;
    }

    setLoading(true);
    
    try {
      await createActivity({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        start_time: formData.start_time,
        end_time: formData.end_time,
        registration_deadline: formData.registration_deadline,
        max_participants: Number(formData.max_participants),
        venue_id: Number(formData.venue_id),
        creator_id: user.id,
        notes: formData.notes,
        allow_comments: formData.allow_comments
      });
      
      alert('活动创建成功！');
      setFormData({
        title: '',
        description: '',
        type: '',
        venue_id: '',
        start_time: '',
        end_time: '',
        registration_deadline: '',
        max_participants: '',
        notes: '',
        allow_comments: true
      });
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('创建活动失败:', error);
      alert('创建活动失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          <h2>📝 发布新活动</h2>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>活动标题</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange}
              placeholder="请输入活动标题"
              required 
            />
          </div>

          <div className="form-group">
            <label>活动描述</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="请描述活动的详细信息"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>活动类型</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="">请选择活动类型</option>
              <option value="basketball">篮球</option>
              <option value="football">足球</option>
              <option value="badminton">羽毛球</option>
              <option value="tennis">网球</option>
              <option value="pingpong">乒乓球</option>
              <option value="volleyball">排球</option>
              <option value="billiards">台球</option>
              <option value="golf">高尔夫</option>
              <option value="running">跑步</option>
              <option value="swimming">游泳</option>
              <option value="martial arts">武术</option>
              <option value="dance">舞蹈</option>
              <option value="fencing">击剑</option>
              <option value="taekwondo">跆拳道</option>
              <option value="shooting">射击</option>
              <option value="skating">滑冰</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="form-group">
            <label>活动场馆</label>
            <select name="venue_id" value={formData.venue_id} onChange={handleChange} required>
              <option value="">请选择场馆</option>
              {venues.length === 0 ? (
                <option value="" disabled>暂无可用场馆，请先创建场馆</option>
              ) : (
                venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} - {venue.location}
                  </option>
                ))
              )}
            </select>
            {venues.length === 0 && (
              <small style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                💡 提示：如果没有可用场馆，请先使用"场馆创建"功能添加场馆
              </small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>开始时间</label>
              <input 
                type="datetime-local" 
                name="start_time" 
                value={formData.start_time} 
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>结束时间</label>
              <input 
                type="datetime-local" 
                name="end_time" 
                value={formData.end_time} 
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>报名截止时间</label>
              <input 
                type="datetime-local" 
                name="registration_deadline" 
                value={formData.registration_deadline} 
                onChange={handleChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>最大人数</label>
              <input 
                type="number" 
                name="max_participants" 
                value={formData.max_participants} 
                onChange={handleChange}
                placeholder="0"
                min="1"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>备注信息</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              placeholder="其他需要说明的信息"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                name="allow_comments" 
                checked={formData.allow_comments} 
                onChange={(e) => setFormData({...formData, allow_comments: e.target.checked})}
              />
              允许参与者发表评论
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>
              取消
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? '创建中...' : '发布活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivityModal;
