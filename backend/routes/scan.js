const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const { randomUUID } = require("node:crypto");
const { requireAuth } = require("../middleware/authMiddleware");
const { supabaseAdmin } = require("../services/supabaseClient");
const { runInference } = require("../services/yoloService");

const router = express.Router();
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
    }
    cb(null, true);
  },
});

const STORAGE_BUCKET = "fabric-images";

// URL microservice Python (ai_service.py) yang cuma handle XGBoost inference
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || "").trim().replace(/\/+$/, "");

/**
 * Panggil AI microservice (XGBoost) untuk prediksi kategori kualitas
 * berdasarkan jumlah defect hasil deteksi YOLO.
 * Fail-safe: kalau service ini down/belum di-set, jangan gagalkan seluruh scan --
 * cukup return null dan tetap lanjutkan proses dengan hasil YOLO saja.
 */
async function getQualityPrediction(jumlahDefect) {
  if (!AI_SERVICE_URL) {
    console.warn("[scan] AI_SERVICE_URL belum diset, skip prediksi kualitas");
    return null;
  }

  try {
    const response = await fetch(`${AI_SERVICE_URL}/predict-quality`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jumlah_defect: jumlahDefect }),
      timeout: 10000,
    });

    if (!response.ok) {
      console.error("[scan] AI service responded with error:", response.status);
      return null;
    }

    return await response.json();
  } catch (err) {
    console.error("[scan] Failed to call AI service:", err.message);
    return null;
  }
}

// POST /api/scan  (multipart/form-data: image, composition, structure, washing_condition, fabric_name)
router.post("/", requireAuth, upload.single("image"), async (req, res) => {
  let storedFilePath = null;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Field 'image' (file) is required" });
    }

    const { fabric_name, composition, structure, washing_condition } = req.body;

    const fabricData = {
      composition: safeJson(composition),
      structure: safeJson(structure),
      washing_condition: safeJson(washing_condition),
    };

    // 1. Upload gambar ke Supabase Storage
    const filePath = `${req.user.id}/${randomUUID()}-${sanitizeFilename(
      req.file.originalname || "capture.jpg"
    )}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("[scan] storage upload failed:", uploadError.message);
      return res.status(500).json({ error: "Failed to store fabric image" });
    }
    storedFilePath = filePath;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // 2. Deteksi defect via Roboflow (langsung, tanpa perantara)
    const inferenceResult = await runInference(req.file.buffer, fabricData);
    const jumlahDefect = (inferenceResult.detections || []).length;

    // 3. Prediksi kualitas via AI microservice (XGBoost) -- opsional, fail-safe
    const qualityPrediction = await getQualityPrediction(jumlahDefect);

    // 4. Simpan hasil analisis
    const { data: analysis, error: insertError } = await supabaseAdmin
      .from("fabric_analyses")
      .insert({
        user_id: req.user.id,
        fabric_name: fabric_name || "Kain tanpa nama",
        image_path: filePath,
        image_url: publicUrlData?.publicUrl || null,
        composition: fabricData.composition,
        structure: fabricData.structure,
        washing_condition: fabricData.washing_condition,
        detections: inferenceResult.detections || null,
        jumlah_defect: jumlahDefect,
        predicted_quality: qualityPrediction?.predicted_quality || null,
        prediction_confidence: qualityPrediction?.confidence || null,
        recommendation: inferenceResult.recommendation || null,
        raw_result: inferenceResult,
        result_source: inferenceResult.source || "unknown",
      })
      .select()
      .single();

    if (insertError) {
      console.error("[scan] insert failed:", insertError.message);
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([filePath]);
      return res.status(500).json({ error: "Failed to save analysis result" });
    }

    return res.status(201).json({ analysis });
  } catch (err) {
    console.error("[scan] unexpected error:", err.message);
    if (storedFilePath) {
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([storedFilePath]);
    }
    return res.status(500).json({ error: "Scan failed", detail: err.message });
  }
});

router.get("/history", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("fabric_analyses")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ analyses: data });
});


router.get("/insights/trend", requireAuth, async (req, res) => {
  const MIN_SCAN_FOR_TREND = 3;

  const { data: rows, error } = await supabaseAdmin
    .from("fabric_analyses")
    .select("jumlah_defect, detections, created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  if (!rows || rows.length < MIN_SCAN_FOR_TREND) {
    return res.json({
      jumlah_scan: rows?.length || 0,
      trend: null,
      insight_text: `Belum cukup data. Minimal ${MIN_SCAN_FOR_TREND} scan diperlukan (saat ini baru ${rows?.length || 0}).`,
    });
  }

  const defectList = rows.map((r) => r.jumlah_defect ?? 0);
  const midpoint = Math.floor(defectList.length / 2);
  const avgAwal = average(defectList.slice(0, midpoint));
  const avgAkhir = average(defectList.slice(midpoint));

  const selisih = avgAkhir - avgAwal;
  let trend, insightText;
  if (selisih > 1) {
    trend = "menurun";
    insightText = `Kualitas kain yang kamu scan cenderung menurun -- rata-rata jumlah defect naik dari ${avgAwal.toFixed(1)} ke ${avgAkhir.toFixed(1)} per scan.`;
  } else if (selisih < -1) {
    trend = "membaik";
    insightText = `Kualitas kain yang kamu scan cenderung membaik -- rata-rata jumlah defect turun dari ${avgAwal.toFixed(1)} ke ${avgAkhir.toFixed(1)} per scan.`;
  } else {
    trend = "stabil";
    insightText = `Kualitas kain yang kamu scan relatif stabil dalam ${rows.length} scan terakhir.`;
  }

  const allDefects = {};
  rows.forEach((r) => {
    (r.detections || []).forEach((d) => {
      allDefects[d.class] = (allDefects[d.class] || 0) + 1;
    });
  });
  const jenisPalingSering = Object.keys(allDefects).length
    ? Object.entries(allDefects).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  return res.json({
    jumlah_scan: rows.length,
    trend,
    insight_text: insightText,
    jenis_defect_paling_sering: jenisPalingSering,
    breakdown_semua_jenis: allDefects,
  });
});

router.get("/:id", requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("fabric_analyses")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Analysis not found" });
  return res.json({ analysis: data });
});

router.post("/compare", requireAuth, async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? [...new Set(req.body.ids)] : [];
  if (ids.length < 2 || ids.length > 3) {
    return res.status(400).json({ error: "Provide between 2 and 3 unique analysis ids" });
  }

  const { data, error } = await supabaseAdmin
    .from("fabric_analyses")
    .select("*")
    .eq("user_id", req.user.id)
    .in("id", ids);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ comparison: data });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const fabricName = typeof req.body.fabric_name === "string"
    ? req.body.fabric_name.trim()
    : "";

  if (!fabricName || fabricName.length > 120) {
    return res.status(400).json({ error: "fabric_name must contain between 1 and 120 characters" });
  }

  const { data, error } = await supabaseAdmin
    .from("fabric_analyses")
    .update({ fabric_name: fabricName })
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Analysis not found" });
  return res.json({ analysis: data });
});
router.post("/:id/whatif", requireAuth, async (req, res) => {
  const { data: original, error: fetchError } = await supabaseAdmin
    .from("fabric_analyses")
    .select("*")
    .eq("id", req.params.id)
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (fetchError) return res.status(500).json({ error: fetchError.message });
  if (!original) return res.status(404).json({ error: "Analysis not found" });

  try {
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(original.image_path);

    if (downloadError) throw downloadError;

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const fabricData = {
      composition: req.body.composition ?? original.composition,
      structure: req.body.structure ?? original.structure,
      washing_condition: req.body.washing_condition ?? original.washing_condition,
    };

    const inferenceResult = await runInference(buffer, fabricData);
    const jumlahDefect = (inferenceResult.detections || []).length;
    const qualityPrediction = await getQualityPrediction(jumlahDefect);

    const { data: scenario, error: insertError } = await supabaseAdmin
      .from("fabric_analyses")
      .insert({
        user_id: req.user.id,
        fabric_name: `${original.fabric_name} (What-if)`,
        image_path: original.image_path,
        image_url: original.image_url,
        composition: fabricData.composition,
        structure: fabricData.structure,
        washing_condition: fabricData.washing_condition,
        detections: inferenceResult.detections || null,
        jumlah_defect: jumlahDefect,
        predicted_quality: qualityPrediction?.predicted_quality || null,
        prediction_confidence: qualityPrediction?.confidence || null,
        recommendation: inferenceResult.recommendation || null,
        raw_result: inferenceResult,
        result_source: inferenceResult.source || "unknown",
        parent_analysis_id: original.id,
      })
      .select()
      .single();

    if (insertError) return res.status(500).json({ error: insertError.message });
    return res.status(201).json({ scenario, baseline: original });
  } catch (err) {
    console.error("[whatif] error:", err.message);
    return res.status(500).json({ error: "What-if simulation failed" });
  }
});

function safeJson(value) {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function average(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

module.exports = router;