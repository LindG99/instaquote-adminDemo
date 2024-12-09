/* Testa anslutning till databas

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dvgnbolfsrhqfjfflple.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2Z25ib2xmc3JocWZqZmZscGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzMwMzQsImV4cCI6MjA0ODcwOTAzNH0.KLs-9R58OP5WMUfQJnCrwUABc5F0Zqp4v2GgBhLGyiM'; // Din API-nyckel
const supabase = createClient(supabaseUrl, supabaseKey);

(async () => {
  const { data, error } = await supabase.from('material').select('*');
  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('Connection successful, data:', data);
  }
})();
*/