import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
let supabaseUrl = "";
let supabaseAnonKey = "";

try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      if (key === 'VITE_SUPABASE_URL') supabaseUrl = val;
      if (key === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = val;
    }
  }
} catch (e) {
  console.error("Error reading .env.local:", e.message);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables in .env.local. Url:", supabaseUrl, "Key:", supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function listAll(pathStr = "") {
  const { data, error } = await supabase.storage.from("ncert").list(pathStr);
  if (error) {
    console.error(`Error listing ${pathStr}:`, error);
    return;
  }
  for (const item of data || []) {
    const fullPath = pathStr ? `${pathStr}/${item.name}` : item.name;
    // In Supabase storage list API, if metadata is null, it's typically a folder or placeholder
    if (!item.metadata) {
      await listAll(fullPath);
    } else {
      console.log(`File: ${fullPath} (Size: ${item.metadata.size} bytes)`);
    }
  }
}

listAll().then(() => console.log("Done."));
