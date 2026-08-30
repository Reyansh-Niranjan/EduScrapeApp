import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local
if (typeof process.loadEnvFile === 'function' && fs.existsSync('.env.local')) {
  process.loadEnvFile('.env.local');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

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
