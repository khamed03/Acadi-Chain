import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/auth";

export default function SignIn() {
  const [role, setRole] = useState("student");
  const [studentId, setStudentId] = useState("");
  const { setAuth } = useAuth();
  const nav = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    setAuth({ role, studentId: role === "student" ? studentId.trim() : "" });
    nav("/dashboard");
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: "30px auto" }}>
        <h2 style={{ marginTop: 0 }}>Sign in (Demo)</h2>
        <p className="small">
          This is a frontend sign-in (until full auth). Select your role to test dashboards + integration.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <label className="small">Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="issuer">Issuer</option>
            <option value="verifier">Verifier</option>
            <option value="student">Student</option>
          </select>

          {role === "student" && (
            <>
              <label className="small">StudentId (bytes32)</label>
              <input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="0x... (66 chars)"
              />
              <div className="small">
                Student dashboard needs studentId to fetch certificates and claim wallet.
              </div>
            </>
          )}

          <button type="submit">Enter</button>
        </form>
      </div>
    </div>
  );
}
