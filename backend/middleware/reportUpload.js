const multer = require("multer");
const path = require("path");
const fs = require("fs");

if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    // PDF
    "application/pdf",
    
    // Word Documents
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    
    // Text Files
    "text/plain",
    "text/csv",
    "application/json",
    
    // Audio Files
    "audio/mpeg",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/webm",
    "audio/ogg",
    
    // Video Files
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    
    // Excel/Spreadsheets
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    
    // RTF Documents
    "application/rtf",
    "text/rtf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

module.exports = upload;