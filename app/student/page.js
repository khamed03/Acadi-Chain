"use client";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import RoleGate from "@/components/RoleGate";

export default function StudentWallet(){
  const [certs] = useState([]); // TODO: fetch from API by connected address
  return (
    <AuthGuard>
      <RoleGate allow={["student"]}>
        <h1 style={{ fontSize:24, fontWeight:600, marginBottom:16 }}>My Certificates</h1>
        {certs.length === 0 ? (
          <div style={{ fontSize:14, color:"var(--muted)" }}>No certificates yet.</div>
        ) : (
          <ul style={{ display:"grid", gap:12 }}>
            {certs.map((c) => (
              <li key={c.cid} style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff" }}>
                {c.name} — {c.degree} <a style={{ textDecoration:"underline" }} href={`/cert/${c.cid}`}>View</a>
              </li>
            ))}
          </ul>
        )}
      </RoleGate>
    </AuthGuard>
  );
}
