import { z } from "zod";

export const planOptions = ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] as const;

export const studentSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  cpf: z.string().regex(/^\d{11}$/, "CPF deve ter 11 dígitos numéricos"),
  phone: z.string().regex(/^\d+$/, "Telefone deve conter apenas números"),
  email: z.string().email("E-mail inválido"),
  plan: z.enum(planOptions),
  photo: z.string().optional(),
});

export type StudentFormData = z.infer<typeof studentSchema>;
