const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const NONCES = {};
const TOKENS = {};
const CERTS = {}; // in-memory store: cid → certificate object
const PENDING = [];

function validateIssuedData(body) {
  const required = ["cid", "student", "name", "degree", "major", "year"];
  required.forEach((field) => {
    if (!body[field] || body[field].trim() === "") {
      throw new Error(`${field} is required`);
    }
  });
  if (!/^0x[a-fA-F0-9]{40}$/.test(body.student)) {
    throw new Error("Invalid student address");
  }
}

// nonce generation for wallet sign-in
app.post("/auth/nonce", (req, res) => {
  const { address, role } = req.body;
  if (!address || !role) return res.status(400).json({ error: "Address and role required" });
  const nonce = uuidv4();
  NONCES[address] = { nonce, role };
  res.json({ nonce });
});

app.post("/auth/verify", (req, res) => {
  const { address, role, signature, message } = req.body;
  // In real implementation: verify signature from wallet
  if (!NONCES[address] || NONCES[address].nonce === undefined) {
    return res.status(400).json({ error: "Nonce not found" });
  }
  // Create JWT token with role payload:
  const token = jwt.sign({ address, role }, "your_jwt_secret", { expiresIn: "1h" });
  TOKENS[address] = { token, role };
  res.json({ token });
});

// Demo login for issuer/verifier
app.post("/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ error: "Missing data" });
  // You should validate credentials here
  const token = jwt.sign({ email, role }, "your_jwt_secret", { expiresIn: "1h" });
  res.json({ token });
});

// issue certificate
app.post("/cert/issue", (req, res) => {
  try {
    validateIssuedData(req.body);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const { cid, student, name, degree, major, year } = req.body;
  if (CERTS[cid]) return res.status(400).json({ error: "Certificate already issued" });

  // store as pending
  CERTS[cid] = { cid, student, name, degree, major, year, valid: false };
  PENDING.push(CERTS[cid]);
  res.json({ tx: "0xDEMO123", cid });
});

// admin verify
app.post("/cert/admin-verify", (req, res) => {
  const { cid } = req.body;
  if (!cid || !CERTS[cid]) return res.status(404).json({ error: "Certificate not found" });
  CERTS[cid].valid = true;
  // remove from pending list
  const index = PENDING.findIndex((c) => c.cid === cid);
  if (index >= 0) PENDING.splice(index, 1);
  res.json(CERTS[cid]);
});

// lookup by cid/tx
app.get("/cert/cid/:cid", (req, res) => {
  const { cid } = req.params;
  if (!CERTS[cid]) return res.status(404).json({ error: "Not found" });
  res.json(CERTS[cid]);
});
app.get("/cert/tx/:tx", (req, res) => {
  // In a real chain, map tx hash to cid; here we just return a demo cert.
  res.json({ message: "Use /cert/cid in this mock server" });
});

// pending list
app.get("/cert/pending", (req, res) => {
  res.json(PENDING);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
