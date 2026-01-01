const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || "API request failed");
  return data;
}

// Normalize ethers "Result" objects coming from backend JSON
export function normalizeCert(c) {
  if (!c) return null;

  // backend returns { certificate: <tuple/result> }
  // ethers v6 Result sometimes serializes numeric keys + named keys.
  const get = (key, idx) => (c?.[key] ?? c?.[idx]);

  return {
    studentId: get("studentId", 0),
    cid: get("cid", 1),
    name: get("name", 2),
    degree: get("degree", 3),
    major: get("major", 4),
    year: get("year", 5),
    verified: Boolean(get("verified", 6)),
    revoked: Boolean(get("revoked", 7)),
    issuedAt: String(get("issuedAt", 8) ?? ""),
    verifiedAt: String(get("verifiedAt", 9) ?? "")
  };
}

export const API = {
  // Admin
  addIssuer: (issuer) => request("POST", "/admin/issuers", { issuer }),
  registerStudent: (studentId, wallet) => request("POST", "/admin/students", { studentId, wallet }),
  adminSetStudentWallet: (studentId, wallet) => request("POST", "/admin/students/wallet", { studentId, wallet }),
  verifyCertificate: (cid) => request("POST", "/admin/certificates/verify", { cid }),
  revokeCertificate: (cid) => request("POST", "/admin/certificates/revoke", { cid }),

  // Issuer
  issueCertificate: (payload) => request("POST", "/issuer/certificates", payload),

  // Student
  getStudent: (studentId) => request("GET", `/student/${studentId}`),
  getStudentCertificates: (studentId) => request("GET", `/student/${studentId}/certificates`),

  // Wallet
  generateWallet: () => request("POST", "/wallet/generate"),

  // Public verify
  verifyByCid: (cid) => request("GET", `/verify/cid/${encodeURIComponent(cid)}`),

  // Read certificate through backend (same as verify)
  getCertificate: (cid) => request("GET", `/verify/cid/${encodeURIComponent(cid)}`)
};
