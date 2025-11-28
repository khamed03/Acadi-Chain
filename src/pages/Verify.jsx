// src/pages/Verify.jsx
import { useState } from "react";
import AuthGuard from "../components/AuthGuard.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { useAuth } from "../store/auth.js";
import { API } from "../lib/api.js";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

export default function VerifyPage() {
  const { token } = useAuth();
  const [mode, setMode] = useState("cid"); // "cid" or "tx"
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  async function onVerifyLookup() {
    try {
      setLoading(true);
      setError("");
      setSuccessMsg("");
      setResult(null);

      const q = query.trim();
      if (!q) {
        setError("Please enter a CID or TX hash.");
        return;
      }

      if (mode === "cid") {
        const data = await API.lookupByCid(q);
        setResult(data);
      } else {
        const data = await API.lookupByTx(q);
        setResult(data);
      }
    } catch (e) {
      setError(e.message || "Verification lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onAdminVerify() {
    if (!result || !result.cid) return;
    try {
      setApproveLoading(true);
      setError("");
      setSuccessMsg("");

      const updated = await API.adminVerifyCertificate(result.cid, token);
      setResult(updated);

      setSuccessMsg(
        `The certificate with CID '${updated.cid}' verified successfully.`
      );
    } catch (e) {
      setError(e.message || "Failed to verify certificate.");
    } finally {
      setApproveLoading(false);
    }
  }

  return (
    <AuthGuard>
      <RequireRole allow={["verifier"]}>
        <div
          style={{
            maxWidth: 720,
            margin: "32px auto",
            display: "grid",
            gap: 20,
          }}
        >
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Verify Certificate</h1>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Look up a certificate by its <b>CID</b> or <b>transaction hash</b>,
            review the data, and then mark it as verified if everything is
            correct.
          </p>

          {/* Mode switch */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              onClick={() => {
                setMode("cid");
                setResult(null);
                setError("");
                setSuccessMsg("");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: mode === "cid" ? "var(--primary)" : "#fff",
                color: mode === "cid" ? "#fff" : "var(--text)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Search by CID
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("tx");
                setResult(null);
                setError("");
                setSuccessMsg("");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: mode === "tx" ? "var(--primary)" : "#fff",
                color: mode === "tx" ? "#fff" : "var(--text)",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Search by TX hash
            </button>
          </div>

          {/* Search box */}
          <div
            style={{
              border: "1px solid var(--border)",
              padding: 16,
              borderRadius: 16,
              background: "#fff",
              display: "grid",
              gap: 12,
            }}
          >
            <label style={{ fontSize: 14, color: "var(--muted)" }}>
              {mode === "cid" ? "Certificate CID" : "Transaction hash"}
            </label>
            <Input
              placeholder={mode === "cid" ? "bafy..." : "0x..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <Button onClick={onVerifyLookup} disabled={loading}>
              {loading ? "Looking up…" : "Lookup certificate"}
            </Button>

            {error && (
              <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div>
            )}
          </div>

          {/* Success bar after admin verify */}
          {successMsg && (
            <div
              style={{
                borderRadius: 12,
                border: "1px solid #22c55e",
                background: "#dcfce7",
                padding: 10,
                fontSize: 14,
                color: "#14532d",
              }}
            >
              {successMsg}
            </div>
          )}

          {/* Result card */}
          {result && (
            <div
              style={{
                border: "1px solid var(--border)",
                padding: 16,
                borderRadius: 16,
                background: "#fff",
                display: "grid",
                gap: 6,
                fontSize: 14,
              }}
            >
              <div>
                <b>Status:</b>{" "}
                {result.valid ? (
                  <span style={{ color: "#16a34a" }}>Verified</span>
                ) : (
                  <span style={{ color: "#b45309" }}>Pending verification</span>
                )}
              </div>
              <div>
                <b>Name:</b> {result.name}
              </div>
              <div>
                <b>Degree:</b> {result.degree}
              </div>
              <div>
                <b>Major:</b> {result.major}
              </div>
              <div>
                <b>Year:</b> {result.year}
              </div>
              <div>
                <b>Issuer:</b> {result.issuer}
              </div>
              <div>
                <b>Owned by:</b> {result.studentAddress || "N/A"}
              </div>
              <div style={{ marginTop: 6 }}>
                <b>CID:</b> {result.cid}
              </div>
              <div>
                <b>Transaction:</b> {result.tx}
              </div>

              {/* Admin verify button – only if not yet valid */}
              {!result.valid && (
                <div style={{ marginTop: 12 }}>
                  <Button onClick={onAdminVerify} disabled={approveLoading}>
                    {approveLoading
                      ? "Verifying certificate…"
                      : "Verify certificate"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </RequireRole>
    </AuthGuard>
  );
}
