const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log("🚀 Starting database migration: Managers to Profiles & Password cleanup...");

  // 1. Find all managers currently stored in the 'residents' table
  const { data: managersInResidents, error: fetchErr } = await supabase
    .from('residents')
    .select('*')
    .eq('building_id', 'manager');

  if (fetchErr) {
    console.error("❌ Error fetching managers from residents table:", fetchErr);
    return;
  }

  console.log(`Found ${managersInResidents.length} manager records in 'residents' table.`);

  for (const manager of managersInResidents) {
    console.log(`Migrating manager: ${manager.first_name} (${manager.phone})`);
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', manager.id)
      .single();

    if (!existingProfile) {
      // Create profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({
          id: manager.id,
          first_name: manager.first_name || '',
          last_name: manager.last_name !== 'Syndic' ? manager.last_name : '',
          phone: manager.phone || manager.apt_number?.replace('MANAGER:', ''),
          role: 'manager'
        });
      
      if (profileErr) {
         console.error(`❌ Error creating profile for manager ${manager.id}:`, profileErr);
         continue;
      }
      console.log(`  ✅ Profile created for ${manager.id}`);
    } else {
      console.log(`  ℹ️ Profile already exists for ${manager.id}`);
    }

    // Delete fake resident record
    const { error: delErr } = await supabase
      .from('residents')
      .delete()
      .eq('id', manager.id);
      
    if (delErr) {
      console.error(`❌ Error deleting fake resident record ${manager.id}:`, delErr);
    } else {
      console.log(`  ✅ Fake resident record deleted for ${manager.id}`);
    }
  }

  // 2. Remove plaintext passwords from ALL residents
  console.log("🧹 Clearing plaintext passwords from all residents...");
  const { data: residents, error: resErr } = await supabase
    .from('residents')
    .select('id, password')
    .not('password', 'is', null);

  if (resErr) {
     console.error("❌ Error fetching residents:", resErr);
     return;
  }

  let clearedCount = 0;
  for (const r of residents) {
    if (r.password && r.password.trim() !== '') {
      const { error: updErr } = await supabase
        .from('residents')
        .update({ password: null })
        .eq('id', r.id);
        
      if (updErr) {
         console.error(`❌ Error clearing password for resident ${r.id}:`, updErr);
      } else {
         clearedCount++;
      }
    }
  }
  
  console.log(`✅ Cleared plaintext passwords for ${clearedCount} residents.`);
  console.log("🎉 Migration completed successfully.");
}

migrate();
