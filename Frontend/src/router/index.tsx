import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import RegistrationOpen from "@/pages/RegistrationOpen";
import ActivitiesEnded from "@/pages/ActivitiesEnded";
import ParticipatedActivities from "@/pages/ParticipatedActivities";
import PendingActivities from "@/pages/PendingActivities";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/activities/registration-open", element: <RegistrationOpen /> },
  { path: "/activities/ended", element: <ActivitiesEnded /> },
  { path: "/activities/participated", element: <ParticipatedActivities /> },
  { path: "/activities/pending", element: <PendingActivities /> },
  // 后续添加：活动详情页面等
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
