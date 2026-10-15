// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Logged in but the wrong role: send them to their own home
  if (user.role !== role) {
    return <Navigate to={user.role === "MANAGER" ? "/manager" : "/user"} replace />;
  }
  return children;
}