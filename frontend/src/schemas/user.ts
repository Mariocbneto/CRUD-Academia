import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
});

export const userUpdateSchema = userSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
