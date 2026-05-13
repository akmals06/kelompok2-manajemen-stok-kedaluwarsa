import { defineConfig, env } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    seed: 'node -r dotenv/config prisma/seed.js',
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
