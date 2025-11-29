import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const userCreateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});

const userUpdateSchema = userCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    include: { posts: true, comments: true },
  });
  res.json(users);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { posts: true, comments: true },
  });

  if (!user) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  res.json(user);
});

router.post("/", validateBody(userCreateSchema), async (req, res) => {
  const user = await prisma.user.create({ data: req.body });
  res.status(201).json(user);
});

router.put("/:id", validateBody(userUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  const updated = await prisma.user.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Usuário não encontrado" });
  }

  await prisma.user.delete({ where: { id } });
  res.status(204).send();
});

export const userRouter = router;
