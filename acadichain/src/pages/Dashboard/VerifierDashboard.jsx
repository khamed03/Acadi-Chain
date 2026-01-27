import { useState } from "react";
import AuthGuard from "../../components/AuthGuard.jsx";
import RequireRole from "../../components/RequireRole.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import { API } from "../../lib/api.js";
import { useAuth } from "../../store/auth.js";
import { addIssuerWithMetaMask } from "../../lib/web3.js";

export default function VerifierDashboard() {
  const { token } = useAuth();
  const [newIssuer, setNewIssuer] = useState("");
  const [issuerStatus, setIssuerStatus] = useState("");
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

  async function onAddIssuer() {
    setIssuerStatus("");
    const addr = String(newIssuer || "").trim();
    const isEth = /^0x[a-fA-F0-9]{40}$/.test(addr);
    if (!isEth) {
      setIssuerStatus("Error: invalid issuer wallet address (must be 0x...).");
      return;
    }
    try {
      setIssuerStatus("Opening MetaMask to add issuer role…");
      const res = await addIssuerWithMetaMask(addr);
      setIssuerStatus(`Issuer added on-chain ✅ tx: ${res.txHash}`);
    } catch (e) {
      setIssuerStatus(`Error: ${e?.message || "Failed to add issuer."}`);
    }
  }

  return (
    <AuthGuard>
      <RequireRole allow={["verifier"]}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h1>Verifier Dashboard</h1>

          {/* Admin = verifier in your current frontend roles */}
          <div style={{ margin: "16px 0", padding: 16, border: "1px solid var(--border)", borderRadius: 16, background: "#fff" }}>
            <h2 style={{ marginTop: 0 }}>Issuer Onboarding (Admin Approval)</h2>
            <p style={{ color: "var(--muted)", marginTop: 0 }}>
              After manual review, add the issuer wallet on-chain by calling <code>addIssuer(issuerWallet)</code>.
            </p>
            <Input
              placeholder="Issuer wallet address (0x...)"
              value={newIssuer}
              onChange={(e) => setNewIssuer(e.target.value)}
            />
            <div style={{ height: 8 }} />
            <Button onClick={onAddIssuer}>Approve Issuer (MetaMask)</Button>
            {issuerStatus && <div style={{ marginTop: 8, color: "var(--muted)" }}>{issuerStatus}</div>}
          </div>

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
