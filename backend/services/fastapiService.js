const axios    = require("axios");
const FormData = require("form-data");
const fs       = require("fs");

const FASTAPI_URL = "http://127.0.0.1:8000";

// ─────────────────────────────────────────────────────────────
// HELPER — surface the real FastAPI error message upstream
// ─────────────────────────────────────────────────────────────
function fastapiError(err, fallback) {
  const detail =
    err.response?.data?.detail  ||
    err.response?.data?.error   ||
    err.response?.data?.message ||
    err.message                 ||
    fallback;
  const error    = new Error(detail);
  error.status   = err.response?.status || 500;
  error.upstream = detail;
  throw error;
}

// ─────────────────────────────────────────────────────────────
// HELPER — delete temp multer file silently
// ─────────────────────────────────────────────────────────────
function cleanup(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch (_) {}
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER — resolve clean MIME type from file object
// Handles "audio/webm;codecs=opus" → "audio/webm"
// Handles missing / octet-stream by inferring from extension
// ─────────────────────────────────────────────────────────────
function resolveMime(file) {
  const raw      = (file.mimetype || "").toLowerCase();
  const baseMime = raw.split(";")[0].trim();

  if (!baseMime || baseMime === "application/octet-stream") {
    const ext = (file.originalname || "").split(".").pop().toLowerCase();
    const extMap = {
      webm: "audio/webm",
      mp3:  "audio/mpeg",
      wav:  "audio/wav",
      ogg:  "audio/ogg",
      mp4:  "audio/mp4",
      m4a:  "audio/mp4",
      pdf:  "application/pdf",
      txt:  "text/plain",
      doc:  "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls:  "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      csv:  "text/csv",
      rtf:  "application/rtf",
    };
    return extMap[ext] || "application/octet-stream";
  }

  return baseMime;
}

// ─────────────────────────────────────────────────────────────
// HELPER — pick FastAPI endpoint from MIME type
// ─────────────────────────────────────────────────────────────
function pickEndpoint(mime) {
  if (mime === "application/pdf")                                              return "/extract-pdf";
  if (mime.startsWith("audio/"))                                               return "/extract-audio";
  if (mime.startsWith("video/"))                                               return "/extract-video";
  if (mime === "text/plain")                                                   return "/extract-text-file";
  if (mime.includes("word") || mime.includes("document"))                     return "/extract-document";
  if (mime.includes("sheet") || mime.includes("excel") || mime === "text/csv") return "/extract-spreadsheet";
  if (mime.includes("rtf"))                                                    return "/extract-document";
  return "/extract-pdf"; // fallback
}

// ─────────────────────────────────────────────────────────────
// 1. EXTRACT FROM FILE (PDF / audio / video / documents)
// ─────────────────────────────────────────────────────────────
exports.extractFile = async (file, gestation) => {
  if (!file?.path || !fs.existsSync(file.path)) {
    throw new Error("Uploaded file not found on disk.");
  }

  const cleanMime = resolveMime(file);
  const endpoint  = pickEndpoint(cleanMime);

  console.log(`[fastapiService] extractFile → endpoint: ${endpoint}, mime: ${cleanMime}, file: ${file.originalname}`);

  const form = new FormData();
  form.append("file", fs.createReadStream(file.path), {
    filename:    file.originalname || "upload",
    contentType: cleanMime,
  });
  if (gestation) form.append("gestation", String(gestation));

  try {
    const res = await axios.post(`${FASTAPI_URL}${endpoint}`, form, {
      headers:          { ...form.getHeaders() },
      timeout: endpoint === "/extract-video" ? 600_000 : 120_000,
      maxContentLength: Infinity,
      maxBodyLength:    Infinity,
    });

    console.log(`[fastapiService] extractFile success:`, JSON.stringify(res.data).slice(0, 300));

    // ✅ FIX: Always return FastAPI response as-is.
    // FastAPI's ReportDetector already correctly identifies WES/SCAN/CMA/SERUM.
    // Never override report_type here — that was causing audio WES reports
    // to be wrongly forced to SCAN when gene was UNKNOWN.
    //
    // If gene is UNKNOWN for a WES audio report, geneController will show
    // a "gene not detected" warning and let the user retry — which is correct.
    return res.data;

  } catch (err) {
    console.error(`[fastapiService] extractFile error (${endpoint}):`, err.response?.data || err.message);
    fastapiError(err, "File extraction failed.");
  } finally {
    cleanup(file.path); // always delete temp file
  }
};

// ─────────────────────────────────────────────────────────────
// 2. EXTRACT FROM PLAIN TEXT
// ─────────────────────────────────────────────────────────────
exports.extractText = async (text, gestation) => {
  if (!text || text.trim().length < 10)
    throw new Error("Text input is too short to analyse.");
  try {
    const res = await axios.post(
      `${FASTAPI_URL}/extract-text`,
      { text: text.trim(), gestation: gestation || null },
      { timeout: 30_000 }
    );
    return res.data;
  } catch (err) {
    console.error("[fastapiService] extractText error:", err.response?.data || err.message);
    fastapiError(err, "Text extraction failed.");
  }
};

// ─────────────────────────────────────────────────────────────
// 3. GENERATE CHECKLIST
// ─────────────────────────────────────────────────────────────
exports.generateChecklist = async (gene) => {
  if (!gene) throw new Error("Gene symbol is required.");
  try {
    const res = await axios.post(
      `${FASTAPI_URL}/generate-checklist`,
      { gene },
      { timeout: 30_000 }
    );
    return res.data;
  } catch (err) {
    console.error("[fastapiService] generateChecklist error:", err.response?.data || err.message);
    fastapiError(err, "Checklist generation failed.");
  }
};

// ─────────────────────────────────────────────────────────────
// 4. CALCULATE PP4
// ─────────────────────────────────────────────────────────────
exports.calculatePP4 = async (payload) => {
  if (!payload?.gene)       throw new Error("Gene is required for PP4.");
  if (!payload?.selections) throw new Error("Selections are required for PP4.");
  try {
    const res = await axios.post(
      `${FASTAPI_URL}/calculate-pp4`,
      payload,
      { timeout: 30_000 }
    );
    return res.data;
  } catch (err) {
    console.error("[fastapiService] calculatePP4 error:", err.response?.data || err.message);
    fastapiError(err, "PP4 calculation failed.");
  }
};

// ─────────────────────────────────────────────────────────────
// 5. CALCULATE CLINICAL RISK SCORE (non-WES)
// ─────────────────────────────────────────────────────────────
exports.calculateClinicalRiskScore = async (payload) => {
  if (!payload?.report_type) throw new Error("Report type is required.");
  try {
    const res = await axios.post(
      `${FASTAPI_URL}/calculate-risk-score`,
      payload,
      { timeout: 30_000 }
    );
    return res.data;
  } catch (err) {
    console.error("[fastapiService] calculateClinicalRiskScore error:", err.response?.data || err.message);
    fastapiError(err, "Clinical risk score calculation failed.");
  }
};