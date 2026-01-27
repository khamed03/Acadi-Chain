// src/config/contract.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const abiPath = path.join(__dirname, "../../abi/CertificateRegistry.json");
const ABI = JSON.parse(fs.readFileSync(abiPath, "utf8"));

const RPC_URL = process.env.RPC_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL) throw new Error("Missing RPC_URL");
if (!CONTRACT_ADDRESS) throw new Error("Missing CONTRACT_ADDRESS");

const provider = new ethers.JsonRpcProvider(RPC_URL);

// 🔍 Read-only contract (no key)
const readContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);


console.log("[CHAIN] RPC_URL:", RPC_URL);
console.log("[CHAIN] CONTRACT_ADDRESS:", CONTRACT_ADDRESS);

export { provider, readContract };
