const Case = require("../models/caseModel");
const History = require("../models/historyModel");
const fastapiService = require("../services/fastapiService");


// =============================
// Helper — format non-WES checklist
// =============================
function _formatNonWESChecklist(result) {
  const checklist = result?.checklist || [];
  if (Array.isArray(checklist)) {
    return checklist.map(item => item.task || item).filter(Boolean);
  }
  return [];
}


// =============================
// 1️⃣ START ANALYSIS
// =============================
exports.startAnalysis = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { type, text, gestation } = req.body;

    if (!caseId || caseId === "undefined") {
      return res.status(400).json({ message: "Invalid case ID" });
    }

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    const doctorId = req.user?.id || caseData.doctorId;

    let result;

    // 🔹 FILE INPUT
    if (req.file) {
      result = await fastapiService.extractFile(req.file, gestation);
    }
    // 🔹 TEXT INPUT
    else if (type === "text") {
      result = await fastapiService.extractText(text, gestation);
    }
    else {
      return res.status(400).json({ message: "Invalid input type" });
    }

    const reportType = result?.report_type || "WES";
    console.log("Report type detected:", reportType);

    // ✅ Handle non-WES reports (CMA, SCAN, SERUM)
    if (reportType !== "WES") {

      const updateData = {
        gene:           "NOT_APPLICABLE",
        variant:        null,
        gestation,
        report_type:    reportType,
        status:         "Under Review",
        checklistItems: _formatNonWESChecklist(result),
        // ✅ Save extracted data for risk scoring later
        extractedData:  result?.extracted || {}
      };

      if (req.file) {
        updateData.reportFile     = req.file.originalname;
        updateData.reportFileType = req.file.mimetype;
      }

      await Case.findByIdAndUpdate(caseId, updateData);

      await History.create({
        doctorId,
        caseId,
        caseNumber: caseData.patientId,
        action:     "GENE_ANALYSIS",
        details:    `${reportType} report processed. Clinical risk scoring available.`
      });

      return res.json(result);
    }

    // ✅ WES — stop if gene not detected
    if (
      !result?.genetic?.gene ||
      result.genetic.gene === "UNKNOWN" ||
      result.warning
    ) {
      return res.json(result);
    }

    // ✅ WES — save gene info
    const updateData = {
      gene:        result.genetic.gene,
      variant:     result.genetic.variant,
      gestation,
      report_type: "WES",
      status:      "Under Review"
    };

    if (req.file) {
      updateData.reportFile     = req.file.originalname;
      updateData.reportFileType = req.file.mimetype;
    }

    await Case.findByIdAndUpdate(caseId, updateData);

    await History.create({
      doctorId,
      caseId,
      caseNumber: caseData.patientId,
      action:     "GENE_ANALYSIS",
      details:    `Gene ${result.genetic.gene} extracted with variant ${result.genetic.variant}`
    });

    res.json(result);

  } catch (error) {
    console.error("Start Analysis Error:", error);
    res.status(500).json({ message: "Analysis failed" });
  }
};


// =============================
// 2️⃣ LOAD CHECKLIST
// =============================
exports.loadChecklist = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { gene } = req.body;

    console.log("Checklist caseId:", caseId);
    console.log("Checklist gene:", gene);

    if (!gene) {
      return res.status(400).json({ message: "Gene missing" });
    }

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    // ✅ Non-WES reports — return stored checklist from DB
    if (
      gene === "NOT_APPLICABLE" ||
      gene === "UNKNOWN"        ||
      gene === "QUOTA_EXHAUSTED"
    ) {
      const reportType  = caseData.report_type || "UNKNOWN";
      const storedItems = caseData.checklistItems || [];

      return res.json({
        checklist: [
          {
            title: "Clinical Action Items",
            items: storedItems
          }
        ],
        metadata: {
          report_type:  reportType,
          gene:         gene,
          message:      `${reportType} report — clinical checklist generated from findings`
        }
      });
    }

    // ✅ WES — call FastAPI KB lookup
    const fastapiResponse = await fastapiService.generateChecklist(gene);

    const formattedChecklist = [
      {
        title: "Core Findings",
        items: fastapiResponse.checklist?.core_prenatal_findings || []
      },
      {
        title: "Fetal Echo Findings",
        items: fastapiResponse.checklist?.fetal_echo_findings || []
      },
      {
        title: "Supportive Findings",
        items: fastapiResponse.checklist?.supportive_findings || []
      },
      {
        title: "Negative Findings",
        items: fastapiResponse.checklist?.negative_predictors || []
      }
    ];

    await Case.findByIdAndUpdate(caseId, {
      checklistMetadata: fastapiResponse.metadata
    });

    res.json({
      checklist: formattedChecklist,
      metadata:  fastapiResponse.metadata
    });

  } catch (error) {
    console.error("Checklist controller error:", error);
    res.status(500).json({ message: "Checklist failed" });
  }
};


// =============================
// 3️⃣ CALCULATE PP4 / CLINICAL RISK SCORE
// =============================
exports.calculatePP4 = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { gene, gestation, selections, extracted_data } = req.body;

    const caseData = await Case.findById(caseId);
    if (!caseData) {
      return res.status(404).json({ message: "Case not found" });
    }

    const doctorId   = req.user?.id || caseData.doctorId;
    const reportType = caseData.report_type || "WES";

    // ✅ Non-WES — calculate Clinical Risk Score
    if (
      gene === "NOT_APPLICABLE" ||
      gene === "UNKNOWN"        ||
      gene === "CMA"           ||
      gene === "SCAN"          ||
      gene === "SERUM"         ||
      reportType !== "WES"
    ) {
      // Use extracted_data from request if provided, otherwise from case
      const dataToUse = extracted_data || caseData.extractedData || {};
      
      console.log(`[calculatePP4] Non-WES path: reportType=${reportType}, extracted_data keys:`, Object.keys(dataToUse));
      
      // Call FastAPI clinical risk score endpoint
      const riskResult = await fastapiService.calculateClinicalRiskScore({
        report_type:   reportType,
        extracted_data: dataToUse
      });

      // Save to DB
      await Case.findByIdAndUpdate(caseId, {
        pp4: {
          rawScore:    riskResult.pp4_result?.raw_score   || 0,
          finalScore:  riskResult.pp4_result?.final_score || 0,
          riskLevel:   riskResult.summaries?.risk_level   || "Unknown",
          calculatedAt: new Date()
        },
        summary: riskResult.summaries?.doctor_summary || "",
        status:  "Completed"
      });

      await History.create({
        doctorId,
        caseId,
        caseNumber: caseData.patientId,
        action:     "RISK_SCORE",
        details:    `${reportType} Clinical Risk Score: ${riskResult.pp4_result?.final_score}, Risk: ${riskResult.summaries?.risk_level}`
      });

      return res.json(riskResult);
    }

    // ✅ WES — calculate PP4 as before
    const result = await fastapiService.calculatePP4({
      gene,
      gestation,
      selections
    });

    await Case.findByIdAndUpdate(caseId, {
      pp4: {
        rawScore:    result.pp4_result.raw_score,
        finalScore:  result.pp4_result.final_score,
        riskLevel:   result.summaries?.risk_level,
        calculatedAt: new Date()
      },
      summary: result.summaries?.doctor_summary || "",
      status:  "Completed"
    });

    await History.create({
      doctorId,
      caseId,
      caseNumber: caseData.patientId,
      action:     "PP4_RESULT",
      details:    `Final Score: ${result.pp4_result.final_score}, State: ${result.pp4_result.state}`
    });

    res.json(result);

  } catch (error) {
    console.error("PP4/Risk Score controller error:", error);
    res.status(500).json({ message: "Score calculation failed" });
  }
};