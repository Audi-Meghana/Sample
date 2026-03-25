// const express = require("express");
// const router = express.Router();
// const multer = require("multer");

// const geneController = require("../controllers/geneController");

// const upload = multer({ dest: "uploads/" });

const express = require("express");
const router = express.Router();

const upload = require("../middleware/reportUpload");  // 🔥 USE THIS
const geneController = require("../controllers/geneController");

router.post(
  "/analyze/:caseId",
  upload.single("file"),
  geneController.startAnalysis
);

router.post(
  "/checklist/:caseId",
  geneController.loadChecklist
);

router.post(
  "/calculate/:caseId",
  geneController.calculatePP4
);

module.exports = router;