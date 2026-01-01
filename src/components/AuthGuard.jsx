import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function AuthGuard({ children }) {
  const { isAuthed } = useAuth();
  if (!isAuthed) return <Navigate to="/" replace />;
  return children;
}
