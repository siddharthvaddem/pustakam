import { defineConfig } from 'drizzle-kit';

// Run `npm run db:generate` after changing src/db/schema.ts to create a migration.
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});
