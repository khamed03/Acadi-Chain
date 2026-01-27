import express from "express";
import cors from "cors";
import helmet from "helmet";
import { ENV } from "./config/env.js";
import { errorHandler } from "./middleware/error.js";

import authRoutes from "./routes/auth.routes.js";
import certRoutes from "./routes/cert.routes.js";
import studentRoutes from "./routes/student.routes.js";
import issuerRoutes from "./routes/issuer.routes.js";

const app = express();

app.use(helmet());
app.use(cors({
  origin: ENV.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/cert", certRoutes);
app.use("/student", studentRoutes);
app.use("/issuer", issuerRoutes);

app.use(errorHandler);

export default app;
