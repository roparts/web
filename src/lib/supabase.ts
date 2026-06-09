import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
}

// Client for public reads (runs with anon permissions)
export const supabasePublic = createClient(
  supabaseUrl,
  supabaseAnonKey || ""
);

// Client for admin writes (runs with service_role bypass RLS permissions)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || ""
);
