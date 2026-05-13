import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role: "student" | "teacher" | "hod" | "principal";
}) {
  const { user, role: userRole } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (userRole !== role) return <Navigate to="/login" replace />;

  return <>{children}</>;
}