import React, { useState, useEffect } from 'react';
import { getAvailableVenues } from '../services/admin';
import '../styles/create-modals.css';

interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  maxCount: number;
  venue: string;
}

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ isOpen, onClose, activity }) => {
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'basketball',
    venue_id: '',
    start_time: '',
    end_time: '',
    registration_deadline: '',
    max_participants: '',
    notes: '',
    allow_comments: true
  });

  useEffect(() => {
    if (isOpen) {
      loadVenues();
      if (activity) {
        // 填充表单数据
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          type: activity.type || 'basketball',
          venue_id: '', // 需要从venue名称查找ID
          start_time: formatDateTimeForInput(activity.startTime),
          end_time: formatDateTimeForInput(activity.endTime),
          registration_deadline: formatDateTimeForInput(activity.registrationDeadline),
          max_participants: activity.maxCount?.toString() || '',
          notes: '',
          allow_comments: true
        });
      }
    }
  }, [isOpen, activity]);

  const loadVenues = async () => {
    try {
      const venueList = await getAvailableVenues();
      setVenues(venueList);
    } catch (error) {
      console.error('获取场馆列表失败:', error);
    }
  };

  const formatDateTimeForInput = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    // 假设输入格式是 "2024年01月15日 10:00"
    const match = dateTimeString.match(/(\d{4})年(\d{2})月(\d{2})日\s+(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hour, minute] = match;
      return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // TODO: 实现活动更新API调用
      console.log('更新活动:', formData);
      alert('活动更新功能正在开发中...');
      onClose();
    } catch (error) {
      console.error('更新活动失败:', error);
      alert('更新活动失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ 编辑活动</h2>
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
            <label>活动类型</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              required
            >
              <option value="basketball">篮球</option>
              <option value="football">足球</option>
              <option value="badminton">羽毛球</option>
              <option value="tennis">网球</option>
              <option value="swimming">游泳</option>
              <option value="fitness">健身</option>
              <option value="other">其他</option>
            </select>
          </div>

          <div className="form-group">
            <label>活动场馆</label>
            <select 
              name="venue_id" 
              value={formData.venue_id} 
              onChange={handleChange}
              required
            >
              <option value="">请选择场馆</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name} - {venue.location}
                </option>
              ))}
            </select>
          </div>

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
            <label>最大参与人数</label>
            <input 
              type="number" 
              name="max_participants" 
              value={formData.max_participants} 
              onChange={handleChange}
              placeholder="请输入最大参与人数"
              min="1"
              required 
            />
          </div>

          <div className="form-group">
            <label>活动描述</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              placeholder="请输入活动的详细描述"
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>备注信息</label>
            <textarea 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange}
              placeholder="请输入活动备注（可选）"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                name="allow_comments" 
                checked={formData.allow_comments} 
                onChange={handleChange}
              />
              允许参与者评论
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              取消
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? '更新中...' : '更新活动'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityModal;
