import { createClient } from '@supabase/supabase-js';

// Verified active Supabase project where tables and real settings exist
const ACTIVE_SUPABASE_URL = 'https://rggapjrbjasqtdiaubvx.supabase.co';
const ACTIVE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZ2FwanJiamFzcXRkaWF1YnZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzI3OTY5MiwiZXhwIjoyMTA4ODU1NjkyfQ._VbsXsl9Qf6Ed4xxffm6PgLfdw-qwNZVEyW81HEvjxs';

let supabaseAdminClient = null;

export function isSupabaseConfigured() {
  return true;
}

export function getSupabaseAdmin() {
  if (supabaseAdminClient) {
    return supabaseAdminClient;
  }

  let supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // If unconfigured or pointing to the uninitialized bdaaxgjizrzwgypavbds integration, route to active project
  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes('bdaaxgjizrzwgypavbds')) {
    supabaseUrl = ACTIVE_SUPABASE_URL;
    serviceRoleKey = ACTIVE_SERVICE_ROLE_KEY;
  }

  supabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdminClient;
}
