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
Acadi-Chain/

├── src/ # Frontend React + Vite application

├── store/ # Zustand store for auth state

├── package.json # Project dependencies

├── vite.config.js # Vite config

├── index.html # App entry HTML

├── .gitignore

└── README.md


---

## 🛠️ Features

### 🧑‍🎓 Issuer & Student Experience
- MetaMask login using Ethereum account  
- Issuers can create certificates  
- Students can view and manage their certificates

### 🔍 Public Verification
- Anyone can verify certificates by Certificate ID or Student wallet
- Transparent verification via public blockchain state

### 🔐 Security Properties
- Immutable record of certificates on Ethereum
- Tamper-proof certificates stored with IPFS hashes (CIDs)
- Role-based access and revocation support

---

## 🚀 Getting Started

### 🔧 Prerequisites

Make sure you have the following installed:

- Node.js (v16 or above)
- MetaMask browser wallet
- Ethereum PoA network endpoint (local or testnet)

---

### 📥 Clone & Install

```sh
git clone https://github.com/khamed03/Acadi-Chain.git
cd Acadi-Chain
npm install
```

🚀 Running the App

Start Local Blockchain
Connect to your PoA network or development node (e.g., Ganache).

Deploy Contracts
Deploy smart contracts (with Remix, Hardhat, or Truffle as needed).

Update Config
Set your deployed contract address and RPC URL as environment variables.

Run Frontend
```
npm run dev
```

Open in Browser
Visit http://localhost:3000 (or the address Vite prints in terminal) and connect MetaMask to interact.

---

📁 Project Workflow

Certificate metadata is uploaded to IPFS via Pinata (returns a CID).

The frontend triggers a MetaMask transaction to call the smart contract with that CID.

The smart contract stores the certificate identifier and related data on-chain.

The public verification UI reads data from the blockchain to validate authenticity.

---

🧪 Testing

Add and run unit tests for smart contracts and frontend UI to ensure:

Correct issuance and verification

Expected role enforcement

Resilience against invalid inputs

Tests currently not included by default — consider adding with Hardhat or Truffle.

---

🍃 Contributing

Contributions, ideas, or improvements are welcome!
Feel free to:

Open issues

Submit pull requests

Propose features

---

📄 License

This project is open-source and licensed under the MIT License.

---

📚 References & Inspiration

This project draws on common patterns used in blockchain academic verification systems combining Ethereum smart contracts with decentralized storage like IPFS.


---
Done By "Khaled Hamed | Ibrahim Al-Sadeq | Aws Abwini" 
