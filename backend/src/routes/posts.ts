import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const postCreateSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  userId: z.coerce.number().int().positive("userId deve ser positivo"),
});

const postUpdateSchema = postCreateSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

router.get("/", async (_req, res) => {
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      comments: true,
    },
  });
  res.json(posts);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      comments: true,
    },
  });

  if (!post) {
    return res.status(404).json({ message: "Post não encontrado" });
  }

  res.json(post);
});

router.post("/", validateBody(postCreateSchema), async (req, res) => {
  const post = await prisma.post.create({ data: req.body });
  res.status(201).json(post);
});

router.put("/:id", validateBody(postUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "ID inválido" });
  }

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Post não encontrado" });
  }

  const updated = await prisma.post.update({
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

  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ message: "Post não encontrado" });
  }

  await prisma.post.delete({ where: { id } });
  res.status(204).send();
});

export const postRouter = router;
