// src/lib/api.js

// Backend base URL
const BASE =
  import.meta.env.VITE_API_URL || "http://localhost:4000";

/**
 * Generic JSON fetch helper
 */
async function json(method, path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `HTTP ${res.status}`);
  }

  // Some endpoints may return empty body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

/**
 * =========================
 * PUBLIC API
 * =========================
 */
export const API = {
  /* -------------------------
   * AUTH (wallet-based)
   * -------------------------
   */

  requestNonce: (address, role) =>
    json("POST", "/auth/nonce", { address, role }),

  verifySignature: ({ address, role, signature, message }) =>
    json("POST", "/auth/verify", {
      address,
      role,
      signature,
      message,
    }),

  /* -------------------------
   * ISSUER ONBOARDING (ADMIN)
   * -------------------------
   */

  createIssuerRequest: ({ name, university, department, docsUrl, wallet }) =>
    json("POST", "/issuer/request", {
      name,
      university,
      department,
      docsUrl,
      wallet,
    }),

  listIssuerRequests: (token, status = "PENDING") =>
    json(
      "GET",
      `/issuer/requests?status=${encodeURIComponent(status)}`,
      undefined,
      token
    ),

  approveIssuerRequest: (id, token) =>
    json(
      "POST",
      `/issuer/requests/${encodeURIComponent(id)}/approve`,
      undefined,
      token
    ),

  rejectIssuerRequest: (id, token) =>
    json(
      "POST",
      `/issuer/requests/${encodeURIComponent(id)}/reject`,
      undefined,
      token
    ),

  /* -------------------------
   * CERTIFICATES (READ-ONLY)
   * Uses specialId like AC-4
   * -------------------------
   */

  // 🔍 Get a single certificate by ID (AC-4)
  getCertificate: (specialId) =>
    json("GET", `/cert/${encodeURIComponent(specialId)}`),

  // ✅ Verify a certificate by ID
  verifyCertificate: (specialId) =>
    json("GET", `/cert/${encodeURIComponent(specialId)}/verify`),

  /* -------------------------
   * STUDENT CERTIFICATES
   * (Public read, no token needed for guests)
   * -------------------------
   */

  // List certificates by student wallet address
  myCertificates: (token, address) => {
    if (!address) throw new Error("address is required");
    return json(
      "GET",
      `/student/certificates?address=${encodeURIComponent(address)}`,
      undefined,
      token
    );
  },

  // Optional: fetch one student certificate by ID
  getStudentCertificateById: (token, specialId) =>
    json(
      "GET",
      `/student/certificate/${encodeURIComponent(specialId)}`,
      undefined,
      token
    ),
};
