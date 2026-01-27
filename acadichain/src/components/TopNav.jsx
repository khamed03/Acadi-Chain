// src/components/TopNav.jsx
import { Link, useNavigate } from "react-router-dom";
import s from "../styles/layout.module.css";
import Button from "./ui/Button.jsx";
import { useAuth } from "../store/auth.js";

export default function TopNav() {
  const { token, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleDisconnect() {
    // 1) Clear app auth (token/role/address in your Zustand store)
    logout();

    // 2) Clear common cached wallet connector state (prevents auto-reconnect)
    // wagmi / web3modal / walletconnect (harmless even if not used)
    localStorage.removeItem("wagmi.store");
    localStorage.removeItem("wagmi.connected");
    localStorage.removeItem("WALLETCONNECT_DEEPLINK_CHOICE");
    localStorage.removeItem("walletconnect");
    localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER");

    // 3) Go back to sign-in
    navigate("/");

    // NOTE:
    // MetaMask doesn't support a true "disconnect" from code.
    // If MetaMask still auto-connects, disconnect the site from MetaMask:
    // Settings → Connected sites → localhost:3000 → Disconnect
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
          <Link to="/guest">Guest lookup</Link>

          {token ? (
            <Button variant="secondary" onClick={handleDisconnect}>
              Switch wallet ({role})
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
