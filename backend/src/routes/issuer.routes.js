import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireString, isEthAddress } from "../utils/validate.js";
import {
  listActivity,
  addIssuerRequest,
  listIssuerRequests,
  approveIssuerRequest,
  rejectIssuerRequest,
} from "../services/db.service.js";

const router = Router();

/**
 * GET /issuer/activity
 * issuer only
 * returns list
 */
router.get(
  "/activity",
  requireAuth,
  requireRole(["issuer"]),
  (req, res) => {
    res.json(listActivity(10));
  }
);

/**
 * POST /issuer/request
 * public (issuer-to-be submits onboarding request)
 * body: { name, university, department, docsUrl?, wallet }
 * returns: request record
 */
router.post("/request", (req, res) => {
  const name = requireString(req.body.name, "name");
  const university = requireString(req.body.university, "university");
  const department = requireString(req.body.department, "department");
  const wallet = requireString(req.body.wallet, "wallet");
  const docsUrl = String(req.body.docsUrl || "").trim();

  if (!isEthAddress(wallet)) {
    return res.status(400).json({ error: "wallet must be a valid 0x address" });
  }

  const rec = addIssuerRequest({
    name,
    university,
    department,
    docsUrl,
    wallet: wallet.trim(),
  });

  return res.json(rec);
});

/**
 * GET /issuer/requests?status=PENDING
 * admin only (your current frontend role name is "verifier")
 */
router.get(
  "/requests",
  requireAuth,
  requireRole(["verifier"]),
  (req, res) => {
    const status = String(req.query.status || "").trim().toUpperCase();
    const out = listIssuerRequests({ status: status || undefined });
    res.json(out);
  }
);

/**
 * POST /issuer/requests/:id/approve
 * admin only
 * NOTE: This endpoint only marks the request approved off-chain.
 * The actual on-chain role grant happens in the frontend via MetaMask:
 * contract.addIssuer(wallet)
 */
router.post(
  "/requests/:id/approve",
  requireAuth,
  requireRole(["verifier"]),
  (req, res) => {
    const id = requireString(req.params.id, "id");
    const updated = approveIssuerRequest(id);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  }
);

/**
 * POST /issuer/requests/:id/reject
 * admin only
 */
router.post(
  "/requests/:id/reject",
  requireAuth,
  requireRole(["verifier"]),
  (req, res) => {
    const id = requireString(req.params.id, "id");
    const updated = rejectIssuerRequest(id);
    if (!updated) return res.status(404).json({ error: "not found" });
    res.json(updated);
  }
);

export default router;
