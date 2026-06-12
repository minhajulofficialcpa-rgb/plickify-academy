import { readFileSync } from "fs";
import { resolve } from "path";

const SUPABASE_ACCESS_TOKEN = "sbp_150c2708d4f1be0f89118880ff23093bf0520fa5";
const PROJECT_REF = "cpouhlqthdbqhorzselb";

async function main() {
  const sqlPath = resolve(process.cwd(), "supabase/migrations/00001_schema.sql");
  const sql = readFileSync(sqlPath, "utf-8");

  console.log(`SQL file size: ${sql.length} characters`);

  // Split the SQL into manageable chunks (e.g., by statement)
  // The Management API can handle large queries, so try full SQL first
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );

  const result = await response.text();

  if (response.ok) {
    console.log("Migration applied successfully!");
    console.log("Result:", result.substring(0, 500));
  } else {
    console.error("Migration failed:", result);
    process.exit(1);
  }
}

main().catch(console.error);
