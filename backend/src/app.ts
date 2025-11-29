import express from "express";
import swaggerUi from "swagger-ui-express";
import { commentRouter } from "./routes/comments";
import { postRouter } from "./routes/posts";
import { userRouter } from "./routes/users";
import { errorHandler } from "./middlewares/errorHandler";
import { swaggerSpec } from "./swagger";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/comments", commentRouter);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
