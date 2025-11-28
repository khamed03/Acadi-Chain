// src/components/TopNav.jsx
import { Link, useNavigate } from "react-router-dom";
import s from "../styles/layout.module.css";
import Button from "./ui/Button.jsx";
import { useAuth } from "../store/auth.js";

export default function TopNav() {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className={s.header}>
      <div className={`container ${s.headerRow}`}>

        {/* Brand */}
        <Link to="/" className={s.brand}>
          <span className={s.brandIcon}>🎓</span>
          <span>Acadi-chain</span>
        </Link>

        {/* Navigation */}
        <nav className={s.nav}>
          {/*  Guest lookup link ALWAYS visible */}
          <Link to="/guest">Guest lookup</Link>

          {/* Role-based dashboard links */}
          {token && role === "issuer" && (
            <Link to="/dashboard/issuer">Dashboard</Link>
          )}
          {token && role === "verifier" && (
            <Link to="/dashboard/verifier">Dashboard</Link>
          )}
          {token && role === "student" && (
            <Link to="/dashboard/student">Dashboard</Link>
          )}

          {/* Sign-in / Logout */}
          {token ? (
            <Button variant="secondary" onClick={handleLogout}>
              Logout ({role})
            </Button>
          ) : (
            <Link to="/">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>

      </div>
    </header>
  );
}
