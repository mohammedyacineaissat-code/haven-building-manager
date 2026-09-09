import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odbykhhepvlkdtgpokzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnlraGhlcHZsa2R0Z3Bva3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTA1NzgsImV4cCI6MjEwNDE4NjU3OH0.wcUA2adtUB2ZpNdpfU-jYHjp8Mgw-KEt_emkI-Qmccg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  let { data: nData } = await supabase.from('notices').select('*');
  if (nData) {
    nData.forEach(n => {
      if (JSON.stringify(n).toLowerCase().includes('majestic')) {
        console.log("Found in notices:", n.id);
      }
    });
  }
}

run();
