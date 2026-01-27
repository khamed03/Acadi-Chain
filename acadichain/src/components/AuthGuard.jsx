// src/components/AuthGuard.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth.js";

// Protects routes that require being "signed in" with a wallet session
export default function AuthGuard({ children }) {
  const { hydrated, address } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!address) navigate("/"); // redirect to Sign-In
  }, [hydrated, address, navigate]);

  if (!hydrated) return null;
  if (!address) return null;

  return <>{children}</>;
}
