import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './utils/schema.js', // Path to your schema file
  out: './drizzle',            // Output directory for migrations
  dialect: 'mysql',            // Database dialect
  dbCredentials: {
    host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
    user: '3u5F92Pdmn8MuQk.root',
    password: 'sDwjl7Y9JSi03uGC',
    database: 'test',
    port: 4000,
    ssl: { rejectUnauthorized: true }
  }
});