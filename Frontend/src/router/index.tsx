import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  // 后续添加：主页、活动页面等


  
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
