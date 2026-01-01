import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function RoleGate({ allow, children }) {
  const { role } = useAuth();
  if (!allow.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}
