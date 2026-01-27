// backend/src/services/chain.service.js
import { readContract } from "../config/contract.js";

/**
 * IMPORTANT:
 * No on-chain writes happen in backend (no private keys in .env).
 * All writes happen in frontend via MetaMask.
 */
export async function issueOnChain() {
  throw new Error(
    "Backend on-chain writes are disabled. Issue certificates from the frontend using MetaMask."
  );
}

/**
 * Verify certificate (read-only)
 * ABI: verify(string specialId) -> (bool isValid, string reason)
 */
export async function verifyOnChain(specialId) {
  if (!readContract) throw new Error("readContract is not configured.");
  return await readContract.verify(specialId);
}

/**
 * Read certificate by specialId (read-only)
 * ABI: getStudentCertificate(string specialId) -> Certificate struct
 */
export async function getCertOnChain(specialId) {
  if (!readContract) throw new Error("readContract is not configured.");
  return await readContract.getStudentCertificate(specialId);
}

/**
 * List certificates for a student (read-only)
 * ABI: listCertificatesByStudent(address) -> Certificate[]
 * Returns array of Certificate structs
 */
export async function listCertificatesByStudentOnChain(studentAddress) {
  if (!readContract) throw new Error("readContract is not configured.");
  return await readContract.listCertificatesByStudent(studentAddress);
}

/**
 * List certificates for msg.sender (read-only)
 * ABI: listMyCertificates() -> Certificate[]
 */
export async function listMyCertificatesOnChain() {
  if (!readContract) throw new Error("readContract is not configured.");
  return await readContract.listMyCertificates();
}
