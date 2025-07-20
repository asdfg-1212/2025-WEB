import React, {useState} from "react";
import AuthForm from "./components/AuthForm";

const App: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");

  const handleAuthSubmit = async (data: { email: string; password: string }) => {
    const endpoint = mode === "login" ? "/api/login" : "/api/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`${mode === "login" ? "登录成功" : "注册成功"}！`);
        //JWT
        if(result.token) {
          localStorage.setItem("token", result.token);
        }
      } else{
        alert(result.message || "操作失败");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
      alert("网络错误，请稍后再试。");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        {mode === "login" ? "登录" : "注册"}
      </h1>

      <AuthForm
        onSubmit={handleAuthSubmit}
        submitText={mode === "login" ? "登录" : "注册"}
      />

      <button
        className="mt-4 text-blue-500 underline"
        onClick={() => setMode(mode === "login" ? "register" : "login")}
      >
        {mode === "login" ? "没有账号？点击注册" : "已有账号？点击登录"}
      </button>
    </div>
  );
};

export default App;