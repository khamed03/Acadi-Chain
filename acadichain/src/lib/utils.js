// src/lib/utils.js

// -----------------------------
// General helpers
// -----------------------------

// Shorten Ethereum address: 0x1234...abcd
export function shorten(addr, chars = 4) {
  const a = String(addr || "").trim();
  if (!a) return "";
  if (a.length <= 2 + chars * 2) return a; // already short
  return `${a.slice(0, 2 + chars)}...${a.slice(-chars)}`;
}

// -----------------------------
// Date helpers (DD/MM/YYYY)
// -----------------------------

// Strict DD/MM/YYYY format: 01-31 / 01-12 / 4 digits
export const DDMMYYYY_REGEX =
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

// Auto-format while typing: "12032027" -> "12/03/2027"
export function formatAsDDMMYYYY(raw) {
  // keep digits only
  let v = String(raw || "").replace(/[^\d]/g, "");
  if (v.length > 8) v = v.slice(0, 8);

  if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
  if (v.length >= 6) v = v.slice(0, 5) + "/" + v.slice(5);

  return v;
}

// Validate real calendar date (includes leap years)
export function isValidDDMMYYYY(dateStr) {
  if (!DDMMYYYY_REGEX.test(String(dateStr || "").trim())) return false;

  const [dd, mm, yyyy] = String(dateStr).split("/").map(Number);
  const d = new Date(yyyy, mm - 1, dd);

  // If Date auto-rolls (e.g., 31/02), it won't match back
  return (
    d.getFullYear() === yyyy &&
    d.getMonth() === mm - 1 &&
    d.getDate() === dd
  );
}

// Convert DD/MM/YYYY to UNIX timestamp (seconds) at end-of-day UTC
// Empty => 0 (no expiry)
export function ddmmyyyyToExpiryUnix(dateStr) {
  const s = String(dateStr || "").trim();
  if (!s) return 0;

  if (!isValidDDMMYYYY(s)) {
    throw new Error("Expiry must be a real date in DD/MM/YYYY (e.g., 25/06/2030).");
  }

  const [dd, mm, yyyy] = s.split("/").map(Number);
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd, 23, 59, 59));
  return Math.floor(dt.getTime() / 1000);
}


export function isExpired(expiry) {
  const ex = Number(expiry || 0);
  if (!Number.isFinite(ex) || ex <= 0) return false;
  const now = Math.floor(Date.now() / 1000);
  return now > ex;
}

export function getCertStatus(cert) {
  if (!cert) return "Unknown";
  if (cert.revoked) return "Revoked";
  if (isExpired(cert.expiry)) return "Expired";
  return "Active";
}
