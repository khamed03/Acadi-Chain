// const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

// async function json(method, path, body, token){
//   const res = await fetch(`${BASE}${path}`, {
//     method,
//     headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//     body: body ? JSON.stringify(body) : undefined,
//     cache: "no-store",
//   });
//   if (!res.ok) throw new Error(await res.text());
//   return res.json();
// }

// export const API = {
//   requestNonce: (address, role) => json("POST", "/auth/nonce", { address, role }),
//   verifySignature: (payload) => json("POST", "/auth/verify", payload),
//   issueCertificate: (payload, token) => json("POST", "/cert/issue", payload, token),
//   lookupByCid: (cid) => json("GET", `/cert/cid/${cid}`),
//   lookupByTx: (tx) => json("GET", `/cert/tx/${tx}`),
// };

// src/lib/api.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MOCK = String(import.meta.env.VITE_USE_MOCK || "1") === "1";

// --- LocalStorage "DB" ---
const LS_KEY = "acadi-mockdb";
function loadDB() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || { certs: [], txIndex: {}, cidIndex: {}, activity: [] }; }
  catch { return { certs: [], txIndex: {}, cidIndex: {}, activity: [] }; }
}
function saveDB(db) { localStorage.setItem(LS_KEY, JSON.stringify(db)); }

// --- Helpers ---
function randHex(len) { return "0x" + Array.from({length: len}, () => Math.floor(Math.random()*16).toString(16)).join(""); }
function randCid() { return "bafy" + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12); }
function nowISO() { return new Date().toISOString(); }

// --- MOCK IMPLEMENTATION ---
async function mockJSON(method, path, body, token) {
  const db = loadDB();

  // AUTH
  if (method === "POST" && path === "/auth/nonce") {
    return { nonce: "demo-nonce-" + Math.floor(Math.random()*1e6) };
  }
  if (method === "POST" && path === "/auth/verify") {
    return { token: "demo-jwt-" + Math.floor(Math.random()*1e6) };
  }
  if (method === "POST" && path === "/auth/login") {
    return { token: "demo-jwt-" + Math.floor(Math.random()*1e6), role: body?.role || "student" };
  }

  // ISSUE CERTIFICATE (issuer)
  if (method === "POST" && path === "/cert/issue") {
    const tx = randHex(64);
    const cid = body?.ipfsCid || randCid();
    const cert = {
      cid,
      tx,
      name: body?.name || "Student Name",
      degree: body?.degree || "B.Sc.",
      major: body?.major || "Computer Science",
      year: body?.year || "2025",
      studentAddress: body?.studentAddress || null,
      issuer: "Mock University",
      valid: false,
      issuedAt: nowISO()
    };
    db.certs.push(cert);
    db.txIndex[tx] = cert;
    db.cidIndex[cid] = cert;
    db.activity.unshift({ type: "ISSUE", tx, cid, at: nowISO(), summary: `${cert.name} • ${cert.degree}` });
    saveDB(db);
    return { ok: true, tx, cid };
  }

    // ADMIN / VERIFIER → mark certificate as verified
  if (method === "POST" && path === "/cert/admin-verify") {
    const cid = body?.cid;
    if (!cid) throw new Error("CID is required.");
    const cert = db.cidIndex[cid];
    if (!cert) throw new Error("Certificate not found for CID: " + cid);

    cert.valid = true;
    // Optional: add activity line
    db.activity.unshift({
      type: "VERIFY",
      cid,
      tx: cert.tx,
      at: nowISO(),
      summary: `Verified ${cert.name} • ${cert.degree}`,
    });
    saveDB(db);
    return cert; // return updated certificate
  }

  // LOOKUP (verifier)
  if (method === "GET" && path.startsWith("/cert/cid/")) {
    const cid = decodeURIComponent(path.split("/").pop());
    const cert = db.cidIndex[cid];
    if (!cert) throw new Error("Certificate not found for CID.");
    return cert;
  }
  if (method === "GET" && path.startsWith("/cert/tx/")) {
    const tx = decodeURIComponent(path.split("/").pop());
    const cert = db.txIndex[tx];
    if (!cert) throw new Error("Certificate not found for TX.");
    return cert;
  }

  // STUDENT → MY CERTIFICATES
  if (method === "GET" && path.startsWith("/student/certificates")) {
    const url = new URL(BASE.replace(/\/$/, "") + path, window.location.origin);
    const addr = url.searchParams.get("address");
    const list = addr ? db.certs.filter(c => (c.studentAddress||"").toLowerCase() === addr.toLowerCase()) : db.certs;
    return list;
  }

    // PENDING CERTIFICATES (valid === false)
  if (method === "GET" && path === "/cert/pending") {
    const pending = db.certs.filter((c) => !c.valid);
    return pending;
  }


  // ISSUER → ACTIVITY
  if (method === "GET" && path === "/issuer/activity") {
    return db.activity.slice(0, 10);
  }

  return { ok: true };
}

// --- REAL FETCH (used when MOCK=0) ---
async function realJSON(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function json(method, path, body, token){
  return MOCK ? mockJSON(method, path, body, token) : realJSON(method, path, body, token);
}

export const API = {
  requestNonce: (address, role) => json("POST", "/auth/nonce", { address, role }),
  verifySignature: (payload) => json("POST", "/auth/verify", payload),
  emailLogin: (email, password, role) => json("POST", "/auth/login", { email, password, role }),
  

  issueCertificate: (payload, token) => json("POST", "/cert/issue", payload, token),
  lookupByCid: (cid) => json("GET", `/cert/cid/${encodeURIComponent(cid)}`),
  lookupByTx: (tx) => json("GET", `/cert/tx/${encodeURIComponent(tx)}`),

  myCertificates: (token, address) => {
    const q = address ? `?address=${encodeURIComponent(address)}` : "";
    return json("GET", `/student/certificates${q}`, undefined, token);
  },

  issuerActivity: (token) => json("GET", "/issuer/activity", undefined, token),

  pendingCertificates: () => json("GET", "/cert/pending"),


  adminVerifyCertificate: (cid, token) => json("POST", "/cert/admin-verify", { cid }, token),

};

