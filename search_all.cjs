const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odbykhhepvlkdtgpokzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnlraGhlcHZsa2R0Z3Bva3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTA1NzgsImV4cCI6MjEwNDE4NjU3OH0.wcUA2adtUB2ZpNdpfU-jYHjp8Mgw-KEt_emkI-Qmccg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function searchAll() {
  const tables = ['profiles', 'residents', 'buildings', 'incidents', 'notices', 'tickets', 'finances'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      console.error(`Error querying ${table}:`, error.message);
    } else {
      console.log(`--- ${table} (${data.length} rows) ---`);
      const matched = data.filter(r => JSON.stringify(r).toLowerCase().includes('yacine') || JSON.stringify(r).includes('0668083673'));
      if (matched.length > 0) {
         console.log("MATCH FOUND:", JSON.stringify(matched, null, 2));
      }
    }
  }
}

searchAll();
