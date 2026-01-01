import { useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import RoleGate from "../../components/RoleGate";
import { API } from "../../lib/api";

export default function AdminDashboard() {
  const [issuer, setIssuer] = useState("");
  const [studentId, setStudentId] = useState("");
  const [wallet, setWallet] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function run(fn) {
    setMsg(""); setErr("");
    try {
      const r = await fn();
      setMsg(r.message + (r.txHash ? ` | TX: ${r.txHash}` : ""));
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <AuthGuard>
      <RoleGate allow={["admin"]}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          <h2>Admin Dashboard</h2>

          <div className="row">
            <div className="card col">
              <h3 style={{ marginTop: 0 }}>Add Issuer</h3>
              <input value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="0xIssuerAddress" />
              <button onClick={() => run(() => API.addIssuer(issuer.trim()))} style={{ marginTop: 10 }}>
                Add Issuer
              </button>
            </div>

            <div className="card col">
              <h3 style={{ marginTop: 0 }}>Register Student</h3>
              <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="studentId (bytes32 0x...)" />
              <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="optional wallet (0x...) or leave empty" style={{ marginTop: 10 }} />
              <button onClick={() => run(() => API.registerStudent(studentId.trim(), wallet.trim()))} style={{ marginTop: 10 }}>
                Register Student
              </button>
            </div>
          </div>

          {msg && <div className="alert success">{msg}</div>}
          {err && <div className="alert danger">{err}</div>}
        </div>
      </RoleGate>
    </AuthGuard>
  );
}
