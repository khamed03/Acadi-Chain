// Simple in-memory nonce store (no DB)
const nonces = new Map();

// optional: auto-expire nonces after 5 minutes
const TTL_MS = 5 * 60 * 1000;

export function setNonce(address, nonce) {
  const key = address.toLowerCase();
  nonces.set(key, { nonce, createdAt: Date.now() });
}

export function getNonce(address) {
  const key = address.toLowerCase();
  const entry = nonces.get(key);
  if (!entry) return null;

  if (Date.now() - entry.createdAt > TTL_MS) {
    nonces.delete(key);
    return null;
  }
  return entry.nonce;
}

export function clearNonce(address) {
  nonces.delete(address.toLowerCase());
}
