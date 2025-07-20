import React from "react";
import AuthForm from "@/components/AuthForm";
import { useNavigate, Link } from "react-router-dom";
import { register } from "@/services/auth";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = async (data: { email: string; username: string; password: string }) => {
    try {
      await register(data.email, data.username, data.password);
      alert("注册成功，请登录！");
      navigate("/login");
    } catch (err) {
      alert("注册失败，请重试。");
    }
  };

  // 完整的页面样式
  const pageStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(135deg, #4CAF50 0%, #2196F3 50%, #FF9800 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
    zIndex: 1000,
    overflow: 'hidden'
  };

  const decorationCircle1Style: React.CSSProperties = {
    position: 'absolute',
    top: '-50%',
    left: '-20%',
    width: '80%',
    height: '80%',
    background: 'rgba(76, 175, 80, 0.3)',
    borderRadius: '50%',
    zIndex: 1001
  };

  const decorationCircle2Style: React.CSSProperties = {
    position: 'absolute',
    bottom: '-30%',
    right: '-15%',
    width: '60%',
    height: '60%',
    background: 'rgba(255, 152, 0, 0.2)',
    borderRadius: '50%',
    zIndex: 1001
  };

  const decorationArcStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '300px',
    height: '300px',
    border: '3px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    zIndex: 1002
  };

  const linkStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '40px',
    color: 'white',
    zIndex: 1004,
    textAlign: 'center' as const
  };

  return (
    <div style={pageStyle}>
      {/* 装饰圆圈 */}
      <div style={decorationCircle1Style}></div>
      <div style={decorationCircle2Style}></div>
      
      {/* 右上角装饰弧线 */}
      <div style={decorationArcStyle}>
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '50px',
          width: '200px',
          height: '200px',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '50%'
        }}></div>
      </div>
      
      <AuthForm 
        onSubmit={handleRegister} 
        submitText="注册" 
        title="体育活动室网站"
        subtitle="创建您的账户"
      />
      
      {/* 登录链接 */}
      <div style={linkStyle}>
        已有账户？ <Link to="/login" style={{ color: '#4CAF50', textDecoration: 'none' }}>立即登录</Link>
      </div>
    </div>
  );
};

export default Register;
