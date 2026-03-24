import { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import API from "../../services/api"; 

import {
  Send,
  Bot,
  Mic,
  X,
  CheckCircle,
  Paperclip,
  LucideEdit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  UploadCloud,
  Share2
} from "lucide-react";

import "../../styles/doctor/app.css";
import "../../styles/doctor/Chatbot.css";

export default function DoctorChatbot() {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  
  // Live transcription states
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recognitionRef, setRecognitionRef] = useState(null);

 const [showConversations, setShowConversations] = useState(false);
const [conversations, setConversations] = useState([]);
const [currentChatId, setCurrentChatId] = useState(null);

const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [allChats, setAllChats] = useState({});
// const [isLoaded, setIsLoaded] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const selectedCase = "CASE-001";
  const chatEndRef = useRef(null);
const newId = `CASE-${Date.now()}`;

   

//   /* ---------------- LOAD CHAT ---------------- */
//     // useEffect(() => {
//     //   const saved = localStorage.getItem(`chat_${selectedCase}`);
//     //   if (saved) setMessages(JSON.parse(saved));
//     // }, []);


//   /* ---------------- LOAD ALL CHATS ---------------- */
// // useEffect(() => {
// //   const storedChats = localStorage.getItem("doctor_chats");

// //   if (!storedChats) {
// //     setIsLoaded(true);
// //     return;
// //   }

// //   const parsedChats = JSON.parse(storedChats);

// //   setAllChats(parsedChats);

// //   const chatKeys = Object.keys(parsedChats);

// //   if (chatKeys.length > 0) {
// //     const firstChat = chatKeys[0];
// //     setCurrentChatId(firstChat);
// //     setMessages(parsedChats[firstChat]);
// //   }

// //   setIsLoaded(true);

// // }, []);
// /* ---------------- SAVE CURRENT CHAT ---------------- */
// // useEffect(() => {
// //   if (!isLoaded) return;
// //   if (!currentChatId) return;

// //   setAllChats(prevChats => {
// //     const updatedChats = {
// //       ...prevChats,
// //       [currentChatId]: messages
// //     };

// //     localStorage.setItem(
// //       "doctor_chats",
// //       JSON.stringify(updatedChats)
// //     );

// //     return updatedChats;
// //   });

// //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

// // }, [messages, currentChatId, isLoaded]);




useEffect(() => {
  if (!currentChatId) return;

  const loadMessages = async () => {
    const res = await API.get(`/chat/messages/${currentChatId}`);

    const formatted = res.data.map(msg => {

  if (msg.type === "analysis-complete") {
    return {
      ...msg,
      gene: msg.data?.genetic?.gene
    };
  }

  if (msg.type === "checklist") {
    return {
      ...msg,
      checklistData: msg.data
    };
  }

  if (msg.type === "pp4") {
    return {
      ...msg,
      pp4Data: msg.data
    };
  }

  return msg;
});

    setMessages(formatted);
  };

  loadMessages();
}, [currentChatId]);

useEffect(() => {
  fetchConversations();
}, []);

// Initialize Web Speech API for live transcription
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
      setInput((prev) => prev + finalTranscript);
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

const fetchConversations = async () => {
  try {
    const res = await API.get("/chat/conversation");
    setConversations(res.data);

    if (res.data.length > 0) {
      setCurrentChatId(res.data[0]._id);
    }

  } catch (err) {
    console.error("Failed to fetch conversations", err);
  }
};

const handleSend = async () => {

  const trimmedInput = input.trim().toLowerCase();

  if (!input && !file && !audioBlob) {
    setMessages(prev => [
      ...prev,
      {
        sender: "ai",
        text: "Please upload a gene file or enter clinical findings to begin analysis."
      }
    ]);
    return;
  }
// ================= GREETING / SIMPLE CHAT HANDLER =================

const simpleReplyHandler = async (aiReplyText) => {
  const doctorMessage = { sender: "doctor", text: input };
  const aiMessage = { sender: "ai", text: aiReplyText };

  // 1️⃣ Show immediately in UI
  setMessages(prev => [...prev, doctorMessage, aiMessage]);

  try {
    // 2️⃣ Save in backend
    await API.post("/chat/simple", {
      conversationId: currentChatId,
      doctorText: input,
      aiText: aiReplyText
    });
  } catch (error) {
    console.error("Failed to save simple message:", error);
  }

  setInput("");
};

// ================= GREETINGS =================
const greetings = ["hi", "hello", "hey", "good morning", "good afternoon"];
if (greetings.includes(trimmedInput)) {
  await simpleReplyHandler(
    "Hello Doctor 👩‍⚕️ I'm ready to assist you with prenatal gene analysis. Please upload a file or provide clinical details."
  );
  return;
}

// ================= THANKS =================
const thanks = ["thank you", "thanks", "thankyou"];
if (thanks.includes(trimmedInput)) {
  await simpleReplyHandler(
    "You're welcome Doctor 😊 I'm always here to assist you."
  );
  return;
}

// ================= APOLOGY =================
if (trimmedInput === "sorry") {
  await simpleReplyHandler(
    "No worries Doctor. Please continue with the gene details when ready."
  );
  return;
}

// ================= OUT OF SCOPE =================
const allowedKeywords = ["gene", "analysis", "clinical", "pp4", "file"];
const isRelated = allowedKeywords.some(word =>
  trimmedInput.includes(word)
);

if (!isRelated && !file && !audioBlob) {
  await simpleReplyHandler(
    "I am specialized in prenatal gene analysis and PP4 scoring. Please provide gene-related information."
  );
  return;
}
  // Doctor message
  const doctorMsg = {
    sender: "doctor",
    text: input || "",
    analysisSource: file ? "file" : audioBlob ? "audio" : null,
    fileName: file ? file.name : audioBlob ? "Recorded Audio" : null
  };

  setMessages(prev => [...prev, doctorMsg]);

  // 🔥 SHOW ANALYZING MESSAGE
  setIsAnalyzing(true);

  setMessages(prev => [
    ...prev,
    {
      sender: "ai",
      type: "loading"
    }
  ]);

  try {
    let response;

    if (file || audioBlob) {
      const formData = new FormData();

      if (file) formData.append("file", file);
      if (audioBlob) formData.append("file", audioBlob, "recorded.webm");

      formData.append("text", input);
      formData.append("gestation", 20);
      formData.append("conversationId", currentChatId);

  response = await API.post("/chat", formData);
    } else {
      response = await API.post("/chat", {
        text: input,
        gestation: 20,
        conversationId: currentChatId
      });
    }

    // 🔥 REMOVE LOADING MESSAGE
    setMessages(prev => prev.filter(msg => msg.type !== "loading"));

    const result = response.data.data;
    const gene = result?.genetic?.gene;

    if (!gene) {
      setMessages(prev => [
        ...prev,
        { sender: "ai", text: "Gene not detected in input." }
      ]);
      setIsAnalyzing(false);
      return;
    }

    // Analysis complete
    setMessages(prev => [
      ...prev,
      {
        sender: "ai",
        type: "analysis-complete",
        gene
      }
    ]);

    // Fetch checklist
    const checklistRes = await API.post("/checklist", {
  gene,
  conversationId: currentChatId
});

if (!checklistRes.data.success) {
  setMessages(prev => [
    ...prev,
    {
      sender: "ai",
      text: checklistRes.data.message
    }
  ]);
  return;
}

setMessages(prev => [
  ...prev,
  {
    sender: "ai",
    type: "checklist",
    checklistData: checklistRes.data.data.checklist,
    gene
  }
]);

  } catch (error) {

  setMessages(prev => prev.filter(msg => msg.type !== "loading"));

  const errorMessage =
    error.response?.data?.message ||
    "Gene not detected in dataset.";

  setMessages(prev => [
    ...prev,
    {
      sender: "ai",
      text: errorMessage
    }
  ]);
}

  setIsAnalyzing(false);
  setInput("");
  setFile(null);
  setAudioBlob(null);
};

const handleNewConversation = async () => {
  try {
    const response = await API.post("/chat/conversation");

   await fetchConversations();
setCurrentChatId(response.data._id);
setMessages([]);

  } catch (error) {
    console.error("Failed to create conversation", error);
  }
};











  /* ---------------- VOICE RECORD WITH LIVE TRANSCRIPTION ---------------- */
  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });

        const recorder = new MediaRecorder(stream);
        recorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, {
            type: "audio/webm"
          });
          setAudioBlob(blob);
        };

        recorder.start();
        setIsRecording(true);
        
        // Start live transcription
        if (recognitionRef) {
          recognitionRef.start();
        }
      } catch (err) {
        alert("Microphone permission denied");
      }
    } else {
      recorderRef.current.stop();
      setIsRecording(false);
      
      // Stop transcription
      if (recognitionRef) {
        recognitionRef.stop();
      }
      
      // Finalize the transcribed text
      if (liveTranscript.trim()) {
        setInput((prev) => prev.trim());
      }
    }
  };

  /* ---------------- CHECKLIST SUBMIT ---------------- */
const handleChecklistSubmit = async (data, gene) => {
  try {
    // 1️⃣ Show immediately in UI (for smooth UX)
    setMessages((prev) => [
      ...prev,
      {
        sender: "doctor",
        type: "checklist-summary",
        data
      }
    ]);

    // 2️⃣ Save checklist summary in backend (so it persists after reload)
    await API.post("/chat/checklist-summary", {
      conversationId: currentChatId,
      selections: data
    });

    // 3️⃣ Now call PP4 calculation
    setTimeout(() => {
      calculatePP4(data, gene);
    }, 500);

  } catch (error) {
    console.error("Checklist summary save failed:", error);
  }
};


  /* ---------------- PP4 CALCULATION ---------------- */
const calculatePP4 = async (data, gene) => {
  try {
    const selections = {
      core: {},
      supportive: {},
      negative: {}
    };

    // 🔥 IMPORTANT: map selections properly here
    Object.entries(data).forEach(([key, value]) => {
      // For now, put everything under core if you don't track category
      selections.core[key] = value;
    });

    const response = await API.post("/pp4", {
      gene,
      gestation: 20,
      selections,
       conversationId: currentChatId 
    });

    const result = response.data.data;
console.log("CHATBOT PP4 RESPONSE:", result);
    setMessages((prev) => [
  ...prev,
  {
    sender: "ai",
    type: "pp4",
    gene,
    pp4Data: result   // 🔥 full backend response
  }
]);

  } catch (error) {
    console.error("PP4 Error:", error);
  }
};

  /* ---------------- CHECKLIST COMPONENT ---------------- */


const ChecklistCard = ({ onSubmit, checklistData, gene }) => {
  const [checklist, setChecklist] = useState({});
  const [openCategory, setOpenCategory] = useState(0);
  const [submitted, setSubmitted] = useState(false);

 const formattedChecklist = [];

if (checklistData?.core_prenatal_findings?.length > 0) {
  formattedChecklist.push({
    title: "Core Findings",
    items: checklistData.core_prenatal_findings
  });
}

if (checklistData?.supportive_findings?.length > 0) {
  formattedChecklist.push({
    title: "Supportive Findings",
    items: checklistData.supportive_findings
  });
}

if (checklistData?.negative_findings?.length > 0) {
  formattedChecklist.push({
    title: "Negative Findings",
    items: checklistData.negative_findings
  });
}

  const totalItems = formattedChecklist.reduce(
    (acc, category) => acc + category.items.length,
    0
  );

  useEffect(() => {
  if (
    Object.keys(checklist).length === totalItems &&
    totalItems > 0 &&
    !submitted
  ) {
    setSubmitted(true);
    onSubmit(checklist, gene);
  }
}, [checklist, totalItems, submitted]);

if (submitted) {
  return (
    <div className="checklist-card">
      <h4>Checklist completed ✅</h4>
    </div>
  );
}

  return (
    <div className="checklist-card">
      <h4>Please complete the clinical checklist:</h4>

      {formattedChecklist.map((category, catIndex) => (
        <div className="checklist-category" key={catIndex}>
          <div
            className="category-header"
            onClick={() =>
              setOpenCategory(openCategory === catIndex ? null : catIndex)
            }
          >
            <span>{category.title}</span>
            <span>
              {openCategory === catIndex ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
            </span>
          </div>

          {openCategory === catIndex && (
            <div className="category-body">
              {category.items.map((item, itemIndex) => (
                // <div key={itemIndex}>
                //   <span>{item}</span>
                <div className="checklist-row" key={itemIndex}>
  <span className="checklist-label">{item}</span>

  <div className="radio-group">
    {["PRESENT", "ABSENT", "N/A"].map((option) => (
      <label key={option}>
        <input
          type="radio"
          name={item}
          value={option}
          checked={checklist[item] === option}
          onChange={(e) =>
            setChecklist((prev) => ({
              ...prev,
              [item]: e.target.value
            }))
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
    </div>
  );
};
  
  
  
  
const handleRename = async (id) => {
  const newName = prompt("Enter new conversation name:");
  if (!newName) return;

  try {
    await API.put(`/chat/conversation/${id}`, {
      title: newName
    });

    await fetchConversations();  // 🔥 refresh list

  } catch (error) {
    console.error("Rename failed", error);
  }
};



const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this conversation?"
  );

  if (!confirmDelete) return;

  try {
    await API.delete(`/chat/conversation/${id}`);
    await fetchConversations();  // 🔥 refresh list

  } catch (error) {
    console.error("Delete failed", error);
  }
};
  
  




  return (
    <div className="app">
      <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
      <div className={`main ${collapsed ? "collapsed" : ""}`}>
        <Topbar />
        <div className="conversation-menu-toggle">
          <button onClick={() => setShowConversations(!showConversations)}>
            ☰
          </button>
        </div>

        {showConversations && (
        <div className="conversation-panel">
  <h4>Conversations</h4>

  <div className="conversation-list">
 {conversations.map((conv) => (
  <div
    key={conv._id}
    className={`conversation-item ${
      conv._id === currentChatId ? "active" : ""
    }`}
  >
    <div
      className="conversation-title"
      onClick={() => {
        setCurrentChatId(conv._id);
      }}
    >
      {conv.title}
    </div>

    <div className="conversation-actions">
      <button
        onClick={() => handleRename(conv._id)}
        className="edit-btn"
      >
        <LucideEdit2 size={16} />
      </button>

      <button
        onClick={() => handleDelete(conv._id)}
        className="delete-btn"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>
))}
</div>

  {/* Fixed Footer */}
  <div className="conversation-footer">
    <button
      className="new-chat-btn"
      onClick={handleNewConversation}
    >
      + New Conversation
    </button>
  </div>
</div>
        )}

        <div className="chat-container chatbot-scope">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <Bot size={40} />
                <h2>Welcome, Doctor</h2>
                <p>Upload a gene file or type details to begin analysis.</p>
              </div>
            )}

            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                <div className="chat-bubble">

                  {msg.analysisSource === "file" && (
                    <div className="file-bubble">📄 {msg.fileName}</div>
                  )}
                  

                  {msg.analysisSource === "audio" && (
                    <div className="file-bubble"><Mic size={16}/> {msg.fileName}</div>
                  )}

                  {msg.text}


                   {msg.type === "loading" && (
        <div className="analysis-loading">
          <div className="loader-spinner"></div>
          <span>Analyzing gene data... Please wait</span>
        </div>
      )}
                  {msg.type === "analysis-complete" && (
                    <div className="analysis-card">
                      <div className="analysis-header">
                        ✅ ANALYSIS COMPLETE
                      </div>
                      <div className="analysis-gene">
                        Gene: {msg.gene}
                      </div>
                      <p>
                        Initial gene analysis complete. Please proceed with checklist.
                      </p>
                    </div>
                  )}

                 {msg.type === "checklist" && (
  <ChecklistCard
    onSubmit={(data) => handleChecklistSubmit(data, msg.gene)}
    checklistData={msg.checklistData}
    gene={msg.gene}
  />
)}

                  {msg.type === "checklist-summary" && (
                    <div>
                      <strong>Clinical checklist submitted:</strong>
                      {Object.entries(msg.data).map(([k, v]) => (
                        <div key={k}>
                          • {k}: {v}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* {msg.type === "pp4" && (
                    <div className="pp4-full-card">
                      <div className="pp4-full-header">
                        <h3>PP4 RESULT</h3>
                        <span className="pp4-risk-badge">
                          {msg.risk}
                        </span>
                      </div>

                      <div className="pp4-score-wrapper">
                        <div className="pp4-score-box">
                          <span>Raw Score</span>
                          <h2>{msg.raw}</h2>
                        </div>
                        <div className="pp4-score-box">
                          <span>Final Score</span>
                          <h2>{msg.final}</h2>
                        </div>
                      </div>

                      <div className="pp4-report">
                        <p><strong>Raw Score:</strong> {msg.raw}</p>
                        <p><strong>Multiplier:</strong> 0.4</p>
                        <p><strong>Final PP4 Score:</strong> {msg.final}</p>
                        <p><strong>Risk Level:</strong> {msg.risk}</p>
                      </div>
                    </div>
                  )} */}
{msg.type === "pp4" && (
  <div className="pp4-panel-wrapper">
    <div className="pp4-panel">

      <div className="pp4-panel-header">
        PP4 Score Panel
      </div>

      <div className="pp4-score-row">

        <div className="pp4-score-card">
          <h2>{msg.pp4Data?.pp4_result?.raw_score}</h2>
          <span>Raw Score</span>
        </div>

        <div className="pp4-score-card">
          <h2>× {msg.pp4Data?.pp4_result?.multiplier}</h2>
          <span>Multiplier</span>
        </div>

        <div className="pp4-score-card">
          <h2>{msg.pp4Data?.pp4_result?.final_score}</h2>
          <span>Final</span>
        </div>

      </div>

      <div className="pp4-status-row">

        {/* ACMG Rule */}
        <div className={`pp4-rule-badge ${
          msg.pp4Data?.pp4_result?.state === "PP4_MET"
            ? "rule-met"
            : "rule-not-met"
        }`}>
          {msg.pp4Data?.pp4_result?.state?.replace(/_/g, " ")}
        </div>

        {/* Clinical Risk */}
        <div className={`clinical-risk-badge ${
          msg.pp4Data?.summaries?.risk_level === "Low Risk"
            ? "risk-low"
            : msg.pp4Data?.summaries?.risk_level === "Moderate Risk"
            ? "risk-moderate"
            : "risk-high"
        }`}>
          {msg.pp4Data?.summaries?.risk_level}
        </div>

      </div>

      <div className="pp4-summary-card">
        <h4>Reasoning Summary</h4>

        <p><strong>Gene:</strong> {msg.gene}</p>
        <p><strong>Final Score:</strong> {msg.pp4Data?.pp4_result?.final_score}</p>
        <p><strong>ACMG Rule:</strong> {msg.pp4Data?.pp4_result?.state?.replace(/_/g," ")}</p>
        <p><strong>Clinical Risk:</strong> {msg.pp4Data?.summaries?.risk_level}</p>

        <br/>

       {(() => {
  const summary = msg.pp4Data?.summaries?.doctor_summary || "";

  const interpretationMatch = summary.match(/Interpretation:(.*?)(Recommended Action:|$)/s);
  const recommendationMatch = summary.match(/Recommended Action:(.*)/s);

  const interpretationText = interpretationMatch
    ? interpretationMatch[1].trim()
    : "";

  const recommendationText = recommendationMatch
    ? recommendationMatch[1].trim()
    : "";

  return (
    <div className="pp4-clean-summary">
      {interpretationText && (
        <div className="summary-block">
          <h5 className="summary-heading"><strong>Interpretation</strong></h5>
          <p>{interpretationText}</p>
        </div>
      )}

      {recommendationText && (
        <div className="summary-block">
          <h5 className="summary-heading"><strong>Recommended Action</strong></h5>
          <p>{recommendationText}</p>
        </div>
      )}
    </div>
  );
})()}
        {/* <p>{msg.pp4Data?.summaries?.doctor_summary}</p> */}
      </div>

    </div>
  </div>
)}

                </div>
              </div>
            ))}

            <div ref={chatEndRef}></div>
          </div>

          {/* INPUT SECTION */}
          <div className="chat-input-wrapper">

            {file && (
              <div className="file-preview-inline">
                <div className="file-info">
                  <span className="file-name">📄 {file.name}</span>
                  <span className="file-size">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="file-actions">
                  <CheckCircle size={18} className="success-icon" />
                  <X size={18} onClick={() => setFile(null)} className="remove-icon" />
                </div>
              </div>
            )}

            {/* {audioBlob && (
              <div className="audio-preview-premium">
                <audio controls src={URL.createObjectURL(audioBlob)} />
                <X size={18} onClick={() => setAudioBlob(null)} className="remove-icon" />
              </div>
            )} */}
            
            {audioBlob && (
                <div className="preview-card">
                  <div className="preview-left">
                    <Mic /> Recorded Audio
                  </div>
                  <div className="preview-right">
                    <audio controls src={URL.createObjectURL(audioBlob)} />

                    <X size={18} onClick={() => setAudioBlob(null)} className="remove-icon"  />
                  </div>
                </div>
              )}

            {/* Live Transcription Display */}
            {isRecording && liveTranscript && (
              <div className="live-transcript-chat">
                <p className="transcript-label">Live Transcript:</p>
                <p className="transcript-text">{liveTranscript}</p>
              </div>
            )}

            {isTranscribing && !liveTranscript && isRecording && (
              <div className="listening-indicator-chat">
                <span className="pulse"></span> Listening...
              </div>
            )}

            <form
  className="chat-input"
  onSubmit={(e) => {
    e.preventDefault();
    handleSend();
  }}
>
  <label className="file-icon">
    <Paperclip size={18} />
    <input
      hidden
      type="file"
      onChange={(e) => {
        const selected = e.target.files[0];
        if (!selected) return;
        setFile(selected);
      }}
    />
  </label>

  <input
    type="text"
    placeholder="Add a note about this file (optional)..."
    value={input}
    onChange={(e) => setInput(e.target.value)}
  />

  <button
    type="button"
    className={`mic-btn ${isRecording ? "recording" : ""}`}
    onClick={handleMicClick}
  >
    <Mic size={18} />
  </button>

  <button type="submit" className="send-btn">
    <Send size={18} />
  </button>
</form>

          </div>
        </div>
      </div>
    </div>
  );
}