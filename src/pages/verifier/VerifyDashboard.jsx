import { useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import RoleGate from "../../components/RoleGate";
import { API, normalizeCert } from "../../lib/api";

export default function VerifyDashboard() {
  const [cid, setCid] = useState("");
  const [cert, setCert] = useState(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onLookup() {
    setMsg(""); setErr(""); setCert(null);
    try {
      const r = await API.getCertificate(cid.trim());
      setCert(normalizeCert(r.certificate));
    } catch (e) {
      setErr(e.message);
    }
  }

  async function onVerify() {
    setMsg(""); setErr("");
    try {
      const r = await API.verifyCertificate(cid.trim());
      setMsg(`Verified successfully. TX: ${r.txHash}`);
      await onLookup();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <AuthGuard>
      <RoleGate allow={["verifier", "admin"]}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          <h2>Verifier Dashboard</h2>

          <div className="card">
            <div className="row">
              <div className="col">
                <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="Enter certificate CID" />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={onLookup}>Lookup</button>
                <button onClick={onVerify}>Verify</button>
              </div>
            </div>

            {cert && (
              <div style={{ marginTop: 12 }}>
                <div><b>Status:</b> {cert.revoked ? "Revoked" : cert.verified ? "Verified" : "Pending"}</div>
                <div><b>Name:</b> {cert.name}</div>
                <div><b>Degree:</b> {cert.degree}</div>
                <div><b>Major:</b> {cert.major}</div>
                <div><b>Year:</b> {cert.year}</div>
                <div style={{ wordBreak: "break-all" }}><b>studentId:</b> {cert.studentId}</div>
              </div>
            )}
          </div>

          {msg && <div className="alert success">{msg}</div>}
          {err && <div className="alert danger">{err}</div>}
        </div>
      </RoleGate>
    </AuthGuard>
  );
}
