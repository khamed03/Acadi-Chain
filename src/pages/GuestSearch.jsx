// src/pages/GuestSearch.jsx
import { useEffect, useState } from "react";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import { API } from "../lib/api.js";

const MODES = {
  CERT: "certificate",
  STUDENT: "student",
};

export default function GuestSearch() {
  const [mode, setMode] = useState(MODES.CERT);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [list, setList] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // NEW: pending certificates state
  const [pending, setPending] = useState([]);
  const [pendingError, setPendingError] = useState("");

  async function onSearch(e) {
    e?.preventDefault?.();
    setError("");
    setResult(null);
    setList([]);
    const q = query.trim();
    if (!q) {
      setError("Please enter a value to search.");
      return;
    }

    try {
      setLoading(true);
      if (mode === MODES.CERT) {
        // Treat "certificate number" as CID for now
        const data = await API.lookupByCid(q);
        setResult(data);
      } else {
        // mode === STUDENT: treat query as wallet address
        const data = await API.myCertificates(null, q);
        setList(data || []);
      }
    } catch (err) {
      setError(err.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  }

  // NEW: load pending certificates once on mount
  useEffect(() => {
    API.pendingCertificates()
      .then((data) => setPending(data || []))
      .catch((err) =>
        setPendingError(err?.message || "Could not load pending certificates.")
      );
  }, []);

  return (
    <div
      style={{
        maxWidth: 840,
        margin: "32px auto",
        display: "grid",
        gap: 16,
      }}
    >
      <header>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>
          Guest lookup
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "var(--muted)",
            marginTop: 4,
          }}
        >
          Third parties can verify certificates or look up a student&apos;s
          certificates without creating an account.
        </p>
      </header>

      {/* Mode toggle */}
      <div
        style={{
          display: "inline-flex",
          border: "1px solid var(--border)",
          borderRadius: 999,
          padding: 2,
          background: "#fff",
          alignSelf: "flex-start",
        }}
      >
        <button
          type="button"
          onClick={() => {
            setMode(MODES.CERT);
            setResult(null);
            setList([]);
            setError("");
          }}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: 13,
            background: mode === MODES.CERT ? "var(--primary)" : "transparent",
            color: mode === MODES.CERT ? "#fff" : "var(--text)",
          }}
        >
          By certificate ID (CID)
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(MODES.STUDENT);
            setResult(null);
            setList([]);
            setError("");
          }}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "6px 14px",
            cursor: "pointer",
            fontSize: 13,
            background:
              mode === MODES.STUDENT ? "var(--primary)" : "transparent",
            color: mode === MODES.STUDENT ? "#fff" : "var(--text)",
          }}
        >
          By student wallet address
        </button>
      </div>

      {/* Search form */}
      <form
        onSubmit={onSearch}
        style={{
          display: "grid",
          gap: 8,
          padding: 16,
          border: "1px solid var(--border)",
          borderRadius: 16,
          background: "#fff",
        }}
      >
        <label style={{ fontSize: 13, color: "var(--muted)" }}>
          {mode === MODES.CERT
            ? "Enter certificate number / IPFS CID"
            : "Enter student wallet address (0x…)"}
        </label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === MODES.CERT ? "bafy..." : "0x..."}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button type="submit" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </Button>
        </div>
        {error && <div style={{ color: "#b91c1c", fontSize: 14 }}>{error}</div>}
      </form>

      {/* Result for single certificate */}
      {mode === MODES.CERT && result && (
        <div
          style={{
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "#fff",
            fontSize: 14,
            display: "grid",
            gap: 4,
          }}
        >
          <div>
            <b>Owner (student):</b> {result.studentAddress || "N/A"}
          </div>
          <div>
            <b>Name:</b> {result.name}
          </div>
          <div>
            <b>Degree:</b> {result.degree}
          </div>
          <div>
            <b>Major:</b> {result.major}
          </div>
          <div>
            <b>Year:</b> {result.year}
          </div>
          <div>
            <b>Issuer:</b> {result.issuer}
          </div>
          <div>
            <b>Certificate ID (CID):</b> {result.cid}
          </div>
          <div>
            <b>Transaction:</b> {result.tx}
          </div>
        </div>
      )}

      {/* Result for student address: list of certs */}
      {mode === MODES.STUDENT && list && list.length > 0 && (
        <div
          style={{
            padding: 16,
            border: "1px solid var(--border)",
            borderRadius: 16,
            background: "#fff",
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            Certificates for student address: {query.trim()}
          </div>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 10,
            }}
          >
            {list.map((c) => (
              <li
                key={c.cid}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fafafa",
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {c.degree} · {c.major} · {c.year}
                </div>
                <div style={{ fontSize: 13 }}>
                  <b>CID:</b> {c.cid}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === MODES.STUDENT &&
        !loading &&
        !error &&
        list &&
        list.length === 0 &&
        query.trim() && (
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            No certificates found for this student address.
          </div>
        )}

      {/* 🔻 PENDING CERTIFICATES SECTION – appears in the “red box” area */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          Pending certificates (awaiting verification)
        </h2>
        {pendingError && (
          <div style={{ color: "#b91c1c", fontSize: 14 }}>{pendingError}</div>
        )}
        {!pendingError && pending.length === 0 && (
          <div style={{ fontSize: 14, color: "var(--muted)" }}>
            There are no pending certificates at the moment.
          </div>
        )}
        {pending.length > 0 && (
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: "none",
              display: "grid",
              gap: 10,
              marginTop: 8,
            }}
          >
            {pending.map((c) => (
              <li
                key={c.cid}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: 12,
                  background: "#fff",
                  fontSize: 14,
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ color: "var(--muted)", fontSize: 13 }}>
                  {c.degree} · {c.major} · {c.year}
                </div>
                <div style={{ fontSize: 13 }}>
                  <b>CID:</b> {c.cid}
                </div>
                <div style={{ fontSize: 13 }}>
                  <b>Owner (wallet):</b> {c.studentAddress || "N/A"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
