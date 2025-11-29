import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate";
import { ensureAdminUser } from "../seed/admin";
import { prisma } from "../lib/prisma";

const router = Router();

const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

const userPublicSelect = {
  id: true,
  username: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

router.post("/login", validateBody(loginSchema), async (req, res) => {
  await ensureAdminUser();
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || user.password !== password) {
    console.warn("Login falhou", {
      usernameTentado: username,
      encontrouUsuario: Boolean(user),
      senhaNoBanco: user?.password,
    });
    return res.status(401).json({ message: "Credenciais inválidas" });
  }

  res.json({ user: { ...user, password: undefined }, token: "ok" });
});

router.get("/debug-admin", async (_req, res) => {
  const user = await prisma.user.findUnique({ where: { username: "admin" } });
  res.json({
    user,
  });
});

export const authRouter = router;
