const express = require("express");
const router = express.Router();
const caseController = require("../controllers/caseController");
const auth = require("../middleware/authMiddleware");

// ================= CREATE CASE =================
router.post("/", auth, caseController.createCase);

// ================= GET ALL CASES (SEARCH + FILTER) =================
router.get("/", auth, caseController.getDoctorCases);

// ================= GET SINGLE CASE (WITH ANALYSIS MERGED) =================
router.get("/:caseId", auth, caseController.getCaseDetails);

// ================= UPDATE STATUS =================
router.put("/:caseId/status", auth, caseController.updateCaseStatus);

// ================= UPDATE SUMMARY =================
router.put("/:caseId/summary", auth, caseController.updateCaseSummary);

router.put("/:caseId", auth, caseController.updateCase);
// ================= DELETE CASE =================
router.delete("/:caseId", auth, caseController.deleteCase);

module.exports = router;