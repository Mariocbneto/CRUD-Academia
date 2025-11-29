import "dotenv/config";
import swaggerJsdoc from "swagger-jsdoc";

const serverUrl = process.env.SWAGGER_SERVER_URL || "http://localhost:3000";

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "API CRUD Express + Prisma",
    version: "1.0.0",
    description:
      "API em Express com TypeScript, Prisma, PostgreSQL, Zod e Swagger. Recursos: Usuários, Posts e Comentários.",
  },
  servers: [
    {
      url: serverUrl,
      description: "Local",
    },
  ],
  tags: [
    { name: "Usuários" },
    { name: "Posts" },
    { name: "Comentários" },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserCreateInput: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      UserUpdateInput: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          content: { type: "string" },
          userId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PostCreateInput: {
        type: "object",
        required: ["title", "content", "userId"],
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          userId: { type: "integer" },
        },
      },
      PostUpdateInput: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
          userId: { type: "integer" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          content: { type: "string" },
          postId: { type: "integer" },
          userId: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CommentCreateInput: {
        type: "object",
        required: ["content", "postId", "userId"],
        properties: {
          content: { type: "string" },
          postId: { type: "integer" },
          userId: { type: "integer" },
        },
      },
      CommentUpdateInput: {
        type: "object",
        properties: {
          content: { type: "string" },
          postId: { type: "integer" },
          userId: { type: "integer" },
        },
      },
      UserWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/User" },
          {
            type: "object",
            properties: {
              posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
              comments: {
                type: "array",
                items: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
        ],
      },
      PostWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/Post" },
          {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              comments: {
                type: "array",
                items: { $ref: "#/components/schemas/Comment" },
              },
            },
          },
        ],
      },
      CommentWithRelations: {
        allOf: [
          { $ref: "#/components/schemas/Comment" },
          {
            type: "object",
            properties: {
              user: { $ref: "#/components/schemas/User" },
              post: { $ref: "#/components/schemas/Post" },
            },
          },
        ],
      },
    },
  },
  paths: {
    "/api/users": {
      get: {
        tags: ["Usuários"],
        summary: "Lista todos os usuários",
        responses: {
          200: {
            description: "Lista de usuários",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/UserWithRelations" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Usuários"],
        summary: "Cria um usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreateInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Usuário criado",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          400: { description: "Dados inválidos" },
        },
      },
    },
    "/api/users/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Usuários"],
        summary: "Busca um usuário por ID",
        responses: {
          200: {
            description: "Usuário encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserWithRelations" },
              },
            },
          },
          404: { description: "Usuário não encontrado" },
        },
      },
      put: {
        tags: ["Usuários"],
        summary: "Atualiza um usuário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserUpdateInput" },
            },
          },
        },
        responses: {
          200: { description: "Usuário atualizado" },
          404: { description: "Usuário não encontrado" },
        },
      },
      delete: {
        tags: ["Usuários"],
        summary: "Remove um usuário",
        responses: {
          204: { description: "Usuário removido" },
          404: { description: "Usuário não encontrado" },
        },
      },
    },
    "/api/posts": {
      get: {
        tags: ["Posts"],
        summary: "Lista todos os posts (inclui usuário e comentários)",
        responses: {
          200: {
            description: "Lista de posts",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/PostWithRelations" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Posts"],
        summary: "Cria um post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostCreateInput" },
            },
          },
        },
        responses: {
          201: { description: "Post criado" },
          400: { description: "Dados inválidos" },
        },
      },
    },
    "/api/posts/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Posts"],
        summary: "Busca um post por ID (inclui usuário e comentários)",
        responses: {
          200: {
            description: "Post encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PostWithRelations" },
              },
            },
          },
          404: { description: "Post não encontrado" },
        },
      },
      put: {
        tags: ["Posts"],
        summary: "Atualiza um post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostUpdateInput" },
            },
          },
        },
        responses: {
          200: { description: "Post atualizado" },
          404: { description: "Post não encontrado" },
        },
      },
      delete: {
        tags: ["Posts"],
        summary: "Remove um post",
        responses: {
          204: { description: "Post removido" },
          404: { description: "Post não encontrado" },
        },
      },
    },
    "/api/comments": {
      get: {
        tags: ["Comentários"],
        summary: "Lista todos os comentários",
        responses: {
          200: {
            description: "Lista de comentários",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/CommentWithRelations" },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Comentários"],
        summary: "Cria um comentário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentCreateInput" },
            },
          },
        },
        responses: {
          201: { description: "Comentário criado" },
          400: { description: "Dados inválidos" },
        },
      },
    },
    "/api/comments/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      get: {
        tags: ["Comentários"],
        summary: "Busca um comentário",
        responses: {
          200: {
            description: "Comentário encontrado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CommentWithRelations" },
              },
            },
          },
          404: { description: "Comentário não encontrado" },
        },
      },
      put: {
        tags: ["Comentários"],
        summary: "Atualiza um comentário",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CommentUpdateInput" },
            },
          },
        },
        responses: {
          200: { description: "Comentário atualizado" },
          404: { description: "Comentário não encontrado" },
        },
      },
      delete: {
        tags: ["Comentários"],
        summary: "Remove um comentário",
        responses: {
          204: { description: "Comentário removido" },
          404: { description: "Comentário não encontrado" },
        },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});
