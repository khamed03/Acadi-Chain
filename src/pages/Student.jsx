import { useEffect, useState } from "react";
import AuthGuard from "../components/AuthGuard.jsx";
import RequireRole from "../components/RequireRole.jsx"
import StudentWalletGuard from "../components/StudentWalletGuard.jsx"
import { useAuth } from "../../store/auth.js";
import { API } from "../lib/api.js"

export default function StudentDashboard() {
  const { token, address } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchCerts() {
      try {
        setErr(""); setLoading(true);
        const data = await API.myCertificates(token, address);
        if (mounted) setCerts(data || []);
      } catch (e) { if (mounted) setErr(e.message); }
      finally { if (mounted) setLoading(false); }
    }
    if (address) fetchCerts();
    else { setLoading(false); setCerts([]); }
    return () => { mounted = false; };
  }, [token, address]);

  return (
    <AuthGuard>
      <RequireRole allow={["student"]}>
        <StudentWalletGuard>
          <div style={{ display:"grid", gap:16 }}>
            <header>
              <h1 style={{ fontSize:24, fontWeight:700, margin:0 }}>My Certificates</h1>
              <p style={{ color:"var(--muted)" }}>Certificates linked to your connected wallet.</p>
            </header>

            {loading && <div style={{ color:"var(--muted)" }}>Loading…</div>}
            {err && <div style={{ color:"#b91c1c" }}>{err}</div>}

            {!loading && !err && (
              certs.length === 0 ? (
                <div style={{ color:"var(--muted)" }}>No certificates yet.</div>
              ) : (
                <ul style={{ display:"grid", gap:12, padding:0, margin:0, listStyle:"none" }}>
                  {certs.map((c) => (
                    <li key={c.cid} style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff" }}>
                      <div style={{ fontWeight:600 }}>{c.name}</div>
                      <div style={{ color:"var(--muted)", fontSize:14 }}>{c.degree} · {c.major} · {c.year}</div>
                      <a style={{ textDecoration:"underline", fontSize:14 }} href={`/cert/${c.cid}`}>View details</a>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        </StudentWalletGuard>
      </RequireRole>
    </AuthGuard>
  );
}
