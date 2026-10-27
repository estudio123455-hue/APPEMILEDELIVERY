import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const FALLBACK_URL = 'https://xlmxfatjupdvuqzzciuj.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhsbXhmYXRqdXBkdnVxenpjaXVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4Nzc3MTUsImV4cCI6MjEwODQ1MzcxNX0.1XDKcTWLUZtBPmr0zsPqalOxHZ9Pk8Qj7hFfG0b4xIA';

/**
 * Cliente de Supabase con permisos de Service Role para operaciones administrativas en servidor / cron / webhook.
 */
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    FALLBACK_ANON_KEY;

  return createClient<Database>(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
