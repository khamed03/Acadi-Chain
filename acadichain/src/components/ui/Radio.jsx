import React from "react";
export function Radio({ checked, onChange, label, description }) {
  return (
    <label style={{ display:"flex", gap:10, alignItems:"flex-start", cursor:"pointer" }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ marginTop:4 }} />
      <div>
        <div style={{ fontWeight:600 }}>{label}</div>
        {description && <div style={{ fontSize:12, color:"var(--muted)" }}>{description}</div>}
      </div>
    </label>
  );
}
