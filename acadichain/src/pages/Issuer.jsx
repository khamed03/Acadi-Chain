import { useState } from "react";
import AuthGuard from "../components/AuthGuard.jsx";
import RoleGate from "../components/RoleGate.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import s from "../styles/form.module.css";
import { useAuth } from "../store/auth.js";

import { issueCertificateWithMetaMask, addStudentWithMetaMask } from "../lib/web3.js";

function isEthAddress(v) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(v || "").trim());
}

/**
 * STRICT format: DD/MM/YYYY
 * - auto inserts "/"
 * - allows only digits and "/"
 * - validates real dates (including leap years)
 */
const DDMMYYYY_REGEX =
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

function formatAsDDMMYYYY(raw) {
  let v = String(raw || "").replace(/[^\d]/g, "");
  if (v.length > 8) v = v.slice(0, 8);

  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length >= 6) v = v.slice(0, 5) + "/" + v.slice(5);

  return v;
}

function isValidDDMMYYYY(dateStr) {
  if (!DDMMYYYY_REGEX.test(String(dateStr || "").trim())) return false;
  const [dd, mm, yyyy] = String(dateStr).split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd
  );
}

function ddmmyyyyToExpiryUnix(dateStr) {
  const s = String(dateStr || "").trim();
  if (!s) return 0; // no expiry

  if (!isValidDDMMYYYY(s)) {
    throw new Error("Expiry must be a real date in DD/MM/YYYY (e.g., 25/06/2030).");
  }

  // end-of-day UTC
  const [dd, mm, yyyy] = s.split("/").map(Number);
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd, 23, 59, 59));
  return Math.floor(dt.getTime() / 1000);
}

export default function Issuer() {
  const { token } = useAuth(); // kept for your AuthGuard/RoleGate flow
  const [form, setForm] = useState({
    studentAddress: "",
    name: "",
    degree: "",
    major: "",
    expiryDate: "", // ✅ DD/MM/YYYY instead of year
  });

  const [status, setStatus] = useState("");
  // const [studentReg, setStudentReg] = useState("");
  // const [studentRegStatus, setStudentRegStatus] = useState("");

  const [expiryError, setExpiryError] = useState("");

  // async function onAddStudent() {
  //   setStudentRegStatus("");
  //   if (!token) {
  //     setStudentRegStatus("Error: Not authenticated.");
  //     return;
  //   }
  //   if (!isEthAddress(studentReg)) {
  //     setStudentRegStatus("Error: Invalid student wallet address (must be 0x...).");
  //     return;
  //   }
  //   try {
  //     setStudentRegStatus("Opening MetaMask to add student role…");
  //     const res = await addStudentWithMetaMask(studentReg.trim());
  //     setStudentRegStatus(`Student registered on-chain ✅ tx: ${res.txHash}`);
  //   } catch (err) {
  //     setStudentRegStatus(`Error: ${err?.message || "Failed to add student."}`);
  //   }
  // }

  function onExpiryChange(e) {
    const raw = e.target.value;

    // constraint: only digits and "/"
    if (!/^[0-9/]*$/.test(raw)) return;

    const formatted = formatAsDDMMYYYY(raw);
    setForm((prev) => ({ ...prev, expiryDate: formatted }));

    if (formatted.length === 10) {
      if (!isValidDDMMYYYY(formatted)) {
        setExpiryError("Invalid date. Use DD/MM/YYYY (e.g., 25/06/2030).");
      } else {
        setExpiryError("");
      }
    } else {
      setExpiryError("");
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("");

    if (!token) {
      setStatus("Error: Not authenticated.");
      return;
    }

    if (!isEthAddress(form.studentAddress)) {
      setStatus("Error: Invalid student wallet address (must be 0x...).");
      return;
    }

    if (!form.name?.trim()) {
      setStatus("Error: Student name is required.");
      return;
    }

    // if user typed something, it must be valid
    if (form.expiryDate?.trim() && !isValidDDMMYYYY(form.expiryDate.trim())) {
      setExpiryError("Invalid date. Use DD/MM/YYYY (e.g., 25/06/2030).");
      return;
    }

    // issueCertificate(issuerName, studentName, student, courseName, expiry)
    const issuerName = import.meta.env.VITE_ISSUER_NAME || "Acadi-chain Issuer";

    const studentName = form.name.trim();

    const courseName =
      [form.degree, form.major]
        .map((x) => String(x || "").trim())
        .filter(Boolean)
        .join(" - ") || "Certificate";

    let expiry = 0;
    try {
      expiry = ddmmyyyyToExpiryUnix(form.expiryDate);
    } catch (err) {
      setExpiryError(err?.message || "Invalid expiry date.");
      return;
    }

    try {
      setStatus("Opening MetaMask to issue on-chain…");

      const res = await issueCertificateWithMetaMask({
        issuerName,
        studentName,
        studentAddress: form.studentAddress.trim(),
        courseName,
        expiry,
      });

      setStatus(`Issued on-chain ✅ specialId: ${res.specialId} | tx: ${res.txHash}`);
    } catch (err) {
      setStatus(`Error: ${err?.message || "Failed to issue certificate."}`);
    }
  }

  return (
    <AuthGuard>
      <RoleGate allow={["issuer"]}>
        <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 16 }}>
          Issuer Console
        </h1>

        {/* Student invite / registration */}
        {/* <div
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 640,
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "#fff",
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 700 }}>Invite / Register Student Wallet</div>
          <div className={s.label}>Student Wallet Address</div>
          <Input
            value={studentReg}
            onChange={(e) => setStudentReg(e.target.value)}
            placeholder="0x…"
          />
          <Button type="button" onClick={onAddStudent}>
            Add Student (MetaMask)
          </Button>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            This will call <code>addStudent(studentWallet)</code> on-chain. Your connected wallet
            must have the Issuer role.
          </p>
          {studentRegStatus && (
            <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
              {studentRegStatus}
            </p>
          )}
        </div> */}

        <form
          onSubmit={onSubmit}
          style={{
            display: "grid",
            gap: 12,
            maxWidth: 640,
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "#fff",
          }}
        >
          <div>
            <div className={s.label}>Student Wallet Address</div>
            <Input
              value={form.studentAddress}
              onChange={(e) => setForm({ ...form, studentAddress: e.target.value })}
              placeholder="0x…"
            />
          </div>

          <div className={s.row2}>
            <div>
              <div className={s.label}>Student Name</div>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div>
              <div className={s.label}>Expiry Date (optional)</div>
              <Input
                value={form.expiryDate}
                onChange={onExpiryChange}
                placeholder="DD/MM/YYYY"
                maxLength={10}
                inputMode="numeric"
              />
              {expiryError ? (
                <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>
                  {expiryError}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
                  Format: <b>DD/MM/YYYY</b> (e.g., 25/06/2030). Leave empty for no expiry.
                </div>
              )}
            </div>
          </div>

          <div className={s.row2}>
            <div>
              <div className={s.label}>Degree</div>
              <Input
                value={form.degree}
                onChange={(e) => setForm({ ...form, degree: e.target.value })}
                placeholder="B.Sc., M.Sc., …"
              />
            </div>
            <div>
              <div className={s.label}>Major</div>
              <Input
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" disabled={!!expiryError}>
            Issue Certificate (MetaMask)
          </Button>

          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>
            Note: On-chain issuing is done by MetaMask (no private keys stored in backend).
          </p>

          {status && <p style={{ fontSize: 14, color: "var(--muted)" }}>{status}</p>}
        </form>
      </RoleGate>
    </AuthGuard>
  );
}
