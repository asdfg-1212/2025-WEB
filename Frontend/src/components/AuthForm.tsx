import React from "react";
import "../styles/auth.css";

const AuthForm: React.FC<{
  onSubmit: (data: { email: string; username: string; password: string }) => void;
  submitText: string;
  title?: string;
  subtitle?: string;
  bottomLink?: React.ReactNode;
}> = ({ onSubmit, submitText, title, subtitle, bottomLink }) => {
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
        <button type="submit" className="auth-submit">
          {submitText}
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
