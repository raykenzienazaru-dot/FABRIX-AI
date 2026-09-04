const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");
const { supabaseAdmin } = require("../services/supabaseClient");

const router = express.Router();

// GET /api/auth/me - current user + company profile
router.get("/me", requireAuth, async (req, res) => {
  const { data: profile, error } = await supabaseAdmin
    .from("company_profiles")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({
    user: { id: req.user.id, email: req.user.email },
    profile: profile || null,
  });
});

// POST /api/auth/company-profile - create or update the company profile
// Called right after Supabase Auth sign-up completes on the frontend.
router.post("/company-profile", requireAuth, async (req, res) => {
  const { company_name, industry, contact_name } = req.body;

  if (!company_name) {
    return res.status(400).json({ error: "company_name is required" });
  }

  const { data, error } = await supabaseAdmin
    .from("company_profiles")
    .upsert(
      {
        user_id: req.user.id,
        company_name,
        industry: industry || null,
        contact_name: contact_name || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ profile: data });
});

module.exports = router;
