import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL não foi encontrada.');
}

if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY não foi encontrada.');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);