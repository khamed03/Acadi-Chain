"use client";
import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { API } from "@/lib/api";

export default function VerifyPage(){
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function onLookup(){
    setError("");
    try {
      const isTx = query.startsWith("0x") && query.length > 40;
      const data = isTx ? await API.lookupByTx(query) : await API.lookupByCid(query);
      setResult(data);
    } catch (e){ setError(e.message); }
  }

  return (
    <div style={{ maxWidth:720, display:"grid", gap:12 }}>
      <h1 style={{ fontSize:24, fontWeight:600 }}>Verify Certificate</h1>
      <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Enter IPFS CID or transaction hash" />
      <Button onClick={onLookup}>Lookup</Button>
      {error && <p style={{ fontSize:14, color:"#b91c1c" }}>{error}</p>}
      {result && (
        <div style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff", fontSize:14 }}>
          <div><b>Status:</b> {result.valid ? "Valid" : "Invalid"}</div>
          <div><b>Name:</b> {result.name}</div>
          <div><b>Degree:</b> {result.degree}</div>
          <div><b>Major:</b> {result.major}</div>
          <div><b>Year:</b> {result.year}</div>
          <div><b>Issuer:</b> {result.issuer}</div>
          <div><b>CID:</b> {result.cid}</div>
          <div><b>Tx:</b> {result.tx}</div>
        </div>
      )}
    </div>
  );
}
