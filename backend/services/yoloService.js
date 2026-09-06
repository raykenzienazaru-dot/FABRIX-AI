const fetch = require("node-fetch");

/**
 * ---------------------------------------------------------------------------
 * Roboflow Workflow integration
 * ---------------------------------------------------------------------------
 * This service calls a published Roboflow Workflow. The endpoint is built
 * from three env vars (matching how Roboflow presents them in its "Deploy"
 * screen):
 *
 *   ROBOFLOW_API_BASE   e.g. https://detect.roboflow.com
 *   ROBOFLOW_WORKSPACE  e.g. evelly-khanza
 *   ROBOFLOW_WORKFLOW_ID e.g. fabric-defect-detection_2025-tw6ok-ll8oy
 *
 * These are combined into:
 *   POST {ROBOFLOW_API_BASE}/infer/workflows/{ROBOFLOW_WORKSPACE}/{ROBOFLOW_WORKFLOW_ID}
 *   body: { "api_key": "...", "inputs": { "image": { "type": "base64", "value": "..." } } }
 *
 * (A single pre-built ROBOFLOW_WORKFLOW_URL env var is also still supported,
 * for backward compatibility / overriding the above.)
 *
 * Returns:
 *   {
 *     "outputs": [
 *       {
 *         "predictions": {
 *           "image": { "width": <int>, "height": <int> },
 *           "predictions": [
 *             {
 *               "x": <number>, "y": <number>,
 *               "width": <number>, "height": <number>,
 *               "confidence": <number 0-1>,
 *               "class": "<defect_class>",
 *               "class_id": <int>,
 *               "detection_id": "<uuid>"
 *             }
 *           ]
 *         }
 *       }
 *     ]
 *   }
 * ---------------------------------------------------------------------------
 */

const ROBOFLOW_API_BASE = (process.env.ROBOFLOW_API_BASE || "").trim().replace(/\/+$/, "");
const ROBOFLOW_WORKSPACE = (process.env.ROBOFLOW_WORKSPACE || "").trim();
const ROBOFLOW_WORKFLOW_ID = (process.env.ROBOFLOW_WORKFLOW_ID || "").trim();

// Preferred: build the URL from the three discrete vars above.
// Fallback: allow a fully-formed ROBOFLOW_WORKFLOW_URL to override/substitute.
const ROBOFLOW_WORKFLOW_URL = (
  process.env.ROBOFLOW_WORKFLOW_URL ||
  (ROBOFLOW_API_BASE && ROBOFLOW_WORKSPACE && ROBOFLOW_WORKFLOW_ID
    ? `${ROBOFLOW_API_BASE}/infer/workflows/${ROBOFLOW_WORKSPACE}/${ROBOFLOW_WORKFLOW_ID}`
    : "")
)
  .trim()
  .replace(/\/+$/, "");

const ROBOFLOW_API_KEY = process.env.ROBOFLOW_API_KEY;

const ALLOW_MOCK_INFERENCE =
  (process.env.ALLOW_MOCK_INFERENCE || "true").toLowerCase() === "true";

// Used only by the local mock fallback (dev/demo without a live Roboflow key).
const FABRIC_CLASSES = [
  "hole",
  "stain",
  "tear",
  "pilling",
  "snag",
  "discoloration",
];

// Rough, editable severity weights used to translate detected defect
// classes + confidence into the two indices the rest of the app displays.
const DEFECT_SEVERITY = {
  hole: 0.9,
  tear: 0.85,
  stain: 0.5,
  pilling: 0.35,
  snag: 0.4,
  discoloration: 0.45,
  loose_thread: 0.3,
  default: 0.4,
};

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function humanizeClass(cls) {
  return String(cls || "unknown").replace(/[_-]+/g, " ");
}

function buildWorkflowUrl() {
  return ROBOFLOW_WORKFLOW_URL;
}

function mockInference(imageBuffer) {
  const seed = imageBuffer ? imageBuffer.length : Math.floor(Math.random() * 999999);
  const rand = (min, max, salt = 0) => {
    const x = Math.sin(seed + salt) * 10000;
    const frac = x - Math.floor(x);
    return +(min + frac * (max - min)).toFixed(2);
  };

  const detectedClass = FABRIC_CLASSES[seed % FABRIC_CLASSES.length];
  const detections = [
    {
      class: detectedClass,
      class_id: seed % FABRIC_CLASSES.length,
      confidence: rand(0.55, 0.95, 3),
      x: rand(80, 400, 4),
      y: rand(80, 300, 5),
      width: rand(30, 120, 6),
      height: rand(30, 120, 7),
      detection_id: `mock-${seed}`,
    },
  ];

  const { microplastic_shedding_index, fabric_durability_index } =
    deriveIndicesFromDetections(detections);

  return {
    source: "mock",
    model: {
      provider: "roboflow",
    },
    image_meta: null,
    detections,
    prediction: {
      microplastic_shedding_index,
      fabric_durability_index,
      note:
        "Nilai ini adalah hasil MOCK untuk keperluan pengembangan. Roboflow workflow belum terhubung atau belum dikonfigurasi.",
    },
    recommendation: buildRecommendation(detections),
  };
}

function extractPredictions(payload) {
  const outputs = payload && payload.outputs;
  const firstOutput = Array.isArray(outputs) ? outputs[0] : outputs;
  const predictionsField = firstOutput ? firstOutput.predictions : payload && payload.predictions;

  if (Array.isArray(predictionsField)) return predictionsField;
  if (predictionsField && Array.isArray(predictionsField.predictions)) {
    return predictionsField.predictions;
  }
  return [];
}

function extractImageMeta(payload) {
  const outputs = payload && payload.outputs;
  const firstOutput = Array.isArray(outputs) ? outputs[0] : outputs;
  const predictionsField = firstOutput && firstOutput.predictions;
  return (predictionsField && predictionsField.image) || null;
}

function deriveIndicesFromDetections(detections) {
  if (!detections.length) {
    return {
      microplastic_shedding_index: 0.15,
      fabric_durability_index: 0.9,
    };
  }

  const severitySum = detections.reduce((sum, det) => {
    const key = String(det.class || "").toLowerCase().trim().replace(/\s+/g, "_");
    const severity = DEFECT_SEVERITY[key] ?? DEFECT_SEVERITY.default;
    const confidence = typeof det.confidence === "number" ? det.confidence : 0.5;
    return sum + severity * confidence;
  }, 0);

  const shedding = clamp01(0.1 + severitySum * 0.12);
  const durability = clamp01(0.95 - severitySum * 0.15);

  return {
    microplastic_shedding_index: round2(shedding),
    fabric_durability_index: round2(durability),
  };
}

function buildRecommendation(detections) {
  if (!detections.length) {
    return {
      material: "Tidak ada cacat kain yang terdeteksi pada gambar ini.",
      care: "Ikuti panduan perawatan standar untuk jenis kain ini.",
      alternative_composition: null,
    };
  }

  const classes = [...new Set(detections.map((d) => humanizeClass(d.class)))];
  return {
    material: `Jenis cacat terdeteksi: ${classes.join(", ")}. Periksa area yang ditandai sebelum digunakan/dikirim.`,
    care: "Tangani dengan hati-hati di sekitar area cacat; hindari pencucian/pengeringan dengan tegangan/suhu tinggi yang dapat memperparah kerusakan.",
    alternative_composition: "Pindai ulang setelah perbaikan (menjahit, menenun ulang) untuk memastikan cacat tidak lagi terdeteksi.",
  };
}

/**
 * @param {Buffer} imageBuffer 
 * @param {Object} fabricData 
 */
async function runInference(imageBuffer, fabricData = {}) {
  if (!ROBOFLOW_WORKFLOW_URL || !ROBOFLOW_API_KEY) {
    console.error(
      "[yoloService] Roboflow not configured. Check ROBOFLOW_API_BASE / ROBOFLOW_WORKSPACE / ROBOFLOW_WORKFLOW_ID (or ROBOFLOW_WORKFLOW_URL) and ROBOFLOW_API_KEY."
    );
    if (ALLOW_MOCK_INFERENCE) return mockInference(imageBuffer);
    throw new Error("Roboflow workflow URL or API key is not configured");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const base64Image = imageBuffer.toString("base64");

    const response = await fetch(buildWorkflowUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: ROBOFLOW_API_KEY,
        inputs: {
          image: { type: "base64", value: base64Image },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Roboflow workflow responded with status ${response.status}: ${errText}`);
    }

    const payload = await response.json();
    const rawDetections = extractPredictions(payload);
    const imageMeta = extractImageMeta(payload);

    const detections = rawDetections.map((det) => ({
      class: det.class,
      class_id: det.class_id,
      confidence: typeof det.confidence === "number" ? round2(det.confidence) : det.confidence,
      x: det.x,
      y: det.y,
      width: det.width,
      height: det.height,
      detection_id: det.detection_id,
    }));

    const { microplastic_shedding_index, fabric_durability_index } =
      deriveIndicesFromDetections(detections);

    return {
      source: "ai_service",
      model: {
        provider: "roboflow",
      },
      image_meta: imageMeta,
      detections,
      prediction: {
        microplastic_shedding_index,
        fabric_durability_index,
        note:
          detections.length > 0
            ? "Indeks berasal dari agregasi heuristik atas cacat kain yang terdeteksi Roboflow (bukan output langsung model)."
            : "Tidak ada cacat kain yang terdeteksi pada gambar ini.",
      },
      recommendation: buildRecommendation(detections),
      fabric_data: fabricData,
    };
  } catch (err) {
    const reason = err.name === "AbortError" ? "request timed out after 20s" : err.message;
    console.error("[yoloService] Roboflow workflow call failed:", reason);
    if (ALLOW_MOCK_INFERENCE) {
      console.warn("[yoloService] Falling back to mock inference.");
      return mockInference(imageBuffer);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  runInference,
  FABRIC_CLASSES,
};