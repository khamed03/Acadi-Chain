export default function Empty({ children = "Nothing here yet." }) {
  return (
    <div style={{
      border:"1px dashed var(--border)",
      background:"#fff",
      borderRadius:16,
      padding:16,
      color:"var(--muted)",
      fontSize:14
    }}>
      {children}
    </div>
  );
}
