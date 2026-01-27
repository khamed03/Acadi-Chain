export default function Section({ title, children }) {
  return (
    <section style={{ display:"grid", gap:12 }}>
      {title && <h3 style={{ fontSize:16, fontWeight:600, margin:"8px 0" }}>{title}</h3>}
      {children}
    </section>
  );
}
