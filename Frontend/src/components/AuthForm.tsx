import React from "react";
import "../styles/auth.css";

const AuthForm: React.FC<{
  onSubmit: (data: { email: string; username: string; password: string }) => void;
  submitText: string;
  title?: string;
  subtitle?: string;
  bottomLink?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
}> = ({ onSubmit, submitText, title, subtitle, bottomLink, loading = false, error }) => {
  const [email, setEmail] = React.useState('');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, username, password });
  };

  return (
    <div className="auth-form-container">
      {/* Logo 和标题 */}
      <div className="auth-logo">
        <div className="basketball-icon">
          <div className="basketball-lines"></div>
        </div>
        <h1 className="auth-title">{title || "体育活动室"}</h1>
        <p className="auth-subtitle">{subtitle || "Welcome back!"}</p>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="input-group">
          <span className="input-icon">📧</span>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input auth-input-with-icon"
            required
          />
        </div>
        <div className="input-group">
          <span className="input-icon">👤</span>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="auth-input auth-input-with-icon"
            required
          />
        </div>
        <div className="input-group">
          <span className="input-icon">🔒</span>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input auth-input-with-icon"
            required
          />
        </div>
        
        {/* 错误显示 */}
        {error && (
          <div style={{
            color: '#f44336',
            fontSize: '14px',
            marginBottom: '16px',
            textAlign: 'center',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          className="auth-submit"
          disabled={loading}
          style={{
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '处理中...' : submitText}
        </button>
        
        {/* 底部链接 */}
        {bottomLink && (
          <div className="auth-bottom-link">
            {bottomLink}
          </div>
        )}
      </form>
    </div>
  );
};


export default AuthForm;
