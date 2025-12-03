import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const classSchema = z.object({
  name: z.string().min(2),
  dayOfWeek: z.coerce.number().min(0).max(6),
  timeStart: z.string(),
  timeEnd: z.string(),
  teacherId: z.coerce.number()
});

router.get("/", async (_req, res) => {
  const classes = await prisma.gymClass.findMany({
    include: { teacher: true }
  });
  res.json(classes);
});

router.post("/", validateBody(classSchema), async (req, res) => {
  const gymClass = await prisma.gymClass.create({ data: req.body });
  res.status(201).json(gymClass);
});

// Rota para deletar aula (útil para o painel)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.gymClass.delete({ where: { id } });
  res.status(204).send();
});

export const classRouter = router;