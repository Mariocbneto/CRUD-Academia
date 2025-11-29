import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const commentCreateSchema = z.object({
  content: z.string().min(1, "Conteúdo é obrigatório"),
  postId: z.coerce.number().int().positive("postId deve ser positivo"),
  userId: z.coerce.number().int().positive("userId deve ser positivo"),
});

const commentUpdateSchema = commentCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

router.get("/", async (_req, res) => {
  const comments = await prisma.comment.findMany({
    include: { post: true, user: true },
  });
  res.json(comments);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { post: true, user: true },
  });

  if (!comment) {
    return res.status(404).json({ message: "Comentário não encontrado" });
  }

  res.json(comment);
});

router.post("/", validateBody(commentCreateSchema), async (req, res) => {
  const comment = await prisma.comment.create({ data: req.body });
  res.status(201).json(comment);
});

router.put("/:id", validateBody(commentUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Comentário não encontrado" });
  }

  const updated = await prisma.comment.update({
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

  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Comentário não encontrado" });
  }

  await prisma.comment.delete({ where: { id } });
  res.status(204).send();
});

export const commentRouter = router;
