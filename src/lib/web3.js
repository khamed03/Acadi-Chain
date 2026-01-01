import { ethers } from "ethers";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

// Minimal ABI needed for student claim
const CONTRACT_ABI = [
  "function claimMyWallet(bytes32 studentId) external"
];

export async function getBrowserProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  return { provider, signer, address };
}

export async function claimMyWalletOnChain(studentId) {
  if (!studentId || !studentId.startsWith("0x") || studentId.length !== 66) {
    throw new Error("Invalid studentId (must be bytes32 0x...64 hex chars)");
  }
  const { signer } = await connectWallet();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  const tx = await contract.claimMyWallet(studentId);
  const receipt = await tx.wait();
  return receipt.hash;
}
