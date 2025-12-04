import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const classes = [
  "MUSCULACAO",
  "PILATES",
  "FUNCIONAL",
  "CROSS_TRAINING",
  "YOGA",
  "ZUMBA_DANCA",
  "HIIT",
  "SPINNING",
  "ALONGAMENTO",
  "FISIOTERAPIA_REABILITACAO",
] as const;

const teacherSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter exatamente 11 dígitos"),
  phone: z.string().regex(/^\d+$/, "Telefone deve conter apenas números"),
  email: z.string().email("E-mail inválido"),
  classType: z.enum(classes),
  photo: z.string().optional(),
});

const teacherUpdateSchema = teacherSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

router.get("/", async (req, res) => {
  const q = (req.query.q as string | undefined)?.toLowerCase().trim();
  const teachers = await prisma.teacher.findMany({
    where: q
      ? {
          name: {
            contains: q,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: { name: "asc" },
  });
  res.json(teachers);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  const teacher = await prisma.teacher.findUnique({ where: { id } });
  if (!teacher) return res.status(404).json({ message: "Professor não encontrado" });
  res.json(teacher);
});

router.post("/", validateBody(teacherSchema), async (req, res) => {
  try {
    const created = await prisma.teacher.create({
      data: req.body,
    });
    res.status(201).json(created);
  } catch (error: any) {
    // Se o erro for de campo único duplicado (CPF ou Email)
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        message: "Já existe um professor cadastrado com este CPF." 
      });
    }
    // Outros erros
    console.error(error);
    res.status(500).json({ message: "Erro ao cadastrar professor." });
  }
});

router.put("/:id", validateBody(teacherUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Professor não encontrado" });
  const updated = await prisma.teacher.update({ where: { id }, data: req.body });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  const existing = await prisma.teacher.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Professor não encontrado" });
  await prisma.teacher.delete({ where: { id } });
  res.status(204).send();
});

export const teacherRouter = router;
