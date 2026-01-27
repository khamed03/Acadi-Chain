import { useEffect, useState } from "react";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { API } from "../lib/api.js";
import { getCertStatus } from "../lib/utils.js";

function isEthAddress(v) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(v || "").trim());
}

function fmtTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return new Date(n * 1000).toLocaleString();
}

function statusColor(status) {
  switch (status) {
    case "Revoked":
      return "#b91c1c";
    case "Expired":
      return "#f59e0b";
    case "Active":
      return "#16a34a";
    default:
      return "#555";
  }
}

export default function GuestSearch() {
  const [mode, setMode] = useState("id"); // "id" | "wallet"
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [certs, setCerts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // re-render every 30s so Expired status updates
  useEffect(() => {
    const t = setInterval(() => {}, 30 * 1000);
    return () => clearInterval(t);
  }, []);

  async function onSearch() {
    setError("");
    setResult(null);
    setCerts([]);
    setLoading(true);

    try {
      const q = String(query || "").trim();
      if (!q) throw new Error("Please enter a value");

      if (mode === "id") {
        const data = await API.getCertificate(q);
        setResult(data);
      } else {
        if (!isEthAddress(q)) {
          throw new Error("Invalid wallet address format (0x...)");
        }
        const list = await API.myCertificates(null, q);
        setCerts(Array.isArray(list) ? list : []);
      }
    } catch (e) {
      setError(e?.message || "Not found or invalid input");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", display: "grid", gap: 16 }}>
      <h1>Guest Certificate Lookup</h1>

      {/* 🔥 MODE SWITCH — SAME BUTTON DESIGN AS SEARCH */}
      <div style={{ display: "flex", gap: 12 }}>
        <Button
          type="button"
          onClick={() => setMode("id")}
          style={{
            opacity: mode === "id" ? 1 : 0.6,
            border:
              mode === "id"
                ? "2px solid transparent"
                : "2px solid var(--border)",
          }}
        >
          By Certificate ID
        </Button>

        <Button
          type="button"
          onClick={() => setMode("wallet")}
          style={{
            opacity: mode === "wallet" ? 1 : 0.6,
            border:
              mode === "wallet"
                ? "2px solid transparent"
                : "2px solid var(--border)",
          }}
        >
          By Student Wallet
        </Button>
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={mode === "id" ? "AC-1" : "0x..."}
      />

      <Button onClick={onSearch} disabled={loading}>
        {loading ? "Searching..." : "Search"}
      </Button>

      {error && <div style={{ color: "#b91c1c" }}>{error}</div>}

      {/* SINGLE CERTIFICATE RESULT */}
      {mode === "id" && result && (() => {
        const status = getCertStatus(result);
        return (
          <div style={{ border: "1px solid var(--border)", padding: 16, borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>Certificate {result.specialId}</h3>
              <div style={{ fontWeight: 700, color: statusColor(status) }}>
                {status}
              </div>
            </div>

            <p><b>Issuer:</b> {result.issuerName}</p>
            <p><b>Student:</b> {result.studentName}</p>
            <p><b>Student Wallet:</b> {result.student}</p>
            <p><b>Course:</b> {result.courseName}</p>
            <p><b>Issued At:</b> {fmtTs(result.issuedAt)}</p>
            <p><b>Expiry:</b> {Number(result.expiry) === 0 ? "No expiry" : fmtTs(result.expiry)}</p>
          </div>
        );
      })()}

      {/* STUDENT WALLET RESULTS */}
      {mode === "wallet" && certs.length > 0 && (
        <div>
          <h3>Certificates ({certs.length})</h3>
          <ul style={{ display: "grid", gap: 10, listStyle: "none", padding: 0 }}>
            {certs.map((c) => {
              const status = getCertStatus(c);
              return (
                <li
                  key={c.specialId}
                  style={{
                    border: "1px solid var(--border)",
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <b>{c.specialId}</b> — {c.courseName}
                    </div>
                    <div style={{ fontWeight: 700, color: statusColor(status) }}>
                      {status}
                    </div>
                  </div>

                  <div style={{ fontSize: 14, color: "#555", marginTop: 6 }}>
                    Issuer: {c.issuerName} <br />
                    Issued: {fmtTs(c.issuedAt)} <br />
                    Expiry: {Number(c.expiry) === 0 ? "No expiry" : fmtTs(c.expiry)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {mode === "wallet" && !loading && certs.length === 0 && query && (
        <div style={{ color: "#555" }}>
          No certificates found for this wallet.
        </div>
      )}
    </div>
  );
}
