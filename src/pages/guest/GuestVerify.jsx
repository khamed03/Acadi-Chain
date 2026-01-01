import { useState } from "react";
import { API, normalizeCert } from "../../lib/api";

export default function GuestVerify() {
  const [cid, setCid] = useState("");
  const [cert, setCert] = useState(null);
  const [err, setErr] = useState("");

  async function onLookup() {
    setErr(""); setCert(null);
    try {
      const r = await API.verifyByCid(cid.trim());
      setCert(normalizeCert(r.certificate));
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div className="container" style={{ display: "grid", gap: 14 }}>
      <h2>Guest Verification</h2>

      <div className="card">
        <div className="row">
          <div className="col">
            <input value={cid} onChange={(e) => setCid(e.target.value)} placeholder="Enter certificate CID" />
          </div>
          <button onClick={onLookup}>Search</button>
        </div>

        {cert && (
          <div style={{ marginTop: 12 }}>
            <div><b>Status:</b> {cert.revoked ? "Revoked" : cert.verified ? "Verified" : "Pending"}</div>
            <div><b>Name:</b> {cert.name}</div>
            <div><b>Degree:</b> {cert.degree}</div>
            <div><b>Major:</b> {cert.major}</div>
            <div><b>Year:</b> {cert.year}</div>
          </div>
        )}

        {err && <div className="alert danger" style={{ marginTop: 12 }}>{err}</div>}
      </div>
    </div>
  );
}
