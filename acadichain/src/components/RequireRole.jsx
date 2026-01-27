// src/components/RequireRole.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.js";

export default function RequireRole({ allow = [], children }) {
  const { role, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!role || !allow.includes(role)) {
      navigate("/");  // not allowed → go back to Sign-In
    }
  }, [hydrated, role, allow, navigate]);

  if (!hydrated) return null;
  if (!role || !allow.includes(role)) return null;

  return <>{children}</>;
}
