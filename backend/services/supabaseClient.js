const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[supabaseClient] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set. " +
      "Isi file .env terlebih dahulu (lihat .env.example)."
  );
}
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);

module.exports = { supabaseAdmin };
