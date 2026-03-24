import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import CustomSelect from "../../components/doctor/CustomSelect";
import { jsPDF } from "jspdf";
import axios from "axios";
import "../../styles/doctor/app.css";
import "../../styles/doctor/GeneAnalysis.css";
import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import API from "../../services/api";


import {
  Dna,
  AlertTriangle,
  UploadCloud,
  FileText,
  X,
  CheckCircle,ChevronDown, ChevronUp,
  DownloadCloud,
  Share2,
  MicIcon
} from "lucide-react";

export default function GeneAnalysis() {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 768);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [pp4Calculated, setPp4Calculated] = useState(false);
  const [openCategory, setOpenCategory] = useState(0);
  const [pp4Result, setPp4Result] = useState(null);
const [animatedFinal, setAnimatedFinal] = useState(0);
  const [uploadMode, setUploadMode] = useState("file"); 
  // "file" | "voice"
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [voiceText, setVoiceText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [voiceSubmitted, setVoiceSubmitted] = useState(false);
  const [submittedText, setSubmittedText] = useState("");
  
  // Live transcription states
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState(null);
  
  const navigate = useNavigate();



const [cases, setCases] = useState([]);
const [geneData, setGeneData] = useState(null);
const [backendChecklist, setBackendChecklist] = useState([]);

const [phone, setPhone] = useState("");
const [showWhatsappInput, setShowWhatsappInput] = useState(false);

useEffect(() => {
  const selected = cases.find(c => c._id === selectedCase);

  if (selected?.status === "Completed") {
    alert("This case is already completed. Further analysis not allowed.");
    setSelectedCase("");
  }
}, [selectedCase, cases]);



useEffect(() => {
  if (pp4Calculated && pp4Result?.pp4_result?.final_score) {
    let start = 0;
    const end = pp4Result.pp4_result.final_score;
    const duration = 600;
    const increment = end / (duration / 16);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      setAnimatedFinal(Number(start.toFixed(2)));
    }, 16);
  }
}, [pp4Calculated]);






// Initialize Web Speech API
useEffect(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsTranscribing(true);
      setLiveTranscript("");
    };

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setLiveTranscript(finalTranscript + interimTranscript);
      setVoiceText((prev) => prev + finalTranscript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech" && event.error !== "audio-capture") {
        alert(`Transcription error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsTranscribing(false);
    };

    setRecognitionRef(recognition);
  } else {
    console.warn("Web Speech API not supported in this browser");
  }

  return () => {
    if (recognitionRef) {
      recognitionRef.abort();
    }
  };
}, []);

useEffect(() => {
  const fetchCases = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/cases",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const filteredCases = response.data.cases.filter(
  c => c.status === "Uploaded" || c.status === "Under Review"
);

setCases(filteredCases);

    } catch (error) {
      console.error("Failed to load cases", error);
    }
  };

  fetchCases();
}, []);

const handleShareWhatsApp = () => {
  if (!phone) {
    alert("Please enter WhatsApp number");
    return;
  }

  const cleanedPhone = phone.replace(/\D/g, "");

  if (cleanedPhone.length < 10) {
    alert("Enter valid number with country code");
    return;
  }

  const currentCase = cases.find(c => c._id === selectedCase);

  if (!currentCase) {
    alert("Case data not found.");
    return;
  }

  const confirmSend = window.confirm(
    `Send report to ${cleanedPhone}?`
  );

  if (!confirmSend) return;

  const message = `
🧬 Prenatal AI Report

👤 Patient: ${currentCase.patientName}
🆔 Case ID: ${currentCase.patientId}

🧬 Gene: ${geneData?.gene || "-"}
📊 PP4 Score: ${pp4Result?.pp4_result?.final_score || "-"}
⚠ Risk: ${pp4Result?.summaries?.risk_level || "-"}

📝 Interpretation:
${pp4Result?.summaries?.doctor_summary || "-"}

Regards,
Prenatal AI Team
  `;

  const encodedMessage = encodeURIComponent(message);

  const whatsappURL = `https://wa.me/${cleanedPhone}?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");
};







    const handleRemoveFile = () => {
        setAnalysisStarted(false);
        setTimeout(() => {
            setFile(null);
            setPp4Calculated(false);
            setPp4Result(null);
            setChecklist({});
        }, 200);
    };
const resetAnalysisState = () => {
  setFile(null);
  setAudioBlob(null);
  setSubmittedText("");
  setVoiceText("");

  setAnalysisStarted(false);
  setPp4Calculated(false);
  setPp4Result(null);
  setGeneData(null);
  setBackendChecklist([]);
};


const handleCalculate = async () => {
  if (pp4Calculated) {
    alert("PP4 already calculated. Please upload new report to recalculate.");
    return;
  }

  const activeChecklist = backendChecklist || [];

  const allItems = activeChecklist
    .filter(category => category.items && category.items.length > 0)
    .flatMap(category => category.items);

  // Validate
  for (let item of allItems) {
    if (!checklist[item]) {
      alert("⚠️ Please fill all Targeted Checklist options before calculating PP4.");
      return;
    }
  }

  try {

    // 🔥 Prepare selections structure for backend
    const selections = {
      core: {},
      supportive: {},
      negative: {}
    };

    activeChecklist.forEach(category => {
  category.items.forEach(item => {

    const value = checklist[item];

    if (
      category.title === "Core Findings" ||
      category.title === "Fetal Echo Findings"
    ) {
      selections.core[item] = value;
    }

    if (category.title === "Supportive Findings") {
      selections.supportive[item] = value;
    }

    if (category.title === "Negative Findings") {
      selections.negative[item] = value;
    }

  });
});
console.log("SELECTIONS SENT:", selections);

    const response = await API.post(
  `/gene/calculate/${selectedCase}`,
  {
    gene: geneData?.gene,
    gestation: 20,
    selections
  }
);


    const result = response.data;

    // 🔥 Map backend response to your UI format

// setPp4Result({
//   raw: result.pp4_result.raw_score,
//   multiplier: result.pp4_result.multiplier,
//   final: result.pp4_result.final_score,
//   pp4State: result.pp4_result.state,          // ACMG rule result
//   riskLevel: result.summaries?.risk_level,    // Clinical risk
//   summary: result.summaries?.doctor_summary || ""
// });

setPp4Result(result);


console.log("PP4 BACKEND RESPONSE:", result);

    setPp4Calculated(true);

    // 🔥 Move case to Completed automatically
await API.put(`/cases/${selectedCase}/status`, {
  status: "Completed"
});

  } catch (error) {
    console.error("PP4 error:", error);
    alert("PP4 calculation failed");
  }
};

    const [checklist, setChecklist] = useState({
        coloboma: "",
        heartDefects: "",
        choanalAtresia: ""
    });

  
    

 const allowedTypes = [
  "application/pdf",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "video/mp4",
  "audio/webm"
];


    const validateChecklist = () => {
        const allItems = checklistData.flatMap((cat) => cat.items);

        for (let item of allItems) {
            if (!checklist[item]) {
            return false;
            }
        }

        return true;
        };




const handleDownloadPDF = () => {
  if (!pp4Result || !pp4Result.pp4_result) {
    alert("Please calculate PP4 score before downloading.");
    return;
  }

  const doc = new jsPDF();

  // Extract correct values from nested object
  const rawScore = pp4Result?.pp4_result?.raw_score ?? "N/A";
  const multiplier = pp4Result?.pp4_result?.multiplier ?? "N/A";
  const finalScore = animatedFinal ?? "N/A";
  const state = pp4Result?.pp4_result?.state?.replace(/_/g, " ") ?? "N/A";
  const riskLevel = pp4Result?.summaries?.risk_level ?? "N/A";
  const summary =
    pp4Result?.summaries?.doctor_summary ||
    "No clinical summary available.";

  // Title
  doc.setFontSize(18);
  doc.text("PP4 Analysis Summary", 20, 20);

  doc.setFontSize(12);

  // Gene Info (if available)
 doc.text(`Gene Name: ${geneData?.gene || "N/A"}`, 20, 35);
doc.text(`Variant: ${geneData?.variant || "N/A"}`, 20, 45);

  // Score Panel
  doc.text("PP4 Score Panel", 20, 60);
  doc.text(`Raw Score: ${rawScore}`, 20, 70);
  doc.text(`Multiplier: ×${multiplier}`, 20, 80);
  doc.text(`Final Score: ${finalScore}`, 20, 90);
  doc.text(`State: ${state}`, 20, 100);
  doc.text(`Risk Level: ${riskLevel}`, 20, 110);

  // Reasoning Summary (auto wrap)
  doc.text("Reasoning Summary:", 20, 125);

  const splitSummary = doc.splitTextToSize(summary, 170);
  doc.text(splitSummary, 20, 135);

  // Save file
  doc.save("PP4_Analysis_Report.pdf");
};
 

  const canStartAnalysis =
  selectedCase &&
  (
    file ||
    audioBlob ||
    submittedText
  );

 const handleFile = (selectedFile) => {
  if (!selectedFile) return;

  if (!selectedCase) {
    alert("Please select a case first.");
    return;
  }

  if (!allowedTypes.includes(selectedFile.type)) {
    alert("Only PDF, MP3, WAV and MP4 files are allowed.");
    return;
  }

  if (selectedFile.size > 50 * 1024 * 1024) {
    alert("File size must be less than 50MB.");
    return;
  }

  setFile(selectedFile);
};

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    setVoiceSubmitted(false);
  };
    
        


const handleMicClick = async () => {
  if (!isRecording) {
    // Start Recording with Live Transcription
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      let chunks = [];

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        console.log("Audio ready to upload:", blob);
        chunks = [];
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      
      // Start live transcription
      if (recognitionRef) {
        recognitionRef.start();
      }

    } catch (error) {
      alert("Microphone permission denied.");
    }
  } else {
    // Stop Recording and Transcription
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    
    // Stop transcription
    if (recognitionRef) {
      recognitionRef.stop();
    }
    
    // Finalize the transcribed text
    if (liveTranscript.trim()) {
      setVoiceText((prev) => prev.trim());
    }
  }
};

const handleUploadToBackend = async () => {
  if (!selectedCase) {
    alert("Please select a case first.");
    return;
  }

  if (!file && !audioBlob && !submittedText) {
    alert("Please upload a file or provide voice input.");
    return;
  }

  try {

    setAnalysisLoading(true);
    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }

    if (audioBlob) {
      formData.append("file", audioBlob, "voice.webm");
    }

    if (submittedText) {
      formData.append("type", "text");
      formData.append("text", submittedText);
    }

    // 1️⃣ START ANALYSIS
    const analysisRes = await API.post(
      `/gene/analyze/${selectedCase}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );

    const result = analysisRes.data;

    console.log("Analysis success:", result);
    // 🔥 Automatically move case to Under Review
await API.put(`/cases/${selectedCase}/status`, {
  status: "Under Review"
});

    // 🚨 STOP if gene not detected
   if (
  !result?.genetic?.gene ||
  result.genetic.gene === "UNKNOWN" ||
  result.warning
) {
  alert(result.warning || "Gene not detected in report.");
  setAnalysisLoading(false);
  return;
}

    // Save gene + variant
    setGeneData(result.genetic);

    // 2️⃣ LOAD CHECKLIST
    const checklistRes = await API.post(
      `/gene/checklist/${selectedCase}`,
      {
        gene: result.genetic.gene
      }
    );

    console.log("Checklist loaded:", checklistRes.data);

    setBackendChecklist(checklistRes.data.checklist);

setGeneData(prev => ({
  ...prev,
  visibility_class: checklistRes.data.metadata?.visibility_class,
  visibility_score: checklistRes.data.metadata?.visibility_score,
  confidence_factor: checklistRes.data.metadata?.confidence_factor
}));

    setAnalysisStarted(true);
    // setAnalysisLoading(false);

    alert("Analysis started successfully!");

  } catch (error) {
    console.error("Upload failed:", error);

    alert(
      error.response?.data?.message ||
      "Upload failed. Please try again."
    );

      setAnalysisLoading(false);
  }
};



  return (
    <div className="app">
      <Sidebar
        collapsed={collapsed}
        toggle={() => setCollapsed(!collapsed)}
      />

      <div className={`main ${collapsed ? "collapsed" : ""}`}>
        <Topbar />

        <div className="dashboard gene-page">

          {/* PAGE HEADER */}
          <div className="gene-header">
            <div className="gene-icon">
              <Dna size={22} />
            </div>
            <div>
              <h1>Gene Analysis</h1>
              <p>Clinical genetic analysis engine</p>
            </div>
          </div>

          {/* DISCLAIMER */}
          <div className="disclaimer">
            <AlertTriangle size={18} className="warn-icon" />
            <div>
              <h4>Clinical Disclaimer</h4>
              <p>
                This system provides decision support only. PP4 scores do not
                modify ACMG classifications. All findings must be verified by
                qualified medical professionals before clinical decisions.
              </p>
            </div>
          </div>

          {/* SELECT SECTION */}
          <div className="gene-select-card">
            <div className="gene-select-grid">

              <div className="field">
                <label>Select Case</label>
                <CustomSelect
  options={cases.map(c => ({
  label: `${c.patientId} - ${c.patientName}`,
  value: c._id
}))}
  value={selectedCase}
  onChange={setSelectedCase}
  placeholder="Choose a case..."
/>
              </div>

              

            </div>
          </div>

          {/* UPLOAD SECTION */}
          
          <div className="upload-card">

            
            <div
              className={`upload-toggle ${
                uploadMode === "voice" ? "voice-active" : ""
              }`}
            >
              {/* <button
                className={uploadMode === "file" ? "active" : ""}
                onClick={() => setUploadMode("file")}
              >
                File Upload
              </button>

              <button
                className={uploadMode === "voice" ? "active" : ""}
                onClick={() => setUploadMode("voice")}
              >
                Voice Assistant
              </button> */}
<button
  className={uploadMode === "file" ? "active" : ""}
  onClick={() => {
    resetAnalysisState();
    setUploadMode("file");
  }}
>
  File Upload
</button>

<button
  className={uploadMode === "voice" ? "active" : ""}
  onClick={() => {
    resetAnalysisState();
    setUploadMode("voice");
  }}
>
  Voice Assistant
</button>


            </div>



            <div className="upload-header">
              <UploadCloud size={20} />
              <h3>Upload Genetic Report</h3>
            </div>

            

            {uploadMode === "file" && (
  <>
    {!file ? (
      <div
        className={`upload-drop ${dragActive ? "active" : ""}`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() =>
          document.getElementById("fileInput").click()
        }
      >
        <div className="upload-icon">
          <UploadCloud size={26} />
        </div>
        <p>Drag & drop your file here, or click to browse</p>
        <span>Supports multimedia files</span>

        <input
          id="fileInput"
          type="file"
          hidden
          accept="image/*,audio/*,video/*,text/*,.pdf,.json"
          onChange={(e) =>
            handleFile(e.target.files[0])
          }
        />
      </div>
    ) : (
      <div className="file-preview animate-in">
        <div className="file-left">
          <FileText size={22} />
          <div>
            <h4>{file.name}</h4>
            <p>{(file.size / 1024).toFixed(2)} KB</p>
          </div>
        </div>

        <div className="file-right">
          <CheckCircle size={18} className="success-icon" />
          <X
            size={18}
            className="remove-icon"
            onClick={handleRemoveFile}
          />
        </div>
      </div>
    )}
  </>
)}
{uploadMode === "voice" && (
  <div className="voice-container">
    <input
      type="text"
      placeholder="Speak or type your clinical findings..."
      value={voiceText}
      onChange={(e) => {
        setVoiceText(e.target.value);
        setVoiceSubmitted(false);
      }}
      onKeyDown={(e) => {
       if (e.key === "Enter") {
  if (!selectedCase) {
    alert("Please select a case first.");
    return;
  }

  if (voiceText.trim() === "") return;

  e.preventDefault();
  setVoiceSubmitted(true);
  setSubmittedText(voiceText);
  setVoiceText("");
  setLiveTranscript("");
}
      }}
    />

    {/* Live Transcription Display */}
    {isRecording && liveTranscript && (
      <div className="live-transcript">
        <p className="transcript-label">Live Transcript:</p>
        <p className="transcript-text">{liveTranscript}</p>
      </div>
    )}

    {isTranscribing && !liveTranscript && isRecording && (
      <div className="listening-indicator">
        <span className="pulse"></span> Listening...
      </div>
    )}

    <button
      className={`mic-btn ${isRecording ? "recording" : ""}`}
      onClick={handleMicClick}
      title={isRecording ? "Stop recording & transcription" : "Start recording & transcription"}
    >
      <MicIcon size={20}/>
      {isRecording ? " Stop" : " Start"}
    </button>
  </div>
)}

{audioBlob && (
  <div className="audio-card animate-in">
    <div className="audio-left">
      <MicIcon size={22} />
      <div>
        <h4>Recorded_Audio.webm</h4>
        <p>{(audioBlob.size / 1024).toFixed(2)} KB</p>
      </div>
    </div>

    <div className="audio-right">
      <CheckCircle size={18} className="success-icon" />
      <X
        size={18}
        className="remove-icon"
        onClick={handleRemoveAudio}
      />
    </div>

    <div className="audio-player">
      <audio controls src={URL.createObjectURL(audioBlob)} />
    </div>
  </div>
)}

{submittedText && (
  <div className="text-card animate-in">
    <div className="text-left">
      <FileText size={22} />
      <div>
        <h4>Clinical_Text_Input.txt</h4>
        <p>{submittedText.length} characters</p>
      </div>
    </div>

    <div className="text-right">
      <CheckCircle size={18} className="success-icon" />
      <X
        size={18}
        className="remove-icon"
        onClick={() => setSubmittedText("")}
      />
    </div>

    <div className="text-preview-content">
      {submittedText}
    </div>
  </div>
)}

          </div>
          {canStartAnalysis && (
                <div className="analysis-action">
                    <button
  className="start-btn"
  // onClick={async () => {
  //   await handleUploadToBackend();
  //   setAnalysisStarted(true);
  //   setPp4Calculated(false);
  // }}
   
  onClick={handleUploadToBackend}
>
  <UploadCloud size={18} />
  Start Analysis
</button>
                </div>
            )}

            {analysisStarted && (
                <div className="analysis-wrapper">

                    {/* LEFT SIDE */}
                    <div className="analysis-left">

                    {/* Gene Overview */}
                    <div className="gene-overview">
                        <h3>Gene Overview</h3>
                        <div className="overview-grid">
                        <div className="overview-box">
                              <div className="overview-box">
    <h4>{geneData?.gene || "-"}</h4>
    <span>GENE NAME</span>
  </div>
                        </div>
                        <div className="overview-box">
  <h4>{geneData?.visibility_class || "-"}</h4>
  <span>Visibility Class</span>
</div>

<div className="overview-box">
  <h4>
    {geneData?.visibility_score
      ? `${Math.round(geneData.visibility_score * 100)}%`
      : "-"}
  </h4>
  <span>Visibility Score</span>
</div>
                        
                        </div>
                    </div>

                    {/* Targeted Checklist */}
                    
                    <div className="checklist-card">
                    <h3>Targeted Checklist</h3>

                    {backendChecklist
  .filter(category => category.items && category.items.length > 0)
  .map((category, catIndex) => (
                        <div className="checklist-category" key={catIndex}>
                        
                        {/* Category Header */}
                        <div
                            className="category-header"
                            onClick={() =>
                            setOpenCategory(
                                openCategory === catIndex ? null : catIndex
                            )
                            }
                        >
                            <span>{category.title}</span>
                            <span>{openCategory === catIndex ? <ChevronUp size={15}/>  : <ChevronDown size={15}/>}</span>
                        </div>

                        {/* Category Body */}
                        {openCategory === catIndex && (
                            <div className="category-body">
                            {category.items.map((item, itemIndex) => (
                                <div className="checklist-row" key={itemIndex}>
                                <span className="checklist-label">{item}</span>

                                <div className="radio-group">
                                    {["Present", "Absent", "N/A"].map((option) => (
                                        <label key={option}>
                                        <input
                                            type="radio"
                                            name={item}   // ✅ unique per checklist item
                                            value={option}
                                            checked={checklist[item] === option}
                                            onChange={(e) =>
                                            setChecklist({
                                                ...checklist,
                                                [item]: e.target.value   // ✅ dynamic key
                                            })
                                            }
                                        />
                                        {option}
                                        </label>
                                    ))}
                                    </div>

                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    ))}

                    {/* Calculate Button */}
                    <div className="pp4-calc-section">
                        <p className="pp4-note">
                        Before calculating PP4 score, please complete the checklist.
                        </p>

                       <button
  className="calculate-btn"
  onClick={handleCalculate}
  disabled={pp4Calculated}
>
  {pp4Calculated ? "PP4 Already Calculated" : "Calculate PP4"}
</button>

                    </div>
                    </div>


                    </div>

                    {/* RIGHT SIDE */}
                    <div className="analysis-right">
                    <div className={`pp4-panel ${pp4Calculated ? "pp4-active" : ""}`}>
                        <h2>PP4 Score Panel</h2>

                        {!pp4Calculated ? (
                        <div className="pp4-placeholder">
                            Before calculating the PP4 score, make sure that you complete the checklist.
                        </div>
                        ) : (
                        <>
                            <div className="pp4-body">
                                {/* Scores Row */}
                                <div className="pp4-scores">
                                    <div className="pp4-box">
                                        <h3>{pp4Result?.pp4_result?.raw_score}</h3>
                                        <span>Raw Score</span>
                                    </div>

                                    <div className="pp4-box">
                                       <h3>×{pp4Result?.pp4_result?.multiplier}</h3>
                                        <span>Multiplier</span>
                                    </div>

                                    <div className="pp4-box">
                                        <h3 className="animated-score">{animatedFinal}</h3>
                                        <span>Final</span>
                                    </div>

                                    

                                </div>

                                {/* Probability Badge */}
                                {/* <div className="pp4-badge">High Probability</div> */}
                               <div className="pp4-status-row">
  <div
  className={`pp4-state-badge ${
    pp4Result?.pp4_result?.state?.toLowerCase()
  }`}
>
  {pp4Result?.pp4_result?.state?.replace(/_/g, " ")}
</div>

  <div
  className={`risk-badge ${
    pp4Result?.summaries?.risk_level
      ?.toLowerCase()
      .replace(" ", "-")
  }`}
>
  {pp4Result?.summaries?.risk_level}
</div>
</div>

                                {/* Reasoning Summary */}
                                <div className="pp4-summary">
  <h4>Reasoning Summary</h4>
  <div className="formatted-summary">
    {pp4Result?.summaries?.doctor_summary || "No clinical summary available."}
  </div>
</div>

                                {/* Buttons */}
                                <button className="pp4-export" onClick={handleDownloadPDF}>
  <DownloadCloud size={16}/>  Export PDF
</button>

<div className="whatsapp-section">

  {!showWhatsappInput ? (
    <button
      className="share-btn"
      onClick={() => setShowWhatsappInput(true)}
    >
      Share to Patient
    </button>
  ) : (
    <div className="whatsapp-input-wrapper">
      <input
        type="text"
        placeholder="Enter WhatsApp Number (e.g. 919876543210)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <button 
  className="send-btn"
  onClick={handleSend}
  disabled={isAnalyzing}
>
  <Send size={18} />
</button>
    </div>
  )}

</div>
                            </div>
                        </>
                        )}
                    </div>
                    </div>

                </div>
                )}


        </div>
      </div>

      {/* 🔥 ANALYSIS LOADER OVERLAY */}
      {analysisLoading && (
        <div className="analysis-overlay">
          <div className="analysis-loader">
            <div className="spinner"></div>
            <p>Analyzing genetic data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

