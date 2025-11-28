// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import AuthGuard from "../components/AuthGuard.jsx";
import RoleGate from "../components/RoleGate.jsx";
import { useAuth } from "../store/auth.js";
import { shorten } from "../lib/utils.js";

function Tile({ title, description, to, cta = "Open", footer }) {
  return (
    <div style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff", display:"grid", gap:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h2 style={{ fontSize:18, fontWeight:600, margin:0 }}>{title}</h2>
        {to && <Link to={to} style={{ textDecoration:"underline" }}>{cta} →</Link>}
      </div>
      {description && <p style={{ margin:0, color:"var(--muted)", fontSize:14 }}>{description}</p>}
      {footer}
    </div>
  );
}

export default function Dashboard() {
  const { address, role } = useAuth();

  return (
    <AuthGuard>
      <div style={{ display:"grid", gap:16 }}>
        <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:700, margin:"0 0 4px" }}>Dashboard</h1>
            <div style={{ fontSize:14, color:"var(--muted)" }}>
              Signed in as <b>{role || "unknown"}</b>
              {address && <> • {shorten(address)}</>}
            </div>
          </div>
          <div style={{ fontSize:12, color:"var(--muted)" }}>
            Tip: change role on the Sign-In page to see different panels.
          </div>
        </header>

        {/* Common quick actions (visible to all roles) */}
        <section style={{ display:"grid", gap:12 }}>
          <div style={{ display:"grid", gap:12, gridTemplateColumns:"1fr", alignItems:"stretch" }}>
            <Tile
              title="Verify a certificate"
              description="Check a certificate by IPFS CID or transaction hash."
              to="/verify"
              cta="Verify"
            />

            <Tile
              title="View a certificate by CID"
              description="If you already know the CID, jump straight to the details page."
              footer={
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget);
                    const cid = String(form.get("cid") || "").trim();
                    if (cid) window.location.href = `/cert/${cid}`;
                  }}
                  style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}
                >
                  <input
                    name="cid"
                    placeholder="bafy... (IPFS CID)"
                    style={{ flex:"1 1 320px", padding:"10px 12px", border:"1px solid var(--border)", borderRadius:12 }}
                  />
                  <button type="submit" style={{ height:44, padding:"0 14px", borderRadius:12, border:"1px solid var(--border)", background:"var(--primary)", color:"#fff", fontWeight:600, cursor:"pointer" }}>
                    Open
                  </button>
                </form>
              }
            />
          </div>
        </section>

        {/* Issuer-only */}
        <RoleGate allow={["issuer"]}>
          <section style={{ display:"grid", gap:12 }}>
            <h3 style={{ fontSize:16, fontWeight:600, margin:"8px 0" }}>Issuer</h3>

            <Tile
              title="Issue new certificate"
              description="Create and publish a certificate to IPFS and your contract."
              to="/issuer"
              cta="Issue"
            />

            <Tile
              title="Recent issuance activity"
              description="(Coming soon) See your last transactions and CIDs."
              footer={
                <ul style={{ margin:0, paddingLeft:18, color:"var(--muted)", fontSize:14 }}>
                  <li>TX 0x… — Pending</li>
                  <li>TX 0x… — Confirmed</li>
                </ul>
              }
            />
          </section>
        </RoleGate>

        {/* Student-only */}
        <RoleGate allow={["student"]}>
          <section style={{ display:"grid", gap:12 }}>
            <h3 style={{ fontSize:16, fontWeight:600, margin:"8px 0" }}>Student</h3>

            <Tile
              title="My Certificates"
              description="Browse and share the certificates linked to your wallet."
              to="/student"
              cta="Open"
            />

            <Tile
              title="Share profile"
              description="(Coming soon) Generate a public link with selected certificates."
            />
          </section>
        </RoleGate>

        {/* Verifier-only */}
        <RoleGate allow={["verifier"]}>
          <section style={{ display:"grid", gap:12 }}>
            <h3 style={{ fontSize:16, fontWeight:600, margin:"8px 0" }}>Verifier</h3>

            <Tile
              title="Lookup by CID/Tx"
              description="Enter a CID or transaction hash to verify authenticity."
              to="/verify"
              cta="Lookup"
            />

            <Tile
              title="Verification history"
              description="(Coming soon) See your recent checks and export logs."
            />
          </section>
        </RoleGate>
      </div>
    </AuthGuard>
  );
}
