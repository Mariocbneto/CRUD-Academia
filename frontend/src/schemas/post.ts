import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
  userId: z.coerce.number().int().positive("userId deve ser positivo"),
});

export const postUpdateSchema = postSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

export type PostFormData = z.infer<typeof postSchema>;
export type PostUpdateFormData = z.infer<typeof postUpdateSchema>;
