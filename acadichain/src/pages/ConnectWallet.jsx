import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { shorten } from "../lib/utils.js";
import { useAuth } from "../store/auth.js";

export default function ConnectWallet() {
  const navigate = useNavigate();
  const { role, address, login, token } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  const hasEthereum = typeof window !== "undefined" && !!window.ethereum;

  async function connect() {
    try {
      setError(""); setConnecting(true);
      if (!hasEthereum) throw new Error("MetaMask not detected.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts?.[0] || "";
      if (!acc) throw new Error("No account selected.");
      // store same token/role, but now with address
      login({ token, role, address: acc });
      navigate("/student");
    } catch (e) {
      setError(e.message || "Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  }

  // helloooooo

  return (
    <div style={{ maxWidth:640, margin:"40px auto", display:"grid", gap:16 }}>
      <h1 style={{ fontSize:24, fontWeight:700, margin:0 }}>Connect your wallet</h1>
      <p style={{ color:"var(--muted)" }}>
        You’re signed in as <b>{role || "student"}</b>. To access your Student page, please connect your wallet.
      </p>

      <div style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff", display:"grid", gap:12 }}>
        <div>Current wallet: {address ? shorten(address) : <i>not connected</i>}</div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
          <Button variant="secondary" onClick={connect} disabled={connecting}>
            {address ? "Reconnect" : connecting ? "Connecting…" : "Connect MetaMask"}
          </Button>
          {address && (
            <Button onClick={() => navigate("/student")}>
              Continue
            </Button>
          )}
        </div>
        {!hasEthereum && <div style={{ color:"#b91c1c", fontSize:14 }}>MetaMask not found. Install it to continue.</div>}
        {error && <div style={{ color:"#b91c1c", fontSize:14 }}>{error}</div>}
      </div>
    </div>
  );
}
