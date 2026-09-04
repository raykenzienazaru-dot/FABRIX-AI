require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scan");

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "fabrix-ai-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/scan", scanRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler (e.g. multer errors)
app.use((err, req, res, next) => {
  console.error("[unhandled]", err);
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Image exceeds the 8MB limit" });
  }
  if (err?.message?.startsWith("Only JPEG")) {
    return res.status(400).json({ error: err.message });
  }
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`FABRIX AI backend running on http://localhost:${PORT}`);
});
