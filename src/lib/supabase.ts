import { createClient } from "@supabase/supabase-js";

// Publishable anon key — safe to ship in the frontend.
const SUPABASE_URL = "https://mskyabdsvdcqcbvfwacf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1za3lhYmRzdmRjcWNidmZ3YWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMTIyNzIsImV4cCI6MjA5OTY4ODI3Mn0.PUM-D5-hRxJ7p1Pue_u-3g6nqVpc0YjK7XVvPFxcOzM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
