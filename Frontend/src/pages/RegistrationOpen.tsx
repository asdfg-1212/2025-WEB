import React, { useState, useEffect } from 'react';
import ActivityList from '../components/ActivityList';
import ActivityDetailModal from '../components/ActivityDetailModal';
import type { ActivityDisplay } from '../types/activity';
import { useUser } from '../contexts/UserContext';
import { 
  getActivities, 
  registerForActivity, 
  unregisterFromActivity, 
  postActivityComment,
  getRegistrationStatus
} from '../services/activity';

const RegistrationOpen: React.FC = () => {
  const { user } = useUser();
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityDisplay[]>([]); // 筛选后的活动列表
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDisplay | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  
  // 搜索相关状态
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        // 获取所有活动，然后筛选出报名截止时间还没到的活动
        const response = await getActivities();
        
        if (response && response.success && Array.isArray(response.data)) {
          // 筛选出报名中的活动（未被删除的、报名截止时间还没到的活动）
          const openActivities = response.data.filter((activity: any) => {
            const now = new Date();
            const registrationDeadline = new Date(activity.registration_deadline);
            
            // 未被删除的、报名截止时间还没到的活动
            return activity.status !== 'cancelled' && registrationDeadline > now;
          });
          
          setActivities(openActivities);
          setFilteredActivities(openActivities); // 初始时显示所有活动
        } else {
          setActivities([]);
          setFilteredActivities([]);
        }
        setError(null);
      } catch (err: any) {
        console.error('获取活动列表失败:', err);
        setError(err.message || '获取活动列表失败');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // 搜索过滤 useEffect
  useEffect(() => {
    let filtered = activities;
    
    // 按名称搜索
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // 按类型筛选
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => 
        activity.type === selectedType
      );
    }
    
    setFilteredActivities(filtered);
  }, [activities, searchTerm, selectedType]);

  const handleActivityClick = async (activity: ActivityDisplay) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
    
    // 检查用户是否已报名该活动
    if (user) {
      try {
        const registrationStatus = await getRegistrationStatus(activity.id.toString());
        setIsUserRegistered(registrationStatus.isRegistered || false);
      } catch (error) {
        console.error('检查报名状态失败:', error);
        setIsUserRegistered(false);
      }
    } else {
      setIsUserRegistered(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
    setIsUserRegistered(false); // 重置报名状态
  };

  const handleRegister = async (activityId: number) => {
    try {
      await registerForActivity(activityId.toString());
      alert('报名成功！');
      setIsUserRegistered(true); // 更新报名状态
      // 重新获取活动列表以更新报名人数
      const response = await getActivities();
      if (response && response.success && Array.isArray(response.data)) {
        const openActivities = response.data.filter((activity: any) => {
          const now = new Date();
          const registrationDeadline = new Date(activity.registration_deadline);
          return activity.status !== 'cancelled' && registrationDeadline > now;
        });
        setActivities(openActivities);
        // 注意：不需要手动更新 filteredActivities，因为 useEffect 会自动处理
      }
    } catch (err: any) {
      console.error('报名失败:', err);
      alert('报名失败: ' + (err.message || '未知错误'));
      throw err; // 重新抛出错误，让 ActivityDetailModal 能够捕获
    }
  };

  const handleUnregister = async (activityId: number) => {
    try {
      await unregisterFromActivity(activityId.toString());
      alert('取消报名成功！');
      setIsUserRegistered(false); // 更新报名状态
      // 重新获取活动列表以更新报名人数
      const response = await getActivities();
      if (response && response.success && Array.isArray(response.data)) {
        const openActivities = response.data.filter((activity: any) => {
          const now = new Date();
          const registrationDeadline = new Date(activity.registration_deadline);
          return activity.status !== 'cancelled' && registrationDeadline > now;
        });
        setActivities(openActivities);
        // 注意：不需要手动更新 filteredActivities，因为 useEffect 会自动处理
      }
    } catch (err: any) {
      console.error('取消报名失败:', err);
      alert('取消报名失败: ' + (err.message || '未知错误'));
      throw err; // 重新抛出错误，让 ActivityDetailModal 能够捕获
    }
  };

  const handlePostComment = async (activityId: number, content: string) => {
    try {
      await postActivityComment(activityId.toString(), content);
      alert('评论发表成功！');
    } catch (err: any) {
      console.error('发表评论失败:', err);
      alert('发表评论失败: ' + (err.message || '未知错误'));
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontSize: '18px',
        color: '#ff4757'
      }}>
        <p>错误: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          重新加载
        </button>
      </div>
    );
  }

  return (
    <>
      {/* 搜索和筛选区域 */}
      <div style={{
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e9ecef',
        marginBottom: '20px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <h2 style={{ margin: 0, color: '#333', minWidth: '120px' }}>报名中的活动</h2>
          
          {/* 搜索框 */}
          <div style={{ flex: '1', minWidth: '200px', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="搜索活动名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
          </div>
          
          {/* 类型筛选 */}
          <div style={{ minWidth: '120px' }}>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">所有类型</option>
              <option value="篮球">篮球</option>
              <option value="足球">足球</option>
              <option value="羽毛球">羽毛球</option>
              <option value="网球">网球</option>
              <option value="乒乓球">乒乓球</option>
              <option value="排球">排球</option>
              <option value="台球">台球</option>
              <option value="高尔夫">高尔夫</option>
              <option value="跑步">跑步</option>
              <option value="游泳">游泳</option>
              <option value="武术">武术</option>
              <option value="舞蹈">舞蹈</option>
              <option value="击剑">击剑</option>
              <option value="跆拳道">跆拳道</option>
              <option value="射击">射击</option>
              <option value="滑冰">滑冰</option>
              <option value="其他">其他</option>
            </select>
          </div>
          
          {/* 搜索结果统计 */}
          <div style={{ 
            color: '#666', 
            fontSize: '14px',
            minWidth: '100px'
          }}>
            共 {filteredActivities.length} 个活动
          </div>
        </div>
      </div>

      {/* 活动列表或无结果提示 */}
      {filteredActivities.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          color: '#666',
          fontSize: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>没有找到符合条件的活动</p>
          {(searchTerm || selectedType !== 'all') && (
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', margin: '4px 0' }}>
                当前搜索条件：
                {searchTerm && <span style={{ color: '#4CAF50' }}>"{searchTerm}"</span>}
                {searchTerm && selectedType !== 'all' && ' + '}
                {selectedType !== 'all' && <span style={{ color: '#4CAF50' }}>{selectedType}</span>}
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType('all');
                }}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                清除筛选条件
              </button>
            </div>
          )}
        </div>
      ) : (
        <ActivityList
          activities={filteredActivities}
          title="" // 清空标题，因为我们在上面已经显示了
          onActivityClick={(listActivity) => {
            // 根据ID找到原始activity对象
            const originalActivity = filteredActivities.find(a => a.id.toString() === listActivity.id.toString());
            if (originalActivity) {
              handleActivityClick(originalActivity);
            }
          }}
        />
      )}
      
      <ActivityDetailModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRegister={handleRegister}
        onUnregister={handleUnregister}
        onPostComment={handlePostComment}
        isUserRegistered={isUserRegistered}
      />
    </>
  );
};

export default RegistrationOpen;
