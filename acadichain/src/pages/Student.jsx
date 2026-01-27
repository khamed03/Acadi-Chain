import { useEffect, useState } from "react";
import AuthGuard from "../components/AuthGuard.jsx";
import RequireRole from "../components/RequireRole.jsx";
import StudentWalletGuard from "../components/StudentWalletGuard.jsx";
import { useAuth } from "../store/auth.js";
import { API } from "../lib/api.js";
import { getCertStatus } from "../lib/utils.js";

function fmtTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return new Date(n * 1000).toLocaleString();
}

function statusColor(status) {
  // Keep color changing based on status
  switch (status) {
    case "Revoked":
      return "#b91c1c"; // red
    case "Expired":
      return "#f59e0b"; // amber/orange
    case "Active":
      return "#16a34a"; // green
    default:
      return "var(--muted)";
  }
}

export default function Student() {
  const { token, address } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Optional: make status update without refresh (every 30s)
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchCerts() {
      try {
        setErr("");
        setLoading(true);
        const data = await API.myCertificates(token, address);
        if (mounted) setCerts(data || []);
      } catch (e) {
        if (mounted) setErr(e?.message || "Failed to load certificates");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (address) fetchCerts();
    else {
      setLoading(false);
      setCerts([]);
    }

    return () => {
      mounted = false;
    };
  }, [token, address]);

  return (
    <AuthGuard>
      <RequireRole allow={["student"]}>
        <StudentWalletGuard>
          <div style={{ display: "grid", gap: 16 }}>
            <header>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
                My Certificates
              </h1>
              <p style={{ color: "var(--muted)" }}>
                Certificates linked to your wallet (on-chain).
              </p>
            </header>

            {loading && <div style={{ color: "var(--muted)" }}>Loading…</div>}
            {err && <div style={{ color: "#b91c1c" }}>{err}</div>}

            {!loading && !err && (
              certs.length === 0 ? (
                <div style={{ color: "var(--muted)" }}>No certificates yet.</div>
              ) : (
                <ul
                  style={{
                    display: "grid",
                    gap: 12,
                    padding: 0,
                    margin: 0,
                    listStyle: "none",
                  }}
                >
                  {certs.map((c) => {
                    // ✅ single source of truth status (Active / Expired / Revoked)
                    const status = getCertStatus(c);

                    return (
                      <li
                        key={c.specialId}
                        style={{
                          padding: 16,
                          border: "1px solid var(--border)",
                          borderRadius: 16,
                          background: "#fff",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{c.specialId}</div>

                          {/* ✅ color changes by computed status */}
                          <div
                            style={{
                              color: statusColor(status),
                              fontWeight: 700,
                            }}
                          >
                            {status}
                          </div>
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            color: "var(--muted)",
                            fontSize: 14,
                          }}
                        >
                          <div>
                            <b>Issuer:</b> {c.issuerName}
                          </div>
                          <div>
                            <b>Student:</b> {c.studentName}
                          </div>
                          <div>
                            <b>Course:</b> {c.courseName}
                          </div>
                          <div>
                            <b>Issued At:</b> {fmtTs(c.issuedAt)}
                          </div>

                          <div>
                            <b>Expiry:</b>{" "}
                            {Number(c.expiry) === 0 ? "No expiry" : fmtTs(c.expiry)}
                          </div>
                        </div>

                        <div style={{ marginTop: 10 }} />
                      </li>
                    );
                  })}
                </ul>
              )
            )}
          </div>
        </StudentWalletGuard>
      </RequireRole>
    </AuthGuard>
  );
}
