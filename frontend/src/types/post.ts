import type { Comment } from "./comment";
import type { User } from "./user";

export type Post = {
  id: number;
  title: string;
  content: string;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PostWithRelations = Post & {
  user?: User;
  comments?: Comment[];
};
