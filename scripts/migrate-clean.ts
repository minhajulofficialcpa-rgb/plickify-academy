const TOKEN = "sbp_150c2708d4f1be0f89118880ff23093bf0520fa5";
const REF = "cpouhlqthdbqhorzselb";

async function query(sql: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error("SQL error:", text.substring(0, 300));
    return false;
  }
  if (text.trim()) console.log("OK:", text.substring(0, 150));
  return true;
}

async function main() {
  // Drop ALL existing tables in correct order (respecting FK constraints)
  console.log("=== Dropping existing tables ===");
  const dropOrder = [
    "support_messages", "support_tickets", "assignment_submissions", "assignments",
    "watch_analytics", "device_sessions", "abandoned_carts", "downloads",
    "notifications", "audit_logs", "reviews", "contact_messages",
    "certificates", "invoices", "orders", "user_batches", "enrollments",
    "course_lessons", "batches", "products", "courses", "admin_roles",
    "profiles"
  ];
  
  for (const table of dropOrder) {
    await query(`DROP TABLE IF EXISTS ${table} CASCADE;`);
  }

  // Now run the full migration SQL
  console.log("\n=== Creating tables with correct schema ===");
  const fs = await import("fs");
  const { resolve } = await import("path");
  const sql = fs.readFileSync(resolve(process.cwd(), "supabase/migrations/00001_schema.sql"), "utf-8");
  
  // Execute in batches to avoid issues
  const statements = sql
    .split(";")
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0 && !s.startsWith("--"));

  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const ok = await query(stmt + ";");
    if (ok) success++;
    else failed++;
  }

  console.log(`\n=== Complete! ${success} succeeded, ${failed} failed ===`);
}

main().catch(console.error);
