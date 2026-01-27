import { useAuth } from "../store/auth.js";
export default function RoleGate({ allow, children }){
  const { role } = useAuth();
  if (!role || !allow.includes(role)) return;
  return <>{children}</>;
}
