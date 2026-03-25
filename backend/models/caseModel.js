const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    patientId: {
      type: String,
      required: true,
      trim: true
    },

    patientName: {
      type: String,
      required: true,
      trim: true
    },

    gestationalAge: {
      type: Number,
      required: true,
      min: 1
    },

    consanguinity: {
      type: String,
      enum: ["Yes", "No"],
      required: true
    },

    modeOfConception: {
      type: String,
      enum: ["Natural", "IVF", "IUI", "ICSI"],
      required: true
    },

    status: {
      type: String,
      enum: ["Uploaded", "Under Review", "Completed"],
      default: "Uploaded"
    },

    // 📄 Uploaded report file path
    reportFile: {
      type: String
    },

    reportFileType: {
      type: String
    },

    // 🧬 Gene Analysis Data
    gene: {
      type: String
    },

    variant: {
      type: String
    },

    report_type: {
      type: String,
      enum: ["WES", "CMA", "SCAN", "SERUM"]
    },

    checklistItems: [{
      type: String
    }],

    extractedData: {
      type: mongoose.Schema.Types.Mixed
    },

    checklistMetadata: {
      type: mongoose.Schema.Types.Mixed
    },

    // 🧠 PP4 Analysis Result
    pp4: {
      rawScore: Number,
      finalScore: Number,
      riskLevel: String,
      calculatedAt: Date
    },

    // 📝 Case Summary Section
    summary: {
  type: String,
  trim: true
}

  },
  { timestamps: true }
);

// Prevent duplicate patientId per doctor
caseSchema.index({ doctorId: 1, patientId: 1 }, { unique: true });

module.exports = mongoose.model("Case", caseSchema);