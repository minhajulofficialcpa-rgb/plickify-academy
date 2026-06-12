import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const projectRef = "cpouhlqthdbqhorzselb";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  process.exit(1);
}

async function tryConnect(host: string, port: number, label: string) {
  const client = new Client({
    host,
    port,
    database: "postgres",
    user: "postgres",
    password: serviceRoleKey,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`Trying ${label} (${host}:${port})...`);
    await client.connect();
    console.log(`Connected via ${label}!`);
    return client;
  } catch (err: any) {
    console.log(`${label} failed: ${err.message}`);
    return null;
  }
}

async function main() {
  // Try multiple connection methods
  const attempts = [
    { host: `db.${projectRef}.supabase.co`, port: 5432, label: "Direct DB" },
    { host: `${projectRef}.supabase.co`, port: 6543, label: "Pooler (host)" },
    { host: `db.${projectRef}.supabase.co`, port: 6543, label: "Pooler (db)" },
  ];

  let client = null;
  for (const attempt of attempts) {
    client = await tryConnect(attempt.host, attempt.port, attempt.label);
    if (client) break;
  }

  if (!client) {
    console.error("\nAll connection attempts failed.");
    console.error("\nAlternative: Please run this SQL manually in your Supabase SQL Editor:");
    console.error("Go to https://supabase.com/dashboard/project/cpouhlqthdbqhorzselb/sql/new");
    console.error("Then paste the contents of supabase/migrations/00001_schema.sql and click Run.");
    process.exit(1);
  }

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
