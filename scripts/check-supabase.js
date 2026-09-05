import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Load environment variables from .env.local
if (typeof process.loadEnvFile === 'function' && fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || "";
const iaBucket = process.env.IA_BUCKET || "novaslate-ncert-library";

console.log("=================================================================");
console.log("NovaSlate: Supabase PostgreSQL & Internet Archive Health Check");
console.log("=================================================================");

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("[!] Note: Supabase credentials not set or placeholder in .env.local.");
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log("[*] Checking Supabase PostgreSQL 'catalog' table...");
  const { data, error } = await supabase
    .from("catalog")
    .select("class, subject, title, file_path, url, is_available")
    .limit(10);

  if (error) {
    console.log(`[!] Supabase 'catalog' table error: ${error.message}`);
  } else {
    console.log(`[+] Successfully queried 'catalog' table! Found ${data?.length || 0} sample rows.`);
    for (const item of data || []) {
      console.log(`    - [Class ${item.class}] ${item.subject}: ${item.title}`);
    }
  }
}

console.log(`[*] Checking Internet Archive item '${iaBucket}'...`);
try {
  const res = await fetch(`https://archive.org/metadata/${iaBucket}`);
  const data = await res.json();
  const fileCount = data.files?.length || 0;
  console.log(`[+] Internet Archive item status: HTTP ${res.status} (${fileCount} files recorded)`);
} catch (err) {
  console.log(`[!] Could not reach Internet Archive metadata: ${err.message}`);
}

console.log("Done.");
