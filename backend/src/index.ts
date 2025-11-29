import "dotenv/config";
import app from "./app";
import { ensureAdminUser } from "./seed/admin";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

async function bootstrap() {
  try {
    await ensureAdminUser();
    app.listen(PORT, () => {
      console.log(`Servidor iniciado em http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Falha ao iniciar o servidor:", err);
    process.exit(1);
  }
}

bootstrap();
