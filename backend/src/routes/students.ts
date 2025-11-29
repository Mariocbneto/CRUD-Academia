import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const plans = ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] as const;
type Plan = (typeof plans)[number];

const studentSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter exatamente 11 dígitos"),
  phone: z.string().regex(/^\d+$/, "Telefone deve conter apenas números"),
  email: z.string().email("E-mail inválido"),
  plan: z.enum(plans),
  photo: z.string().optional(),
});

const studentUpdateSchema = studentSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

function calculateEndDate(plan: Plan, startDate = new Date()) {
  const monthsMap: Record<Plan, number> = {
    MENSAL: 1,
    TRIMESTRAL: 3,
    SEMESTRAL: 6,
    ANUAL: 12,
  };
  const end = new Date(startDate);
  end.setMonth(end.getMonth() + monthsMap[plan]);
  return end;
}

router.get("/", async (req, res) => {
  const q = (req.query.q as string | undefined)?.toLowerCase().trim();
  const students = await prisma.student.findMany({
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
  res.json(students);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) return res.status(404).json({ message: "Aluno não encontrado" });
  res.json(student);
});

router.post("/", validateBody(studentSchema), async (req, res) => {
  const { plan, ...rest } = req.body as z.infer<typeof studentSchema>;
  const startDate = new Date();
  const endDate = calculateEndDate(plan, startDate);
  const created = await prisma.student.create({
    data: { ...rest, plan, startDate, endDate },
  });
  res.status(201).json(created);
});

router.put("/:id", validateBody(studentUpdateSchema), async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Aluno não encontrado" });

  const data: Partial<z.infer<typeof studentSchema>> & { endDate?: Date } = {
    ...req.body,
  };
  if (data.plan) {
    const startDate = existing.startDate;
    data.endDate = calculateEndDate(data.plan, startDate);
  }

  const updated = await prisma.student.update({
    where: { id },
    data,
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
  const existing = await prisma.student.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ message: "Aluno não encontrado" });
  await prisma.student.delete({ where: { id } });
  res.status(204).send();
});

export const studentRouter = router;
