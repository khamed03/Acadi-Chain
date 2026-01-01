import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/auth";

export default function TopNav() {
  const { role, isAuthed, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="nav">
      <div className="nav-left">
        <b>Acadi-Chain</b>
        <span className="badge">{role}</span>
      </div>
      <div className="nav-right">
        <Link to="/guest">Guest</Link>
        {isAuthed ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <button
              onClick={() => {
                logout();
                nav("/");
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/">Sign in</Link>
        )}
      </div>
    </div>
  );
}
