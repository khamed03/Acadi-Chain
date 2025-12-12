import { useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard.jsx";
import RequireRole from "../../components/RequireRole.jsx";
import StudentWalletGuard from "../../components/StudentWalletGuard.jsx";
import { useAuth } from "../../store/auth.js";
import { API } from "../../lib/api.js";

export default function StudentDashboard() {
  const { token, address } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCerts() {
      setLoading(true);
      const data = await API.myCertificates(token, address);
      setCerts(data || []);
      setLoading(false);
    }
    if (address) fetchCerts();
  }, [token, address]);

  return (
    <AuthGuard>
      <RequireRole allow={["student"]}>
        <StudentWalletGuard>
          <div>
            <h1>My Certificates</h1>
            {loading ? (
              <p>Loading…</p>
            ) : (
              <ul>
                {certs.map((c) => (
                  <li key={c.cid}>
                    {c.name} – {c.degree} ({c.year}) [CID: {c.cid}]
                  </li>
                ))}
              </ul>
            )}
          </div>
        </StudentWalletGuard>
      </RequireRole>
    </AuthGuard>
  );
}
