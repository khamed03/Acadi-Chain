import { useState } from "react";
import AuthGuard from "../../components/AuthGuard.jsx";
import RequireRole from "../../components/RequireRole.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { API } from "../../lib/api.js";
import { useAuth } from "../../store/auth.js";

export default function VerifierDashboard() {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function onLookup() {
    setLoading(true);
    setSuccessMsg("");
    setResult(null);
    try {
      const isTx = query.startsWith("0x") && query.length > 40;
      const data = isTx ? await API.lookupByTx(query) : await API.lookupByCid(query);
      setResult(data);
    } catch (e) {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  async function onVerify() {
    if (!result) return;
    const updated = await API.adminVerifyCertificate(result.cid, token);
    setResult(updated);
    setSuccessMsg(`The certificate with CID '${updated.cid}' verified successfully.`);
  }

  return (
    <AuthGuard>
      <RequireRole allow={["verifier"]}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1>Verifier Dashboard</h1>
          <Input placeholder="Enter CID or TX hash" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button onClick={onLookup} disabled={loading}>
            {loading ? "Verifying…" : "Verify"}
          </Button>
          {successMsg && <div style={{ color: "#22c55e" }}>{successMsg}</div>}
          {result && (
            <div>
              <p><b>Status:</b> {result.valid ? "Verified" : "Pending"}</p>
              <p><b>Name:</b> {result.name}</p>
              <p><b>Degree:</b> {result.degree}</p>
              {/* Additional fields... */}
              {!result.valid && (
                <Button onClick={onVerify}>Approve & Verify</Button>
              )}
            </div>
          )}
        </div>
      </RequireRole>
    </AuthGuard>
  );
}
