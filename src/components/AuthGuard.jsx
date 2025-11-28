// src/components/AuthGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.js";

// Protects routes that require being logged in
export default function AuthGuard({ children }) {
  const { token, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!token) navigate("/"); // redirect to Sign-In
  }, [hydrated, token, navigate]);

  // While waiting for store hydration, show nothing
  if (!hydrated) return null;
  if (!token) return null;

  return <>{children}</>;
}
