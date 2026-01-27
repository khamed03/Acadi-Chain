import { useEffect, useState } from "react";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { API } from "../lib/api.js";
import { getCertStatus } from "../lib/utils.js";

function fmtTs(ts) {
  const n = Number(ts);
  if (!Number.isFinite(n) || n <= 0) return "—";
  return new Date(n * 1000).toLocaleString();
}

function statusColor(status) {
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

export default function Verify() {
  const [specialId, setSpecialId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState(null);
  const [verify, setVerify] = useState(null);
  const [err, setErr] = useState("");

  // Optional: re-render every 30s so status can flip Active -> Expired without refresh
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  // Optional: load specialId from query string ?specialId=AC-4
  useEffect(() => {
    const u = new URL(window.location.href);
    const q = u.searchParams.get("specialId");
    if (q) setSpecialId(q);
  }, []);

  async function onCheck() {
    setLoading(true);
    setErr("");
    setCert(null);
    setVerify(null);

    try {
      const id = String(specialId || "").trim();
      if (!id) throw new Error("Enter Certificate ID like AC-4");

      const [c, v] = await Promise.all([
        API.getCertificate(id),
        API.verifyCertificate(id),
      ]);

      setCert(c);
      setVerify(v);
    } catch (e) {
      setErr(e?.message || "Failed to verify");
    } finally {
      setLoading(false);
    }
  }

  const status = cert ? getCertStatus(cert) : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 12 }}>
      <h1>Verify Certificate</h1>

      <Input
        placeholder="Enter Certificate ID (e.g., AC-4)"
        value={specialId}
        onChange={(e) => setSpecialId(e.target.value)}
      />

      <Button onClick={onCheck} disabled={loading}>
        {loading ? "Checking…" : "Verify"}
      </Button>

      {err && <div style={{ color: "#b91c1c" }}>{err}</div>}

      {/* VERIFY RESULT CARD */}
      {verify && (
        <div
          style={{
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "#fff",
          }}
        >
          <div style={{ fontWeight: 800 }}>
            Result: {verify.isValid ? "✅ Valid" : "❌ Invalid"}
          </div>

          {!verify.isValid && (
            <div style={{ color: "var(--muted)", marginTop: 6 }}>
              Reason: {verify.reason || "Unknown"}
            </div>
          )}
        </div>
      )}

      {/* CERTIFICATE CARD (same reading style as Student/Guest) */}
      {cert && (
        <div
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
              alignItems: "center",
            }}
          >
            <div style={{ fontWeight: 800 }}>{cert.specialId}</div>

            {status && (
              <div style={{ fontWeight: 800, color: statusColor(status) }}>
                {status}
              </div>
            )}
          </div>

          <div style={{ marginTop: 8, color: "var(--muted)", fontSize: 14 }}>
            <div>
              <b>Issuer:</b> {cert.issuerName}
            </div>
            <div>
              <b>Student:</b> {cert.studentName}
            </div>
            <div>
              <b>Student Wallet:</b> {cert.student}
            </div>
            <div>
              <b>Course:</b> {cert.courseName}
            </div>
            <div>
              <b>Issued At:</b> {fmtTs(cert.issuedAt)}
            </div>
            <div>
              <b>Expiry:</b>{" "}
              {Number(cert.expiry) === 0 ? "No expiry" : fmtTs(cert.expiry)}
            </div>
          </div>

          {/* optional: keep raw revoked flag for debugging */}
          <div style={{ marginTop: 10, fontSize: 13, color: "var(--muted)" }}>
            <b>On-chain revoked flag:</b> {String(cert.revoked)}
          </div>
        </div>
      )}
    </div>
  );
}
