import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(4, "Senha precisa ter pelo menos 4 caracteres"),
});

export const userUpdateSchema = userSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

export type UserFormData = z.infer<typeof userSchema>;
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>;
