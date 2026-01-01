import { useEffect, useState } from "react";
import AuthGuard from "../../components/AuthGuard";
import RoleGate from "../../components/RoleGate";
import { useAuth } from "../../store/auth";
import { API } from "../../lib/api";
import { claimMyWalletOnChain } from "../../lib/web3";

export default function StudentDashboard() {
  const { studentId } = useAuth();
  const [student, setStudent] = useState(null);
  const [cids, setCids] = useState([]);

  const [generated, setGenerated] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function refresh() {
    if (!studentId) return;
    setMsg(""); setErr("");
    try {
      const s = await API.getStudent(studentId);
      const list = await API.getStudentCertificates(studentId);
      setStudent(s.student);
      setCids(list.cids || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [studentId]);

  async function onGenerateWallet() {
    setMsg(""); setErr("");
    try {
      const r = await API.generateWallet();
      // backend returns { wallet: { address, privateKey, mnemonic } }
      setGenerated(r.wallet);
      setMsg("Wallet generated. Save it securely (private key/mnemonic).");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function onClaimWallet() {
    setMsg(""); setErr("");
    try {
      const txHash = await claimMyWalletOnChain(studentId);
      setMsg(`Wallet claimed successfully on-chain. TX: ${txHash}`);
      await refresh();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <AuthGuard>
      <RoleGate allow={["student"]}>
        <div className="container" style={{ display: "grid", gap: 14 }}>
          <h2>Student Dashboard</h2>

          {!studentId && <div className="alert warn">You must sign in as student and provide studentId.</div>}

          <div className="row">
            <div className="card col">
              <h3 style={{ marginTop: 0 }}>My Identity</h3>
              <div className="small">studentId:</div>
              <div style={{ wordBreak: "break-all" }}>{studentId || "-"}</div>
              <div style={{ marginTop: 10 }} className="small">wallet:</div>
              <div style={{ wordBreak: "break-all" }}>
                {student?.[1] || student?.wallet || "(not set yet)"}
              </div>

              <button onClick={onClaimWallet} style={{ marginTop: 12 }}>
                Connect MetaMask & Claim Wallet
              </button>
              <div className="small" style={{ marginTop: 6 }}>
                This sends an on-chain transaction to bind your wallet to your studentId.
              </div>
            </div>

            <div className="card col">
              <h3 style={{ marginTop: 0 }}>No wallet?</h3>
              <div className="small">
                Generate a wallet off-chain (backend). Save the private key/mnemonic.
              </div>
              <button onClick={onGenerateWallet} style={{ marginTop: 12 }}>Generate Wallet</button>

              {generated && (
                <div className="alert warn" style={{ marginTop: 12 }}>
                  <div><b>Address:</b> {generated.address}</div>
                  <div style={{ wordBreak: "break-all" }}><b>Private Key:</b> {generated.privateKey}</div>
                  <div style={{ wordBreak: "break-all" }}><b>Mnemonic:</b> {generated.mnemonic}</div>
                  <div className="small" style={{ marginTop: 8 }}>
                    Store this securely. Do not share it.
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginTop: 0 }}>My Certificates</h3>
            <button onClick={refresh}>Refresh</button>
            <ul>
              {cids.map((c) => (
                <li key={c} style={{ marginTop: 8, wordBreak: "break-all" }}>{c}</li>
              ))}
            </ul>
            {cids.length === 0 && <div className="small">No certificates yet (or student not registered).</div>}
          </div>

          {msg && <div className="alert success">{msg}</div>}
          {err && <div className="alert danger">{err}</div>}
        </div>
      </RoleGate>
    </AuthGuard>
  );
}
