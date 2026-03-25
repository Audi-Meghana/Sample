const Case = require("../models/caseModel");
const CaseAnalysis = require("../models/CaseAnalysis");
const History = require("../models/historyModel");
const axios = require("axios");
// ================== CREATE CASE ==================
exports.createCase = async (req, res) => {
  try {

    const { patientId, patientName, gestationalAge } = req.body;

    // ===== Duplicate Case ID =====
    const existingCase = await Case.findOne({ patientId });
    if (existingCase) {
      return res.status(400).json({
        message: "Case ID already exists"
      });
    }

    // ===== Name Validation =====
    if (!/^[A-Za-z\s]+$/.test(patientName)) {
      return res.status(400).json({
        message: "Patient name must contain only letters"
      });
    }

    // ===== Gestational Age Validation =====
    if (gestationalAge > 42) {
      return res.status(400).json({
        message: "Gestational age must be below or equal to 42 weeks"
      });
    }

    const newCase = await Case.create({
      ...req.body,
      doctorId: req.user.id
    });

    await History.create({
      doctorId: req.user.id,
      caseId: newCase._id,
      caseNumber: newCase.patientId,
      action: "CREATED",
      details: `New case created for patient ${newCase.patientName}`
    });

    res.status(201).json(newCase);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ================== GET ALL CASES ==================
exports.getDoctorCases = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { search, status, includeCompleted } = req.query;

    let filter = { doctorId };

    if (search) {
      filter.$or = [
        { patientId: { $regex: search, $options: "i" } },
        { patientName: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "All") {
      filter.status = status;
    }

    // includeCompleted:true means return all statuses; otherwise default is all (keep backwards compatibility)
    // If front-end needs strict filtering, it can handle it by itself (recommended for Gene Analysis dropdown).
    if (includeCompleted === "true") {
      // no status restriction (includes Completed + all statuses)
    }

    const cases = await Case.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ cases });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== GET SINGLE CASE ==================
exports.getCaseDetails = async (req, res) => {
  try {
    const caseData = await Case.findOne({
      _id: req.params.caseId,
      doctorId: req.user.id
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    const analysis = await CaseAnalysis.findOne({
      caseId: req.params.caseId
    });

    res.status(200).json({
      ...caseData.toObject(),
      analysis: analysis || null
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== UPDATE STATUS ==================

exports.updateCaseStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.caseId, doctorId: req.user.id },
      { status },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    // 🔥 ADD HISTORY WITH caseNumber
    await History.create({
      doctorId: req.user.id,
      caseId: updatedCase._id,
      caseNumber: updatedCase.patientId,   // ✅ VERY IMPORTANT
      action: "STATUS_CHANGED",
      details: `Status changed to "${status}" for patient ${updatedCase.patientName}`
    });

    res.json(updatedCase);

  } catch (error) {
    console.log("STATUS UPDATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// ================== UPDATE SUMMARY ==================
exports.updateCaseSummary = async (req, res) => {
  try {
    const { summary } = req.body;

    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.caseId, doctorId: req.user.id },
      { summary },
      { new: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    // 🔥 Auto History
    await History.create({
      doctorId: req.user.id,
      caseId: updatedCase._id,
      action: "Clinical Summary Updated",
      details: `Summary updated for patient ${updatedCase.patientName}`
    });

    res.json(updatedCase);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================== DELETE CASE ==================
exports.deleteCase = async (req, res) => {
  try {
    const caseId = req.params.caseId;

    // 1️⃣ Check if case exists and belongs to doctor
    const caseData = await Case.findOne({
      _id: caseId,
      doctorId: req.user.id
    });

    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // 2️⃣ Delete related analysis safely
    await CaseAnalysis.deleteMany({ caseId });

    // 3️⃣ Delete case
    await Case.findByIdAndDelete(caseId);

    // 4️⃣ Add history entry
    const History = require("../models/historyModel");

    await History.create({
      doctorId: req.user.id,
      caseId: caseId,
      caseNumber: caseData.patientId,  // 🔥 store case-001 before delete
      action: "DELETED",
      details: `Case for patient ${caseData.patientName} (ID: ${caseData.patientId}) was deleted`
    });

    res.json({ message: "Case deleted successfully" });

  } catch (error) {
    console.log("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};



// ================== UPDATE CASE ==================
exports.updateCase = async (req, res) => {
  try {
    const { patientName, gestationalAge, consanguinity, modeOfConception, status } = req.body;

    // ===== Name Validation =====
    if (patientName && !/^[A-Za-z\s]+$/.test(patientName)) {
      return res.status(400).json({
        message: "Patient name must contain only letters"
      });
    }

    // ===== Gestational Age Validation =====
    if (gestationalAge && gestationalAge > 42) {
      return res.status(400).json({
        message: "Gestational age must be below or equal to 42 weeks"
      });
    }

    const updatedCase = await Case.findOneAndUpdate(
      { _id: req.params.caseId, doctorId: req.user.id },
      { patientName, gestationalAge, consanguinity, modeOfConception, status },
      { new: true, runValidators: true }
    );

    if (!updatedCase) {
      return res.status(404).json({ message: "Case not found" });
    }

    await History.create({
      doctorId: req.user.id,
      caseId: updatedCase._id,
      caseNumber: updatedCase.patientId,
      action: "UPDATED",
      details: `Case updated for patient ${updatedCase.patientName}`
    });

    res.status(200).json(updatedCase);

  } catch (error) {
    console.log("UPDATE CASE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};