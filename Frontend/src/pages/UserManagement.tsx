import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import '../styles/user-management.css';

interface UserListItem {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'user'>('all');

  useEffect(() => {
    // 模拟获取用户列表
    const fetchUsers = async () => {
      try {
        // TODO: 替换为真实API调用
        const mockUsers: UserListItem[] = [
          {
            id: '1',
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            createdAt: '2025-01-01T00:00:00Z',
            lastLoginAt: '2025-07-24T09:00:00Z'
          },
          {
            id: '2',
            username: 'user1',
            email: 'user1@example.com',
            role: 'user',
            createdAt: '2025-02-15T00:00:00Z',
            lastLoginAt: '2025-07-23T14:30:00Z'
          },
          {
            id: '3',
            username: 'user2',
            email: 'user2@example.com',
            role: 'user',
            createdAt: '2025-03-10T00:00:00Z',
            lastLoginAt: '2025-07-22T10:15:00Z'
          }
        ];
        
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        setUsers(mockUsers);
      } catch (error) {
        console.error('获取用户列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // 过滤用户列表
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      // TODO: 实现角色更改API调用
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      alert(`用户角色已更改为 ${newRole === 'admin' ? '管理员' : '普通用户'}`);
    } catch (error) {
      console.error('更改用户角色失败:', error);
      alert('更改用户角色失败');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert('不能删除自己的账户');
      return;
    }

    if (window.confirm('确定要删除这个用户吗？此操作不可撤销。')) {
      try {
        // TODO: 实现删除用户API调用
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('用户已删除');
      } catch (error) {
        console.error('删除用户失败:', error);
        alert('删除用户失败');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>加载用户列表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h1>用户管理</h1>
        <p>管理系统用户账户和权限</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="role-filter">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value as 'all' | 'admin' | 'user')}
            className="role-select"
          >
            <option value="all">所有角色</option>
            <option value="admin">管理员</option>
            <option value="user">普通用户</option>
          </select>
        </div>
      </div>

      {/* 用户统计 */}
      <div className="user-stats">
        <div className="stat-item">
          <span className="stat-number">{users.length}</span>
          <span className="stat-label">总用户数</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
          <span className="stat-label">管理员</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">{users.filter(u => u.role === 'user').length}</span>
          <span className="stat-label">普通用户</span>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="users-table">
        <div className="table-header">
          <div className="header-cell">用户</div>
          <div className="header-cell">邮箱</div>
          <div className="header-cell">角色</div>
          <div className="header-cell">注册时间</div>
          <div className="header-cell">最后登录</div>
          <div className="header-cell">操作</div>
        </div>
        
        {filteredUsers.map(user => (
          <div key={user.id} className={`user-row ${user.id === currentUser?.id ? 'current-user' : ''}`}>
            <div className="user-cell">
              <div className="user-info">
                <div className="user-avatar">
                  <img 
                    src={user.avatar || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2MzY2ZjEiLz4KPGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iNiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTggMzJDOCAyNi40NzcgMTMuNDc3IDIyIDIwIDIyQzI2LjUyMyAyMiAzMiAyNi40NzcgMzIgMzJWMzRIOFYzMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="}
                    alt={`${user.username}的头像`}
                  />
                  {user.role === 'admin' && <span className="admin-badge">👑</span>}
                </div>
                <div className="user-details">
                  <div className="username">{user.username}</div>
                  {user.id === currentUser?.id && <span className="self-indicator">(当前用户)</span>}
                </div>
              </div>
            </div>
            <div className="user-cell">{user.email}</div>
            <div className="user-cell">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                className="role-select inline"
                disabled={user.id === currentUser?.id}
              >
                <option value="user">普通用户</option>
                <option value="admin">管理员</option>
              </select>
            </div>
            <div className="user-cell">{formatDate(user.createdAt)}</div>
            <div className="user-cell">{user.lastLoginAt ? formatDate(user.lastLoginAt) : '从未登录'}</div>
            <div className="user-cell">
              <button
                onClick={() => handleDeleteUser(user.id)}
                className="delete-btn"
                disabled={user.id === currentUser?.id}
                title={user.id === currentUser?.id ? '不能删除自己' : '删除用户'}
              >
                删除
              </button>
            </div>
          </div>
        ))}
        
        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>没有找到匹配的用户</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
