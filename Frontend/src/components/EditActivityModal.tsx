import React, { useState, useEffect } from 'react';
import { getAvailableVenues } from '../services/admin';
import { useUser } from '../contexts/UserContext';
import '../styles/create-modals.css';

interface Activity {
  id: number;
  title: string;
  description?: string;
  type: string;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  max_participants: number;
  venue_id: number;
  notes?: string;
  allow_comments?: boolean;
}

interface EditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
  onSuccess?: () => void;
  onDelete?: () => void;
}

const EditActivityModal: React.FC<EditActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  activity, 
  onSuccess,
  onDelete 
}) => {
  const { user } = useUser();
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
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

  useEffect(() => {
    if (isOpen) {
      loadVenues();
      if (activity) {
        // 填充表单数据
        setFormData({
          title: activity.title || '',
          description: activity.description || '',
          type: activity.type || '',
          venue_id: activity.venue_id?.toString() || '',
          start_time: formatDateTimeForInput(activity.start_time),
          end_time: formatDateTimeForInput(activity.end_time),
          registration_deadline: formatDateTimeForInput(activity.registration_deadline),
          max_participants: activity.max_participants?.toString() || '',
          notes: activity.notes || '',
          allow_comments: activity.allow_comments ?? true
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
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return '';
      
      // 转换为本地时间的ISO字符串，然后截取前16位（yyyy-MM-ddThh:mm）
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
    } catch (error) {
      console.error('日期格式化失败:', error);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !activity) {
      alert('请先登录或选择要编辑的活动');
      return;
    }

    // 检查数据是否有变化
    const hasChanges = 
      formData.title !== activity.title ||
      formData.description !== (activity.description || '') ||
      formData.type !== activity.type ||
      Number(formData.venue_id) !== activity.venue_id ||
      formData.start_time !== formatDateTimeForInput(activity.start_time) ||
      formData.end_time !== formatDateTimeForInput(activity.end_time) ||
      formData.registration_deadline !== formatDateTimeForInput(activity.registration_deadline) ||
      Number(formData.max_participants) !== activity.max_participants ||
      formData.notes !== (activity.notes || '') ||
      formData.allow_comments !== (activity.allow_comments ?? true);

    // 如果没有变化，直接关闭模态框
    if (!hasChanges) {
      onClose();
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:7001/api/activities/${activity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          type: formData.type,
          start_time: formData.start_time,
          end_time: formData.end_time,
          registration_deadline: formData.registration_deadline,
          max_participants: Number(formData.max_participants),
          venue_id: Number(formData.venue_id),
          notes: formData.notes,
          allow_comments: formData.allow_comments,
          operator_id: user.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('活动更新成功！');
        onSuccess?.();
        onClose();
      } else {
        alert('活动更新失败: ' + result.message);
      }
    } catch (error: any) {
      console.error('更新活动失败:', error);
      alert('更新活动失败: ' + (error.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!activity || !user) {
      return;
    }

    const confirmDelete = window.confirm(
      `确定要删除活动"${activity.title}"吗？\n\n此操作不可撤销，所有相关的报名和评论数据都将被删除。`
    );

    if (!confirmDelete) {
      return;
    }

    setDeleteLoading(true);

    try {
      const response = await fetch(`http://localhost:7001/api/activities/${activity.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          operator_id: user.id
        })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('活动删除成功！');
        onDelete?.();
        onClose();
      } else {
        alert('活动删除失败: ' + result.message);
      }
    } catch (error: any) {
      console.error('删除活动失败:', error);
      alert('删除活动失败: ' + (error.message || '未知错误'));
    } finally {
      setDeleteLoading(false);
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

          <div className="form-actions edit-actions">
            <button 
              type="button" 
              onClick={handleDelete} 
              className="btn-delete" 
              disabled={deleteLoading || loading}
            >
              {deleteLoading ? '删除中...' : '🗑️ 删除活动'}
            </button>
            <div className="right-actions">
              <button type="submit" className="btn-create" disabled={loading || deleteLoading}>
                {loading ? '保存中...' : '✅ 完成编辑'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityModal;
