import { prisma } from "../lib/prisma";

export async function ensureAdminUser() {
  const result = await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      name: "Admin",
      email: "admin@example.com",
      password: "admin",
    },
    create: {
      username: "admin",
      name: "Admin",
      email: "admin@example.com",
      password: "admin",
    },
  });
  console.log("[seed] admin garantido:", {
    id: result.id,
    username: result.username,
    password: result.password,
  });
}
