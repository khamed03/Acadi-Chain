"use client";
import AuthGuard from "@/components/AuthGuard";
import RoleGate from "@/components/RoleGate";
import Link from "next/link";

export default function Dashboard(){
  return (
    <AuthGuard>
      <div style={{ display:"grid", gap:16 }}>
        <h1 style={{ fontSize:24, fontWeight:600 }}>Dashboard</h1>
        <RoleGate allow={["issuer"]}>
          <div style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff" }}>
            <h2 style={{ fontWeight:600 }}>Issuer</h2>
            <p style={{ fontSize:14, color:"var(--muted)" }}>Create and publish certificates.</p>
            <Link href="/issuer" style={{ textDecoration:"underline" }}>Go to Issuer Console →</Link>
          </div>
        </RoleGate>
      </div>
    </AuthGuard>
  );
}
