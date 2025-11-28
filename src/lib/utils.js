export const shorten = (addr) => (addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : "");
