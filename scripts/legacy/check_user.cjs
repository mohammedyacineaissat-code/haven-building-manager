const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odbykhhepvlkdtgpokzy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnlraGhlcHZsa2R0Z3Bva3p5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg2MTA1NzgsImV4cCI6MjEwNDE4NjU3OH0.wcUA2adtUB2ZpNdpfU-jYHjp8Mgw-KEt_emkI-Qmccg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log("Attempting to sign in with Yacine's credentials...");
  
  const email = '0668083673@haven.dz';
  const password = 'test123';
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error("Sign in failed:", error.message);
  } else {
    console.log("Sign in successful!");
    console.log("User data from auth.users:", JSON.stringify(data.user, null, 2));
    
    // Check if profile exists for this user id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.log("No profile found for this user id:", profileError.message);
    } else {
      console.log("Profile found:", profileData);
    }
  }
}

checkUser();
