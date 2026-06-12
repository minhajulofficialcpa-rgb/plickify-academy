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
  return res.json();
}

async function main() {
  // Check existing tables
  const tables = await query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
  );
  console.log("Existing tables:", JSON.stringify(tables, null, 2));

  // Check profiles table columns
  const profileCols = await query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' ORDER BY ordinal_position;"
  );
  console.log("Profile columns:", JSON.stringify(profileCols, null, 2));
}

main().catch(console.error);
