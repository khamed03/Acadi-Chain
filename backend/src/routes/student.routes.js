import { Router } from "express";
import {
  listCertificatesByStudentOnChain,
  getCertOnChain,
} from "../services/chain.service.js";
import { isEthAddress } from "../utils/validate.js";

const router = Router();

/**
 * GET /student/certificates?address=0x...
 * Returns certificates for a student from the blockchain (read-only).
 */
router.get("/certificates", async (req, res, next) => {
  try {
    const address = String(req.query.address || "").trim();
    if (!address) return res.status(400).json({ error: "address is required" });
    if (!isEthAddress(address)) return res.status(400).json({ error: "invalid address format" });

    const certs = await listCertificatesByStudentOnChain(address);

    const out = (certs || []).map((c) => ({
      specialId: c.specialId ?? c[0],
      issuerName: c.issuerName ?? c[1],
      studentName: c.studentName ?? c[2],
      student: c.student ?? c[3],
      courseName: c.courseName ?? c[4],
      expiry: (c.expiry ?? c[5])?.toString?.() ?? String(c.expiry ?? c[5] ?? "0"),
      issuedAt: (c.issuedAt ?? c[6])?.toString?.() ?? String(c.issuedAt ?? c[6] ?? "0"),
      revoked: Boolean(c.revoked ?? c[7] ?? false),
      exists: Boolean(c.exists ?? c[8] ?? true),
    }));

    return res.json(out);
  } catch (e) {
    next(e);
  }
});

/**
 * GET /student/certificate/:specialId
 */
router.get("/certificate/:specialId", async (req, res, next) => {
  try {
    const specialId = String(req.params.specialId || "").trim();
    if (!specialId) return res.status(400).json({ error: "specialId is required" });

    const c = await getCertOnChain(specialId);

    const out = {
      specialId: c.specialId ?? c[0],
      issuerName: c.issuerName ?? c[1],
      studentName: c.studentName ?? c[2],
      student: c.student ?? c[3],
      courseName: c.courseName ?? c[4],
      expiry: (c.expiry ?? c[5])?.toString?.() ?? String(c.expiry ?? c[5] ?? "0"),
      issuedAt: (c.issuedAt ?? c[6])?.toString?.() ?? String(c.issuedAt ?? c[6] ?? "0"),
      revoked: Boolean(c.revoked ?? c[7] ?? false),
      exists: Boolean(c.exists ?? c[8] ?? true),
    };

    return res.json(out);
  } catch (e) {
    next(e);
  }
});

export default router;
