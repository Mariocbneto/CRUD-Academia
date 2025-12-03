import express from "express";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { commentRouter } from "./routes/comments";
import { postRouter } from "./routes/posts";
import { userRouter } from "./routes/users";
import { studentRouter } from "./routes/students";
import { teacherRouter } from "./routes/teachers";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./swagger";
import { financialRouter } from "./routes/financial"; 
import { classRouter } from "./routes/classes";

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
  }),
);
// aumenta limite para permitir base64 de fotos pequenas
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);
app.use("/api/students", studentRouter);
app.use("/api/teachers", teacherRouter);
app.use("/api/financial", financialRouter);
app.use("/api/classes", classRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
