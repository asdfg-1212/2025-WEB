import React from "react";
import AuthForm from "@/components/AuthForm";
import { useNavigate } from "react-router-dom";
import { register } from "@/services/auth";

const Register: React.FC = () => {
  const navigate = useNavigate();

  const handleRegister = async (data: { email: string; password: string }) => {
    try {
      await register(data.email, data.password);
      alert("注册成功，请登录！");
      navigate("/login");
    } catch (err) {
      alert("注册失败，请重试。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm onSubmit={handleRegister} submitText="注册" />
    </div>
  );
};

export default Register;
