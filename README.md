# 🇯🇴 Acadi-Chain

**Blockchain-based Academic Certificate Verification System**  
A decentralized application (DApp) that enables trusted issuance and verification of academic certificates using Ethereum smart contracts and IPFS for off-chain storage.

---

## 🚀 Overview

Acadi-Chain provides a secure, transparent, and tamper-proof platform where:

- **Institutions (Issuers)** can issue certificates to students on the blockchain.  
- **Students** own their certificates in a decentralized manner.  
- **Verifiers** can publicly verify certificate authenticity without trusting a central authority.  

This system solves certificate forgery and inefficiencies found in manual verification processes by storing immutable cryptographic proof of certificates on a blockchain (Ethereum Proof-of-Authority) and using IPFS for certificate metadata storage. :contentReference[oaicite:0]{index=0}

---

## 🧩 Architecture

The project is structured into the following main components:

📌 **Smart Contracts (Solidity)**  
- Manages certificate issuance, storage of identifiers, and verification logic.  
- Includes role-based access: Admin, Issuer, Student.  
- Supports revocation and public read access.

📌 **Frontend (React + Vite)**  
- Wallet-based authentication (MetaMask) for issuer writes.  
- Public verification interface without auth.  
- Interactive dashboards: Admin, Issuer, Student, and Public.

📌 **Blockchain & Storage**  
- Ethereum Proof-of-Authority network for cost-effective correctness and scalability.  
- IPFS via Pinata for off-chain storage of certificate metadata.

📌 **Backend (Read-only API)**  
- Reads blockchain and serves certificate data to the frontend.
- Does not perform any on-chain writes (writes go through MetaMask).

---

## 📂 Repository Structure

