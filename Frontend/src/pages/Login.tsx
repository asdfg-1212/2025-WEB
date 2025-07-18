import React from "react";
import AuthForm from "../components/AuthForm";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/auth";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      alert("登录成功！");
      navigate("/"); // 登录成功跳转首页
    } catch (err) {
      alert("登录失败，请检查用户名或密码。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm onSubmit={handleLogin} submitText="登录" />
    </div>
  );
};

export default Login;
