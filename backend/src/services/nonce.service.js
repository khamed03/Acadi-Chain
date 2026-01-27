const nonces = new Map(); // address -> nonce

export function setNonce(address, nonce) {
  nonces.set(address.toLowerCase(), { nonce, ts: Date.now() });
}

export function getNonce(address) {
  return nonces.get(address.toLowerCase())?.nonce || null;
}

export function clearNonce(address) {
  nonces.delete(address.toLowerCase());
}
