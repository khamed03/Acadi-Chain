import React from "react";
export default function Button({ variant = "primary", full, style, ...rest }) {
  const base = { height: 44, padding: "0 14px", borderRadius: 12, border: "1px solid var(--border)", cursor:"pointer", fontWeight:600 };
  const styles = { primary: { background: "var(--primary)", color: "#fff" }, secondary: { background: "#fff", color: "var(--text)" } };
  return <button {...rest} style={{ ...base, ...(styles[variant]||{}), width: full? "100%": undefined, ...(style||{}) }} />;
}
