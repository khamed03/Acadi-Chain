import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.js";

export default function StudentWalletGuard({ children }) {
  const { role, address, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (role === "student" && !address) navigate("/connect-wallet");
  }, [hydrated, role, address, navigate]);

  if (role === "student" && !address) return null; // brief blank while redirecting
  return <>{children}</>;
}
