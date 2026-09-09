import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.example' });
// Try .env if .env.example doesn't have it, or process.env

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('buildings')
    .update({ name: 'Majestic 14 (Oran)', address: 'Oran' })
    .ilike('name', '%majestic%');
  
  if (error) {
    console.error("Error updating:", error);
  } else {
    console.log("Updated successfully:", data);
  }
}

run();
