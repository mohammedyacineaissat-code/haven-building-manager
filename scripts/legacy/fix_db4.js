import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odbykhhepvlkdtgpokzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnlraGhlcHZsa2R0Z3Bva3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTA1NzgsImV4cCI6MjEwNDE4NjU3OH0.wcUA2adtUB2ZpNdpfU-jYHjp8Mgw-KEt_emkI-Qmccg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  // Delete all buildings EXCEPT the Majestic one
  const { data, error } = await supabase
    .from('buildings')
    .delete()
    .neq('id', '45ab09da-d767-4ae1-bc14-b486cdfe12b4');
  
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Deleted old buildings:", data);
  }
}

run();
