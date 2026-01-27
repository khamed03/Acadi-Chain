// src/pages/Dashboard.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

import AuthGuard from "../components/AuthGuard.jsx";
import RoleGate from "../components/RoleGate.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";

import { useAuth } from "../store/auth.js";
import { shorten } from "../lib/utils.js";
import { addIssuerWithMetaMask } from "../lib/web3.js";

function Tile({ title, description, to, cta = "Open", footer }) {
  return (
    <div
      style={{
        padding: 16,
        border: "1px solid var(--border)",
        borderRadius: 16,
        background: "#fff",
        display: "grid",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{title}</h2>
        {to && (
          <Link to={to} style={{ textDecoration: "underline" }}>
            {cta} →
          </Link>
        )}
      </div>
      {description && (
        <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
          {description}
        </p>
      )}
      {footer}
    </div>
  );
}

function isEthAddress(v) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(v || "").trim());
}

export default function Dashboard() {
  const { address, role } = useAuth();

  // Admin (verifier) -> create issuer
  const [issuerWallet, setIssuerWallet] = useState("");
  const [issuerStatus, setIssuerStatus] = useState("");

  async function onAddIssuer() {
    setIssuerStatus("");
    const addr = String(issuerWallet || "").trim();

    if (!isEthAddress(addr)) {
      setIssuerStatus("Error: invalid issuer wallet address (must be 0x...).");
      return;
    }

    try {
      setIssuerStatus("Opening MetaMask to add issuer role…");
      const res = await addIssuerWithMetaMask(addr);
      setIssuerStatus(`Issuer added on-chain ✅ tx: ${res.txHash}`);
      setIssuerWallet("");
    } catch (e) {
      setIssuerStatus(`Error: ${e?.message || "Failed to add issuer."}`);
    }
  }

  return (
    <AuthGuard>
      <div style={{ display: "grid", gap: 16 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
              Dashboard
            </h1>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              Signed in as <b>{role || "unknown"}</b>
              {address && <> • {shorten(address)}</>}
            </div>
          </div>
        </header>


        {/* Issuer-only */}
        <RoleGate allow={["issuer"]}>
          <section style={{ display: "grid", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "8px 0" }}>
              Issuer
            </h3>

            <Tile
              title="Issue new certificate"
              description="Issue certificates on-chain."
              to="/issuer"
              cta="Issue"
            />
          </section>
        </RoleGate>

        {/* Student-only */}
        <RoleGate allow={["student"]}>
          <section style={{ display: "grid", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "8px 0" }}>
              Student
            </h3>

            <Tile
              title="My Certificates"
              description="Browse certificates linked to your wallet."
              to="/student"
              cta="Open"
            />
          </section>
        </RoleGate>

        {/* Verifier/Admin-only */}
        <RoleGate allow={["verifier"]}>
          <section style={{ display: "grid", gap: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: "8px 0" }}>
              Admin (Verifier)
            </h3>

            {/* ✅ Create / Approve Issuer */}
            <Tile
              title="Create Issuer"
              description="Add an issuer wallet on-chain (grant ISSUER_ROLE)."
              footer={
                <div style={{ display: "grid", gap: 10 }}>
                  <Input
                    placeholder="Issuer wallet address (0x...)"
                    value={issuerWallet}
                    onChange={(e) => setIssuerWallet(e.target.value)}
                  />
                  <Button onClick={onAddIssuer}>Add Issuer (MetaMask)</Button>
                  {issuerStatus && (
                    <div style={{ fontSize: 14, color: "var(--muted)" }}>
                      {issuerStatus}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>
                    This calls <code>addIssuer(issuerWallet)</code> on the contract.
                    Make sure your connected wallet is the contract admin.
                  </div>
                </div>
              }
            />

            {/* Existing verifier quick action */}
            <Tile
              title="Lookup by CID/Tx"
              description="Enter a CID or transaction hash to verify authenticity."
              to="/verify"
              cta="Lookup"
            />
          </section>
        </RoleGate>
      </div>
    </AuthGuard>
  );
}
