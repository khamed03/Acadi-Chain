import { useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import RoleGate from "../../components/RoleGate";
import { API } from "../../lib/api";

export default function IssuerDashboard() {
  const [studentId, setStudentId] = useState("");
  const [cid, setCid] = useState("");
  const [name, setName] = useState("");
  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [year, setYear] = useState("");

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function onIssue() {
    setMsg(""); setErr("");
    try {
      const r = await API.issueCertificate({
        studentId: studentId.trim(),
        cid: cid.trim(),
        name: name.trim(),
        degree: degree.trim(),
        major: major.trim(),
        year: year.trim()
      });
      setMsg(`${r.message} | CID: ${cid.trim()} | TX: ${r.txHash}`);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <AuthGuard>
      <RoleGate allow={["issuer"]}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          <h2>Issuer Dashboard</h2>

          <div className="card">
            <div className="small">Issue certificate using studentId (student wallet is not required)</div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="col"><input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="studentId (bytes32)" /></div>
              <div className="col"><input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="CID (bafy...)" /></div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="col"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Student Name" /></div>
              <div className="col"><input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Degree" /></div>
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <div className="col"><input value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Major" /></div>
              <div className="col"><input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" /></div>
            </div>
            <button onClick={onIssue} style={{ marginTop: 12 }}>Issue Certificate</button>
          </div>

          {msg && <div className="alert success">{msg}</div>}
          {err && <div className="alert danger">{err}</div>}
        </div>
      </RoleGate>
    </AuthGuard>
  );
}
