import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();

const financialSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive(),
  description: z.string().min(3),
  studentId: z.coerce.number().optional(),
  teacherId: z.coerce.number().optional(),
});

router.get("/", async (_req, res) => {
  const records = await prisma.financialRecord.findMany({
    orderBy: { date: "desc" },
    include: { student: { select: { name: true } }, teacher: { select: { name: true } } }
  });
  res.json(records);
});

router.post("/", validateBody(financialSchema), async (req, res) => {
  const record = await prisma.financialRecord.create({ data: req.body });
  res.status(201).json(record);
});

export const financialRouter = router;