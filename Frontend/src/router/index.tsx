import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import RegistrationOpen from "../pages/RegistrationOpen";
import ActivitiesEnded from "../pages/ActivitiesEnded";
import ParticipatedActivities from "../pages/ParticipatedActivities";
import PendingActivities from "../pages/PendingActivities";
import ProtectedRoute from "../components/ProtectedRoute";
import { UserProvider } from "../contexts/UserContext";

const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { 
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    )
  },
  { 
    path: "/profile", 
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    )
  },
  { 
    path: "/activities/registration-open", 
    element: (
      <ProtectedRoute>
        <RegistrationOpen />
      </ProtectedRoute>
    )
  },
  { 
    path: "/activities/ended", 
    element: (
      <ProtectedRoute>
        <ActivitiesEnded />
      </ProtectedRoute>
    )
  },
  { 
    path: "/activities/participated", 
    element: (
      <ProtectedRoute>
        <ParticipatedActivities />
      </ProtectedRoute>
    )
  },
  { 
    path: "/activities/pending", 
    element: (
      <ProtectedRoute>
        <PendingActivities />
      </ProtectedRoute>
    )
  },
  // 后续添加：活动详情页面等
]);

export default function AppRouter() {
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
