import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  // 后续添加：主页、活动页面等
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
