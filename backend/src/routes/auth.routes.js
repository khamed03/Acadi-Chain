import { Router } from "express";
import { ethers } from "ethers";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { setNonce, getNonce, clearNonce } from "../services/nonce.service.js";
import { requireString } from "../utils/validate.js";

const router = Router();

/**
 * POST /auth/nonce
 * body: { address, role }
 * returns: { nonce }
 */
router.post("/nonce", (req, res) => {
  const address = requireString(req.body.address, "address");
  const role = requireString(req.body.role, "role");

  const nonce = `nonce-${Math.floor(Math.random() * 1e9)}`;
  setNonce(address, nonce);

  res.json({ nonce, role });
});

/**
 * POST /auth/verify
 * body: { address, role, signature, message }
 * returns: { token }
 */
router.post("/verify", (req, res) => {
  const address = requireString(req.body.address, "address");
  const role = requireString(req.body.role, "role");
  const signature = requireString(req.body.signature, "signature");
  const message = requireString(req.body.message, "message");

  const expectedNonce = getNonce(address);
  if (!expectedNonce || !message.includes(expectedNonce)) {
    return res.status(401).send("Invalid nonce");
  }

  // Recover signer
  const recovered = ethers.verifyMessage(message, signature);
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return res.status(401).send("Signature mismatch");
  }

  clearNonce(address);

  // Issue JWT
  const token = jwt.sign(
    { address, role },
    ENV.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
});

/**
 * POST /auth/login
 * body: { email, password, role }
 * returns: { token, role }
 *
 * (Demo email auth until full user DB is ready)
 */
router.post("/login", (req, res) => {
  const email = requireString(req.body.email, "email");
  const password = requireString(req.body.password, "password");
  const role = requireString(req.body.role, "role");

  // ✅ For demo scope: accept any non-empty credentials.
  // Later replace with DB user lookup + hashed passwords.
  if (password.length < 3) return res.status(401).send("Invalid login");

  const token = jwt.sign(
    { email, role },
    ENV.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token, role });
});

export default router;
