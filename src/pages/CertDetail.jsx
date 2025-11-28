import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API } from "../lib/api.js";

export default function CertDetail(){
  const { cid } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { API.lookupByCid(cid).then(setData).catch(console.error); }, [cid]);
  if (!data) return <div>Loading…</div>;
  return (
    <div style={{ display:"grid", gap:8 }}>
      <h1 style={{ fontSize:24, fontWeight:600 }}>Certificate</h1>
      <div style={{ padding:16, border:"1px solid var(--border)", borderRadius:16, background:"#fff", fontSize:14 }}>
        <div><b>Name:</b> {data.name}</div>
        <div><b>Degree:</b> {data.degree}</div>
        <div><b>Major:</b> {data.major}</div>
        <div><b>Year:</b> {data.year}</div>
        <div><b>Issuer:</b> {data.issuer}</div>
        <div><b>CID:</b> {data.cid}</div>
        <a style={{ textDecoration:"underline" }} href={`https://ipfs.io/ipfs/${data.cid}`} target="_blank" rel="noreferrer">View IPFS file</a>
      </div>
    </div>
  );
}

