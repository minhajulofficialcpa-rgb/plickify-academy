import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const projectRef = "cpouhlqthdbqhorzselb";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  process.exit(1);
}

const connectionString = `postgresql://postgres:${encodeURIComponent(serviceRoleKey)}@db.${projectRef}.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ connectionString });

  console.log("Connecting to database...");
  await client.connect();
  console.log("Connected!");

  const sqlPath = resolve(process.cwd(), "supabase/migrations/00001_schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log("Executing migration...");
  
  try {
    await client.query(sql);
    console.log("Migration completed successfully!");
  } catch (err: any) {
    console.error("Migration error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
