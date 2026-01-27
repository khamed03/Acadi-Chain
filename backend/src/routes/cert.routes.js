// import { Router } from "express";
// import { requireAuth, requireRole } from "../middleware/auth.js";
// import { requireString, isEthAddress } from "../utils/validate.js";
// import { issueOnChain, verifyOnChain, getCertOnChain } from "../services/chain.service.js";
// import { addCertRecord, addVerifyActivity, findCidByTx, listCerts } from "../services/db.service.js";

// const router = Router();

// /**
//  * POST /cert/issue
//  * issuer only
//  * body: { ipfsCid, studentAddress, name, degree, major, year }
//  * returns: { ok, tx, cid }
//  */
// router.post(
//   "/issue",
//   requireAuth,
//   requireRole(["issuer"]),
//   async (req, res, next) => {
//     try {
//       const cid = requireString(req.body.ipfsCid, "ipfsCid");
//       const name = requireString(req.body.name, "name");
//       const degree = requireString(req.body.degree, "degree");
//       const major = requireString(req.body.major, "major");
//       const year = requireString(req.body.year, "year");

//       const studentAddress = req.body.studentAddress?.trim() || "";
//       if (studentAddress && !isEthAddress(studentAddress)) {
//         throw new Error("studentAddress must be a valid 0x address (or empty)");
//       }

//       const txHash = await issueOnChain({
//         cid,
//         studentAddress: studentAddress || null,
//         name,
//         degree,
//         major,
//         year
//       });

//       addCertRecord({ cid, tx: txHash, studentAddress: studentAddress || null, name, degree, major, year });

//       res.json({ ok: true, tx: txHash, cid });
//     } catch (e) {
//       next(e);
//     }
//   }
// );

// /**
//  * POST /cert/admin-verify
//  * verifier only (your frontend uses role "verifier")
//  * body: { cid }
//  * returns: updated cert object (frontend expects cert back)
//  */
// router.post(
//   "/admin-verify",
//   requireAuth,
//   requireRole(["verifier"]),
//   async (req, res, next) => {
//     try {
//       const cid = requireString(req.body.cid, "cid");

//       const txHash = await verifyOnChain(cid);

//       // fetch updated cert from chain (best truth)
//       const cert = await getCertOnChain(cid);

//       // add activity for issuer dashboard
//       const record = listCerts().find((c) => c.cid === cid);
//       addVerifyActivity({ cid, tx: txHash, name: record?.name, degree: record?.degree });

//       // return a normalized cert shape similar to mock
//       res.json({
//         cid,
//         tx: record?.tx || txHash,
//         name: record?.name || "",
//         degree: record?.degree || "",
//         major: record?.major || "",
//         year: record?.year || "",
//         studentAddress: record?.studentAddress || null,
//         issuer: record?.issuer || "On-chain",
//         valid: Boolean(cert?.valid ?? cert?.[6] ?? true),
//         issuedAt: record?.createdAt || new Date().toISOString()
//       });
//     } catch (e) {
//       next(e);
//     }
//   }
// );

// /**
//  * GET /cert/cid/:cid
//  * public
//  */
// router.get("/cid/:cid", async (req, res, next) => {
//   try {
//     const cid = requireString(req.params.cid, "cid");
//     const cert = await getCertOnChain(cid);

//     // Use off-chain record for human fields (name/degree) if your contract doesn't return them fully
//     const record = listCerts().find((c) => c.cid === cid);

//     res.json({
//       cid,
//       tx: record?.tx || null,
//       name: record?.name || cert?.name || cert?.[2] || "",
//       degree: record?.degree || cert?.degree || cert?.[3] || "",
//       major: record?.major || cert?.major || cert?.[4] || "",
//       year: record?.year || cert?.year || cert?.[5] || "",
//       studentAddress: record?.studentAddress || cert?.student || cert?.[1] || null,
//       issuer: record?.issuer || "On-chain",
//       valid: Boolean(cert?.valid ?? cert?.[6] ?? false),
//       issuedAt: record?.createdAt || null
//     });
//   } catch (e) {
//     next(e);
//   }
// });

// /**
//  * GET /cert/tx/:tx
//  * public
//  * uses off-chain index to find cid
//  */
// router.get("/tx/:tx", async (req, res, next) => {
//   try {
//     const tx = requireString(req.params.tx, "tx");
//     const cid = findCidByTx(tx);
//     if (!cid) return res.status(404).send("Certificate not found for TX.");
//     // reuse cid endpoint logic
//     req.params.cid = cid;
//     return router.handle(req, res, next);
//   } catch (e) {
//     next(e);
//   }
// });

// /**
//  * GET /cert/pending
//  * public
//  * returns list of certs that are still not valid
//  */
// router.get("/pending", async (req, res, next) => {
//   try {
//     const certs = listCerts();
//     const pending = [];

//     for (const c of certs) {
//       try {
//         const onchain = await getCertOnChain(c.cid);
//         const valid = Boolean(onchain?.valid ?? onchain?.[6] ?? false);
//         if (!valid) pending.push({ ...c, valid: false });
//       } catch {
//         // if not found on chain, keep pending
//         pending.push({ ...c, valid: false });
//       }
//     }
//     res.json(pending);
//   } catch (e) {
//     next(e);
//   }
// });

// export default router;

import { Router } from "express";
import { requireString } from "../utils/validate.js";
import { verifyOnChain, getCertOnChain } from "../services/chain.service.js";

const router = Router();

/**
 * GET /cert/:specialId
 * public
 * Returns a certificate struct from chain (read-only).
 */
router.get("/:specialId", async (req, res, next) => {
  try {
    const specialId = requireString(req.params.specialId, "specialId");
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

/**
 * GET /cert/:specialId/verify
 * public
 * verify(string) -> (bool isValid, string reason)
 */
router.get("/:specialId/verify", async (req, res, next) => {
  try {
    const specialId = requireString(req.params.specialId, "specialId");
    const v = await verifyOnChain(specialId);

    // v could be [bool, string] or object-like depending on ethers
    const isValid = Boolean(v?.isValid ?? v?.[0] ?? false);
    const reason = String(v?.reason ?? v?.[1] ?? "");

    return res.json({ specialId, isValid, reason });
  } catch (e) {
    next(e);
  }
});

export default router;
