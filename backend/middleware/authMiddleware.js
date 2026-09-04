const { supabaseAdmin } = require("../services/supabaseClient");

/**
 * Expects: Authorization: Bearer <supabase_access_token>
 * The frontend gets this token from supabase.auth.getSession() after login/register.
 * We verify it against Supabase Auth (source of truth) rather than trusting the client.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Missing bearer token" });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (err) {
    console.error("[authMiddleware] error:", err.message);
    return res.status(500).json({ error: "Auth verification failed" });
  }
}

module.exports = { requireAuth };
