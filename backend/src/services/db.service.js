// src/services/db.service.js
// ✅ In-memory store (NO mock DB file, NO filesystem)
const state = {
  certs: [],         // newest first
  txToCid: {},       // txHash -> cid
  activity: [],      // newest first
  issuerRequests: [] // newest first: { id, name, university, department, docsUrl, wallet, status, createdAt, reviewedAt }
};

function newId(prefix = "req") {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now()}`;
}

export function addCertRecord({ cid, tx, studentAddress, name, degree, major, year }) {
  const createdAt = new Date().toISOString();

  const rec = {
    cid,
    tx,
    studentAddress: studentAddress || null,
    name,
    degree,
    major,
    year,
    createdAt
  };

  state.certs.unshift(rec);
  state.txToCid[tx] = cid;

  state.activity.unshift({
    type: "ISSUE",
    tx,
    cid,
    at: createdAt,
    summary: `${name} • ${degree}`.trim()
  });

  return { cid, tx };
}

export function addVerifyActivity({ cid, tx, name, degree }) {
  const at = new Date().toISOString();
  state.activity.unshift({
    type: "VERIFY",
    cid,
    tx,
    at,
    summary: `Verified ${name || ""} • ${degree || ""}`.trim()
  });
}

export function findCidByTx(tx) {
  return state.txToCid[tx] || null;
}

export function listCerts() {
  return state.certs;
}

export function listActivity(limit = 10) {
  return state.activity.slice(0, limit);
}

// ---------------------------
// Issuer onboarding (manual review off-chain, on-chain role grant via MetaMask)
// ---------------------------

export function addIssuerRequest({ name, university, department, docsUrl, wallet }) {
  const createdAt = new Date().toISOString();
  const rec = {
    id: newId("issuer"),
    name,
    university,
    department,
    docsUrl: docsUrl || "",
    wallet,
    status: "PENDING", // PENDING | APPROVED | REJECTED
    createdAt,
    reviewedAt: null
  };
  state.issuerRequests.unshift(rec);
  return rec;
}

export function listIssuerRequests({ status } = {}) {
  if (!status) return state.issuerRequests;
  return state.issuerRequests.filter((r) => r.status === status);
}

export function approveIssuerRequest(id) {
  const r = state.issuerRequests.find((x) => x.id === id);
  if (!r) return null;
  r.status = "APPROVED";
  r.reviewedAt = new Date().toISOString();
  return r;
}

export function rejectIssuerRequest(id) {
  const r = state.issuerRequests.find((x) => x.id === id);
  if (!r) return null;
  r.status = "REJECTED";
  r.reviewedAt = new Date().toISOString();
  return r;
}
