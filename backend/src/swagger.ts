import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.1",
  info: {
    title: "API CRUD Academia",
    version: "1.0.0",
    description:
      "API em Express com TypeScript, Prisma, PostgreSQL, Zod e Swagger. Recursos: Auth, Usuários, Posts, Comentários e Alunos.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Auth" },
    { name: "Usuários" },
    { name: "Posts" },
    { name: "Comentários" },
    { name: "Alunos" },
    { name: "Professores" },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer" },
          username: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
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
      Student: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          cpf: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          plan: { type: "string", enum: ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time" },
          photo: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      StudentCreateInput: {
        type: "object",
        required: ["name", "cpf", "phone", "email", "plan"],
        properties: {
          name: { type: "string" },
          cpf: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          plan: { type: "string", enum: ["MENSAL", "TRIMESTRAL", "SEMESTRAL", "ANUAL"] },
          photo: { type: "string" },
        },
      },
      Teacher: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          cpf: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          classType: {
            type: "string",
            enum: [
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
            ],
          },
          photo: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TeacherCreateInput: {
        type: "object",
        required: ["name", "cpf", "phone", "email", "classType"],
        properties: {
          name: { type: "string" },
          cpf: { type: "string" },
          phone: { type: "string" },
          email: { type: "string" },
          classType: {
            type: "string",
            enum: [
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
            ],
          },
          photo: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } },
          },
        },
        responses: {
          200: {
            description: "Login ok",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } },
            },
          },
        },
      },
    },
    "/api/students": {
      get: {
        tags: ["Alunos"],
        summary: "Lista alunos (filtro ?q=)",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Student" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Alunos"],
        summary: "Cria aluno",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentCreateInput" },
            },
          },
        },
        responses: { 201: { description: "Aluno criado" } },
      },
    },
    "/api/students/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        tags: ["Alunos"],
        summary: "Busca aluno",
        responses: { 200: { description: "Aluno encontrado" }, 404: { description: "Não encontrado" } },
      },
      put: {
        tags: ["Alunos"],
        summary: "Atualiza aluno",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/StudentCreateInput" },
            },
          },
        },
        responses: { 200: { description: "Aluno atualizado" }, 404: { description: "Não encontrado" } },
      },
      delete: {
        tags: ["Alunos"],
        summary: "Remove aluno",
        responses: { 204: { description: "Removido" }, 404: { description: "Não encontrado" } },
      },
    },
    "/api/teachers": {
      get: {
        tags: ["Professores"],
        summary: "Lista professores (filtro ?q=)",
        responses: {
          200: {
            description: "Lista",
            content: {
              "application/json": {
                schema: { type: "array", items: { $ref: "#/components/schemas/Teacher" } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Professores"],
        summary: "Cria professor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherCreateInput" },
            },
          },
        },
        responses: { 201: { description: "Professor criado" } },
      },
    },
    "/api/teachers/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        tags: ["Professores"],
        summary: "Busca professor",
        responses: { 200: { description: "Professor encontrado" }, 404: { description: "Não encontrado" } },
      },
      put: {
        tags: ["Professores"],
        summary: "Atualiza professor",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TeacherCreateInput" },
            },
          },
        },
        responses: { 200: { description: "Professor atualizado" }, 404: { description: "Não encontrado" } },
      },
      delete: {
        tags: ["Professores"],
        summary: "Remove professor",
        responses: { 204: { description: "Removido" }, 404: { description: "Não encontrado" } },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});
