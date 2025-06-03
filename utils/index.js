import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Update connection details for TiDB Cloud
const connection = await mysql.createPool({
  host: "gateway01.eu-central-1.prod.aws.tidbcloud.com",
  user: "3u5F92Pdmn8MuQk.root",
  password: 'sDwjl7Y9JSi03uGC',
  database: 'test',
  port: 4000,
  ssl: { rejectUnauthorized: true }
});

export const db = drizzle(connection);