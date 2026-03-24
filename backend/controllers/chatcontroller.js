const aiService = require("../services/fastapiService");
const fs = require("fs");
const Conversation = require("../models/conversationModel");
const History = require("../models/historyModel");
const Message = require("../models/messageModel");
/*
=====================================
1️⃣ CHAT (File or Text)
=====================================
*/

exports.handleChat = async (req, res) => {
  try {
    const { text, gestation, conversationId } = req.body;

    console.log("REQ.FILE:", req.file);
    console.log("REQ.BODY:", req.body);

    // 🔥 Validate conversation
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID missing"
      });
    }

    // =====================================================
    // 🔥 CASE 1: FILE EXISTS (with or without text)
    // =====================================================
    if (req.file) {
      const result = await aiService.extractFile(
        req.file,
        gestation
      );

      // Save doctor message
      await Message.create({
        conversationId,
        sender: "doctor",
        text: text || "",
        analysisSource: "file",
        fileName: req.file.originalname
      });

      // Save AI response
      await Message.create({
        conversationId,
        sender: "ai",
        type: "analysis-complete",
        data: result,
        text: `Gene detected: ${result?.genetic?.gene || "Unknown"}`
      });

      // Delete uploaded file from server (safely)
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (deleteErr) {
        console.warn("Could not delete file:", req.file.path, deleteErr.message);
      }

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // =====================================================
    // 🔥 CASE 2: TEXT ONLY (NO FILE)
    // =====================================================
    if (!req.file && text) {
      const result = await aiService.extractText(
        text,
        gestation
      );
      if (!result?.genetic?.gene) {
    return res.status(200).json({
      success: false,
      message: "Gene not detected in dataset"
    });
  }


      // Save doctor message
      await Message.create({
        conversationId,
        sender: "doctor",
        text
      });

      // Save AI response
      await Message.create({
        conversationId,
        sender: "ai",
        type: "analysis-complete",
        data: result
      });

      return res.status(200).json({
        success: true,
        data: result
      });
    }

    // =====================================================
    // 🔥 CASE 3: NOTHING PROVIDED
    // =====================================================
    return res.status(400).json({
      success: false,
      message: "No input provided"
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/*
=====================================
2️⃣ Generate Checklist
=====================================
*/

exports.generateChecklist = async (req, res) => {
  try {
    const { gene, conversationId, reportType } = req.body;

    if (!gene) {
      return res.status(400).json({
        success: false,
        message: "Gene is required"
      });
    }

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required"
      });
    }

    let result;

    // ✅ Handle non-WES reports (CMA, SCAN, SERUM, etc.)
    if (gene === "NOT_APPLICABLE" || gene === "UNKNOWN" || gene === "QUOTA_EXHAUSTED") {
      result = {
        checklist: {
          core_prenatal_findings: [
            "Structural abnormalities detected",
            "Genetic markers present",
            "Clinical significance assessed",
            "Recommended follow-up actions"
          ],
          supportive_findings: [
            "Additional imaging findings",
            "Lab markers correlation",
            "Clinical correlation completed"
          ],
          negative_findings: [
            "No critical contraindications",
            "Family history considered",
            "Prognosis assessment"
          ]
        },
        metadata: {
          report_type: reportType || "CLINICAL",
          gene: gene,
          message: `${reportType || "Clinical"} report - Checklist generated from findings`
        }
      };
    } else {
      // ✅ WES — call FastAPI KB lookup
      try {
        result = await aiService.generateChecklist(gene);
      } catch (aiError) {
        console.error(
          "FastAPI Checklist Error:",
          aiError.response?.data || aiError.message
        );
        return res.status(200).json({
          success: false,
          message: "Checklist not available for this gene."
        });
      }

      if (!result || Object.keys(result).length === 0) {
        return res.status(200).json({
          success: false,
          message: "Checklist data not found for this gene."
        });
      }
    }

    // 🔥 SAVE CHECKLIST MESSAGE IN DB
    await Message.create({
      conversationId,
      sender: "ai",
      type: "checklist",
      data: result
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Checklist Controller Error:", error);

return res.status(500).json({
  success: false,
  message: "Checklist generation failed."
});
  }
};


/*
=====================================
3️⃣ Calculate PP4 / Clinical Risk Score
=====================================
*/
exports.calculatePP4 = async (req, res) => {
  try {
    const { gene, gestation, selections, extracted_data, reportType, conversationId } = req.body;
    const doctorId = req.user?.id;

    if (!gene || !gestation) {
      return res.status(400).json({
        success: false,
        message: "Gene and gestation are required"
      });
    }

    // ✅ Non-WES: Clinical Risk Score (CMA, SCAN, SERUM)
    if (gene === "NOT_APPLICABLE" || gene === "UNKNOWN" || gene === "QUOTA_EXHAUSTED") {
      if (!extracted_data) {
        return res.status(400).json({
          success: false,
          message: "Clinical findings (extracted_data) required for non-WES scoring"
        });
      }
      
      // Call FastAPI clinical risk scorer with actual report type (CMA, SCAN, SERUM)
      const result = await aiService.calculateClinicalRiskScore({
        report_type: reportType || gene,
        gestation,
        extracted_data
      });

      // 🔥 Get conversation title
      let conversationTitle = "N/A";
      if (conversationId) {
        const conversation = await Conversation.findById(conversationId);
        conversationTitle = conversation?.title || "Unknown";
      }

      await Message.create({
        conversationId,
        sender: "ai",
        type: "clinical-risk",
        data: result
      });

      // 🔥 Save history
      await History.create({
        doctorId,
        action: "CHAT_CLINICAL_RISK_CALCULATED",
        conversationId,
        conversationTitle,
        details: `Clinical Risk Scoring: Risk Level: ${result?.risk_level}, Final Score: ${result?.final_score}`
      });

      return res.status(200).json({
        success: true,
        data: result,
        type: "clinical-risk"
      });
    }

    // ✅ WES: PP4 Scoring
    if (!selections) {
      return res.status(400).json({
        success: false,
        message: "Selections required for WES scoring"
      });
    }

    const result = await aiService.calculatePP4({
      gene,
      gestation,
      selections
    });

    // 🔥 Get conversation title
    let conversationTitle = "N/A";

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      conversationTitle = conversation?.title || "Unknown";
    }
    
    await Message.create({
      conversationId,
      sender: "ai",
      type: "pp4",
      data: result
    });

    // 🔥 Save history
    await History.create({
      doctorId,
      action: "CHAT_PP4_CALCULATED",
      conversationId,
      conversationTitle,
      details: `Gene: ${gene}, Final Score: ${result.pp4_result.final_score}, State: ${result.pp4_result.state}`
    });

    return res.status(200).json({
      success: true,
      data: result,
      type: "pp4"
    });

  } catch (error) {
    console.error("PP4/Clinical Risk Error:", error.message);

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// controllers/chatController.js


exports.createConversation = async (req, res) => {
  try {
    const doctorId = req.user.id;

    // Count existing conversations of this doctor
    // 
   const conversations = await Conversation.find({ doctorId });

let maxNumber = 0;

conversations.forEach(conv => {
  const match = conv.title.match(/Conversation-(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (num > maxNumber) maxNumber = num;
  }
});

const title = `Conversation-${maxNumber + 1}`;

// Generate title like Conversation-1, 2, 3


const conversation = await Conversation.create({
  doctorId,
  title
});

    await History.create({
  doctorId,
  action: "CHAT_CONVERSATION_CREATED",
  conversationId: conversation._id,
  conversationTitle: conversation.title,
  message: `Conversation "${conversation.title}" created`
});

    res.json(conversation);

  } catch (error) {
    res.status(500).json({ message: "Failed to create conversation" });
  }
};


exports.deleteConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    const conversation = await Conversation.findById(id);

await Conversation.findByIdAndDelete(id);

await History.create({
  doctorId,
  action: "CHAT_CONVERSATION_DELETED",
  conversationId: id,
  conversationTitle: conversation?.title,
  message: `Conversation "${conversation?.title}" deleted`
});

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
};

exports.renameConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const doctorId = req.user.id;

   const conversation = await Conversation.findByIdAndUpdate(
  id,
  { title },
  { new: true }
);

    await History.create({
  doctorId,
  action: "CHAT_CONVERSATION_RENAMED",
  conversationId: id,
  conversationTitle: title,
  message: `Conversation renamed to "${title}"`
});

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Rename failed" });
  }
};


exports.getConversations = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const conversations = await Conversation.find({ doctorId })
      .sort({ createdAt: -1 });

    res.json(conversations);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};


exports.saveChecklistSummary = async (req, res) => {
  try {
    const { conversationId, selections } = req.body;

    await Message.create({
      conversationId,
      sender: "doctor",
      type: "checklist-summary",
      data: selections
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Failed to save checklist summary" });
  }
};

exports.saveSimpleMessage = async (req, res) => {
  try {
    const { conversationId, doctorText, aiText } = req.body;

    await Message.create({
      conversationId,
      sender: "doctor",
      text: doctorText
    });

    await Message.create({
      conversationId,
      sender: "ai",
      text: aiText
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ message: "Failed to save message" });
  }
};