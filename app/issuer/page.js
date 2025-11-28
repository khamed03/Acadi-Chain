"use client";
import { useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import RoleGate from "@/components/RoleGate";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import s from "@/styles/form.module.css";
import { API } from "@/lib/api";
import { useAuth } from "@/store/auth";

export default function IssuerPage(){
  const { token } = useAuth();
  const [form, setForm] = useState({ studentAddress:"", name:"", degree:"", major:"", year:"" });
  const [status, setStatus] = useState("");

  async function onSubmit(e){
    e.preventDefault();
    setStatus("Uploading to IPFS & issuing…");
    const ipfsCid = `bafy-demo-${Date.now()}`;
    try {
      const res = await API.issueCertificate({ ...form, ipfsCid }, token || undefined);
      setStatus(`Issued! tx: ${res.tx}`);
    } catch (err){ setStatus(`Error: ${err.message}`); }
  }

  return (
    <AuthGuard>
      <RoleGate allow={["issuer"]}>
        <h1 style={{ fontSize:24, fontWeight:600, marginBottom:16 }}>Issuer Console</h1>
        <form onSubmit={onSubmit} style={{ display:"grid", gap:12, maxWidth:640, padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff" }}>
          <div><div className={s.label}>Student Wallet Address</div><Input value={form.studentAddress} onChange={e=>setForm({ ...form, studentAddress:e.target.value })} placeholder="0x…" /></div>
          <div className={s.row2}>
            <div><div className={s.label}>Student Name</div><Input value={form.name} onChange={e=>setForm({ ...form, name:e.target.value })} /></div>
            <div><div className={s.label}>Year</div><Input value={form.year} onChange={e=>setForm({ ...form, year:e.target.value })} /></div>
          </div>
          <div className={s.row2}>
            <div><div className={s.label}>Degree</div><Input value={form.degree} onChange={e=>setForm({ ...form, degree:e.target.value })} placeholder="B.Sc., M.Sc., …" /></div>
            <div><div className={s.label}>Major</div><Input value={form.major} onChange={e=>setForm({ ...form, major:e.target.value })} /></div>
          </div>
          <Button type="submit">Issue Certificate</Button>
          {status && <p style={{ fontSize:14, color:"var(--muted)" }}>{status}</p>}
        </form>
      </RoleGate>
    </AuthGuard>
  );
}
