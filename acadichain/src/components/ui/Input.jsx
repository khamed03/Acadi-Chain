import React from "react";

export default function Input({
  label,
  error,
  className = "",
  ...props
}) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label ? (
        <label style={{ fontSize: 14, fontWeight: 600 }}>
          {label}
        </label>
      ) : null}

      <input
        {...props}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: error ? "1px solid #ef4444" : "1px solid #d1d5db",
          outline: "none",
          fontSize: 14,
        }}
      />

      {error ? (
        <div style={{ color: "#ef4444", fontSize: 12 }}>
          {error}
        </div>
      ) : null}
    </div>
  );
}
