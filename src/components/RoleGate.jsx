import { useAuth } from "../store/auth.js";
export default function RoleGate({ allow, children }){
  const { role } = useAuth();
  if (!role || !allow.includes(role)) return <div style={{ fontSize:14, color:"var(--muted)"}}>Access restricted for role: {role || "unknown"}</div>;
  return <>{children}</>;
}
