import AuthGuard from "../../components/AuthGuard.jsx";
import RequireRole from "../../components/RequireRole.jsx";
import { Link } from "react-router-dom";

export default function IssuerDashboard() {
  return (
    <AuthGuard>
      <RequireRole allow={["issuer"]}>
        <div style={{ display: "grid", gap: 16 }}>
          <h1>Issuer Dashboard</h1>
          <div>
            <h2>Issue new certificate</h2>
            <p>Publish metadata to IPFS and the smart contract.</p>
            <Link to="/issuer">Open issuer console →</Link>
          </div>
        </div>
      </RequireRole>
    </AuthGuard>
  );
}
