export default function Footer() {
  return (
    <div style={{ padding: 18, borderTop: "1px solid var(--border)", color: "var(--muted)" }}>
      <div className="container">© {new Date().getFullYear()} Acadi-Chain</div>
    </div>
  );
}
