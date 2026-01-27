import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return res.status(401).send("Unauthorized: missing token");
  }

  try {
    req.user = jwt.verify(token, ENV.JWT_SECRET);
    next();
  } catch {
    return res.status(401).send("Unauthorized: invalid token");
  }
}

export function requireRole(roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).send("Forbidden: insufficient role");
    }
    next();
  };
}
