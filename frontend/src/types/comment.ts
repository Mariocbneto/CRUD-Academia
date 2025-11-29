import type { Post } from "./post";
import type { User } from "./user";

export type Comment = {
  id: number;
  content: string;
  postId: number;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
};

export type CommentWithRelations = Comment & {
  post?: Post;
  user?: User;
};
