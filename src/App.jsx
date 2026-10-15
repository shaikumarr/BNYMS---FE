// src/App.jsx
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/manager/Dashboard";
import Employees from "./pages/manager/Employees";
import Projects from "./pages/manager/Projects";
import ProjectTasks from "./pages/manager/ProjectTasks";
import Approvals from "./pages/manager/Approvals";
import MyTasks from "./pages/user/MyTasks";
import TaskDetail from "./pages/user/TaskDetail";
import MyProgress from "./pages/user/MyProgress";

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "MANAGER" ? "/manager" : "/user"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route
        path="/manager"
        element={
          <ProtectedRoute role="MANAGER">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="employees" element={<Employees />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectTasks />} />
        <Route path="approvals" element={<Approvals />} />
      </Route>

      <Route
        path="/user"
        element={
          <ProtectedRoute role="USER">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MyTasks />} />
        <Route path="tasks/:id" element={<TaskDetail />} />
        <Route path="progress" element={<MyProgress />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}