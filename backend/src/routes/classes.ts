import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";

const router = Router();

// Schema para o "Gerador de Agenda" (Bulk Create)
const generateSchema = z.object({
  name: z.string(),
  teacherId: z.coerce.number(),
  timeStart: z.string(), // "08:00"
  timeEnd: z.string(),   // "09:00"
  startDate: z.string(), // "2023-12-01"
  endDate: z.string(),   // "2023-12-31"
  weekDays: z.array(z.number()) // [1, 3, 5] (Seg, Qua, Sex)
});

// 1. Rota de LISTAGEM (GET /api/classes)
// Busca aulas filtrando por data (para não trazer o banco todo)
router.get("/", async (req, res) => {
  const { start, end } = req.query;
  
  // Se o front não mandar datas, pega o mês atual por padrão
  const now = new Date();
  const firstDay = start ? new Date(String(start)) : new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = end ? new Date(String(end)) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const classes = await prisma.gymClass.findMany({
    where: {
      date: {
        gte: firstDay,
        lte: lastDay
      }
    },
    include: { teacher: true },
    orderBy: { date: 'asc' }
  });
  
  res.json(classes);
});

// 2. Rota de GERAÇÃO EM MASSA (POST /api/classes/generate)
// Essa é a rota que estava faltando e dando erro 404
router.post("/generate", async (req, res) => {
  try {
    // Valida os dados vindos do Front
    const body = generateSchema.parse(req.body);
    
    // Configura as datas (ajuste de fuso simples)
    const start = new Date(body.startDate);
    start.setHours(12, 0, 0, 0);
    
    const end = new Date(body.endDate);
    end.setHours(12, 0, 0, 0);

    const classesToCreate = [];
    const groupId = Date.now().toString(); // ID para agrupar essa criação

    // Loop: Percorre dia a dia, do inicio ao fim
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const currentDay = d.getDay(); // 0=Dom, 1=Seg...

      // Se o dia atual estiver na lista escolhida (ex: Seg e Qua)
      if (body.weekDays.includes(currentDay)) {
        classesToCreate.push({
          name: body.name,
          date: new Date(d), // Cria a data específica
          timeStart: body.timeStart,
          timeEnd: body.timeEnd,
          teacherId: body.teacherId,
          groupId: groupId
        });
      }
    }

    if (classesToCreate.length === 0) {
      return res.status(400).json({ message: "Nenhum dia compatível encontrado no intervalo." });
    }

    // Salva tudo de uma vez no banco
    await prisma.gymClass.createMany({ data: classesToCreate });

    res.status(201).json({ message: "Agenda gerada!", count: classesToCreate.length });

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Erro ao gerar agenda." });
  }
});

// 3. Rota de DELETAR (DELETE /api/classes/:id)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.gymClass.delete({ where: { id } });
  res.status(204).send();
});

export const classRouter = router;