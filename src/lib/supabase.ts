import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase'; // We'll assume a generated types file or standard any for now

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'; // Default local supabase
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlZmF1bHQiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjQ4NTI0MCwiZXhwIjoxOTMyMDYxMjQwfQ.eyJ1c2VyX2lkIjoiZGVmYXVsdCJ9'; // Default local anon key

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase URL or Anon Key is missing from environment variables. ' +
    'Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file. ' +
    'Falling back to default local Supabase credentials.'
  );
}

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
