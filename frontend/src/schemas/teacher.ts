import { z } from "zod";

export const classOptions = [
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

export const teacherSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos numéricos"),
  phone: z.string().regex(/^\d+$/, "Telefone deve conter apenas números"),
  email: z.string().email("E-mail inválido"),
  classType: z.enum(classOptions),
  photo: z.string().optional(),
});

export type TeacherFormData = z.infer<typeof teacherSchema>;
