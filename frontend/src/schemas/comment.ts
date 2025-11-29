import { z } from "zod";

export const commentSchema = z.object({
  content: z.string().min(1, "Conteúdo é obrigatório"),
  postId: z.coerce.number().int().positive("postId deve ser positivo"),
  userId: z.coerce.number().int().positive("userId deve ser positivo"),
});

export const commentUpdateSchema = commentSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  "Forneça ao menos um campo para atualizar",
);

export type CommentFormData = z.infer<typeof commentSchema>;
export type CommentUpdateFormData = z.infer<typeof commentUpdateSchema>;
