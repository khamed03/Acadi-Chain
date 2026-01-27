import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: Number(process.env.PORT || 4000),
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  RPC_URL: process.env.RPC_URL,
  CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
  ABI_PATH: process.env.ABI_PATH || "./ABI.json",
  ISSUER_PRIVATE_KEY: process.env.ISSUER_PRIVATE_KEY,
  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173"
};
