import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import AuthGuard from "../components/AuthGuard";

export default function Dashboard() {
  const { role } = useAuth();

  const map = {
    admin: "/admin",
    issuer: "/issuer",
    student: "/student",
    verifier: "/verifier"
  };

  return (
    <AuthGuard>
      <Navigate to={map[role] || "/guest"} replace />
    </AuthGuard>
  );
}
