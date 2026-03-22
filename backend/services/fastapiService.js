const axios    = require("axios");
const FormData = require("form-data");

const FASTAPI_URL = process.env.FASTAPI_URL || "http://127.0.0.1:8000";

exports.extractFile = async (file, gestation) => {
  const fd = new FormData();
  fd.append("file", file.buffer, {
    filename:    file.originalname,
    contentType: file.mimetype,
    knownLength: file.buffer.length
  });
  if (gestation) fd.append("gestation", String(gestation));
  
  // Route to appropriate endpoint based on file type
  let endpoint = "/extract-document"; // Generic document extractor
  
  if (file.mimetype === "application/pdf") {
    endpoint = "/extract-pdf";
  } else if (file.mimetype.startsWith("audio/")) {
    endpoint = "/extract-audio";
  } else if (file.mimetype.startsWith("video/")) {
    endpoint = "/extract-video";
  } else if (file.mimetype.includes("word") || file.mimetype.includes("document")) {
    endpoint = "/extract-document";
  } else if (file.mimetype === "text/plain") {
    endpoint = "/extract-text-file";
  } else if (file.mimetype.includes("sheet") || file.mimetype.includes("excel")) {
    endpoint = "/extract-spreadsheet";
  }
  
  const res = await axios.post(`${FASTAPI_URL}${endpoint}`, fd, {
    headers: { ...fd.getHeaders(), "Content-Length": fd.getLengthSync() },
    maxBodyLength: Infinity, maxContentLength: Infinity
  });
  return res.data;
};

exports.extractText = async (text, gestation) => {
  const res = await axios.post(`${FASTAPI_URL}/extract-text`, { text, gestation });
  return res.data;
};

exports.generateChecklist = async (gene) => {
  const res = await axios.post(`${FASTAPI_URL}/generate-checklist`, { gene });
  return res.data;
};

exports.calculatePP4 = async ({ gene, gestation, selections }) => {
  const res = await axios.post(`${FASTAPI_URL}/calculate-pp4`, { gene, gestation, selections });
  return res.data;
};

exports.calculateClinicalRiskScore = async ({ report_type, extracted_data }) => {
  const res = await axios.post(`${FASTAPI_URL}/calculate-risk-score`, { report_type, extracted_data });
  return res.data;
};