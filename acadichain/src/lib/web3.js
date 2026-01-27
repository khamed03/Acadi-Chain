import { createConfig, http } from "wagmi";
import { localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { ethers } from "ethers";

import ABI from "../abi/CertificateRegistry.json";

const rpcUrl = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:7545";
export const config = createConfig({
  chains: [localhost],
  transports: { [localhost.id]: http(rpcUrl) },
  connectors: [injected()],
});

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

function requireContractAddress() {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Missing VITE_CONTRACT_ADDRESS in frontend .env (Vite).");
  }
  return CONTRACT_ADDRESS;
}

export async function getBrowserProvider() {
  if (!window.ethereum) throw new Error("MetaMask not detected.");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  return await provider.getSigner();
}

export async function getContractWithSigner() {
  const signer = await getSigner();
  return new ethers.Contract(requireContractAddress(), ABI, signer);
}

export async function getReadContract() {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return new ethers.Contract(requireContractAddress(), ABI, provider);
}

/**
 * ✅ Determine APP role from ON-CHAIN roles.
 * App mapping:
 *  - DEFAULT_ADMIN_ROLE -> "verifier" (admin dashboard in your UI)
 *  - ISSUER_ROLE        -> "issuer"
 *  - STUDENT_ROLE       -> "student"
 */
export async function getAppRoleFromChain(address) {
  const contract = await getReadContract();
  const addr = String(address || "").trim();
  if (!addr) return null;

  const ADMIN_ROLE = ethers.ZeroHash; // 0x000...000
  const ISSUER_ROLE = await contract.ISSUER_ROLE();
  const STUDENT_ROLE = await contract.STUDENT_ROLE();

  const [isAdmin, isIssuer, isStudent] = await Promise.all([
    contract.hasRole(ADMIN_ROLE, addr),
    contract.hasRole(ISSUER_ROLE, addr),
    contract.hasRole(STUDENT_ROLE, addr),
  ]);

  // Priority: admin > issuer > student
  if (isAdmin) return "verifier";
  if (isIssuer) return "issuer";
  if (isStudent) return "student";
  return null;
}

export async function addIssuerWithMetaMask(issuerWallet) {
  const contract = await getContractWithSigner();
  const tx = await contract.addIssuer(issuerWallet);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

export async function addStudentWithMetaMask(studentWallet) {
  const contract = await getContractWithSigner();
  const tx = await contract.addStudent(studentWallet);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

export async function issueCertificateWithMetaMask({
  issuerName,
  studentName,
  studentAddress,
  courseName,
  expiry,
}) {
  const contract = await getContractWithSigner();

  const tx = await contract.issueCertificate(
    issuerName,
    studentName,
    studentAddress,
    courseName,
    BigInt(expiry || 0)
  );

  const receipt = await tx.wait();

  // Parse specialId from CertificateIssued event
  let specialId = null;
  for (const log of receipt.logs || []) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed?.name === "CertificateIssued") {
        specialId = parsed.args?.specialId ?? null;
        break;
      }
    } catch {}
  }

  return { txHash: receipt.hash, specialId: specialId || "(not parsed)" };
}

/**
 * ✅ Wallet connect helper for SignIn page
 * Returns: { address, role }
 */
export async function connectWallet() {
  const signer = await getSigner();
  const address = await signer.getAddress();
  const role = await getAppRoleFromChain(address);
  return { address, role };
}
