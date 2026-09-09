import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odbykhhepvlkdtgpokzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnlraGhlcHZsa2R0Z3Bva3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTA1NzgsImV4cCI6MjEwNDE4NjU3OH0.wcUA2adtUB2ZpNdpfU-jYHjp8Mgw-KEt_emkI-Qmccg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const tables = ['notices', 'incidents', 'tickets'];
  for (let table of tables) {
    let { data, error } = await supabase.from(table).select('*');
    if (data) {
      data.forEach(async (row) => {
        let str = JSON.stringify(row);
        if (str.includes('Le majestic') || str.includes('Résidence Le Majestic') || str.includes('Alger') || str.includes('Le Majestic (Alger)')) {
          console.log(`Found old text in ${table} ID: ${row.id}`);
        }
      });
    }
  }
}
run();
