/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-empty */
 
/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import API from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";

import {
  Send, Mic, X, CheckCircle, Paperclip,
  LucideEdit2, Trash2, ChevronDown, ChevronUp,
  Dna, Activity, Plus, MessageSquare,
  Menu, ChevronLeft, History, User, FileText,
  Home, Briefcase, BarChart2, Heart,
} from "lucide-react";

/* ─── Bottom nav ─── */
const NAV_ITEMS = [
  { label: "Cases",         icon: Briefcase, path: "/cases" },
  { label: "Home",          icon: Home,      path: "/dashboard" },
  { label: "Gene Analysis", icon: Dna,       path: "/gene-analysis" },
  { label: "History",       icon: History,   path: "/history" },
];

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; font-family: 'Plus Jakarta Sans', sans-serif; }

@keyframes spin    { to { transform: rotate(360deg); } }
@keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes slideIn { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:translateX(0); } }
@keyframes pulseRed{ 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,.4)} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0)} }

.dc-msg   { animation: fadeUp .24s ease forwards; }
.dc-panel { animation: slideIn .22s cubic-bezier(.4,0,.2,1) forwards; }

.dc-messages::-webkit-scrollbar       { width:5px; }
.dc-messages::-webkit-scrollbar-track { background:#f1f0f9; border-radius:4px; }
.dc-messages::-webkit-scrollbar-thumb { background:#c4b5fd; border-radius:4px; }
.dc-convlist::-webkit-scrollbar       { width:3px; }
.dc-convlist::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:3px; }

.dc-conv-item:hover  { background:#f5f3ff !important; border-color:#ddd6fe !important; }
.dc-conv-item.active { background:#ede9fe !important; border-color:#c4b5fd !important; }
.dc-edit-btn:hover   { background:#f0ebff !important; color:#7c3aed !important; }
.dc-del-btn:hover    { background:#fef2f2 !important; color:#ef4444 !important; }
.dc-send-btn:hover   { transform:translateY(-1px) scale(1.04); box-shadow:0 10px 32px rgba(109,40,217,.5) !important; }
.dc-mic-btn:hover    { background:#f5f3ff !important; color:#7c3aed !important; border-color:#ddd6fe !important; }
.dc-clip:hover       { color:#7c3aed !important; background:#f5f3ff !important; }
.dc-new-btn:hover    { background:rgba(255,255,255,.28) !important; }
.dc-ham:hover        { background:rgba(255,255,255,.18) !important; }
.dc-inputbar:focus-within {
  border-color:#a78bfa !important;
  box-shadow:0 0 0 4px rgba(167,139,250,.15) !important;
}
.dc-cat-hdr:hover { background:#faf9ff !important; }
.dc-chk-row:hover { background:#faf9ff !important; }
input[type=radio] { accent-color:#7c3aed; cursor:pointer; }
audio { height:30px; border-radius:8px; }

.dc-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:35; backdrop-filter:blur(2px); }
.dc-overlay.show { display:block; }

/* ── File attachment card inside bubble ── */
.dc-att-card {
  display:flex; align-items:center; gap:11px;
  padding:10px 13px; border-radius:13px;
  background:rgba(255,255,255,.13);
  border:1px solid rgba(255,255,255,.22);
  backdrop-filter:blur(4px);
  width:100%; max-width:280px;
}
.dc-att-icon {
  width:36px; height:36px; border-radius:10px;
  background:rgba(255,255,255,.18);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.dc-att-name { font-size:13px; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px; }
.dc-att-meta { font-size:10.5px; color:rgba(255,255,255,.6); margin-top:1px; display:flex; align-items:center; gap:5px; }
.dc-att-dot  { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,.4); display:inline-block; }

/* ── Text portion under file ── */
.dc-att-text {
  margin-top:7px;
  padding:9px 12px;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.15);
  border-radius:10px;
  font-size:13.5px;
  line-height:1.6;
  color:#fff;
  width:100%;
}

/* ── Profile avatar button ── */
.dc-profile-btn {
  width:36px; height:36px; border-radius:10px;
  background:linear-gradient(135deg,#ede9fe,#ddd6fe);
  border:1.5px solid #c8c1ed;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0;
  box-shadow:0 2px 8px rgba(109,90,205,.15);
  transition:all .18s;
  color:#6d5acd;
}
.dc-profile-btn:hover {
  background:linear-gradient(135deg,#7c3aed,#8b5cf6) !important;
  color:#fff !important;
  border-color:transparent !important;
  box-shadow:0 4px 14px rgba(124,58,237,.3) !important;
  transform:translateY(-1px);
}

/* ── Mic recording pulse ── */
.dc-recording { animation: pulseRed 1.2s infinite; }

/* ══ MOBILE BOTTOM NAV ══ */
.dc-bottom-nav {
  display:none;
  position:fixed; bottom:0; left:0; right:0; height:64px;
  background:#fff; border-top:1px solid #ebe7f8;
  box-shadow:0 -4px 20px rgba(109,90,205,.07);
  z-index:100; padding:0 8px;
  align-items:center; justify-content:space-around;
}
.dc-nav-item {
  display:flex; flex-direction:column; align-items:center; gap:3px;
  padding:6px 10px; border-radius:12px; cursor:pointer;
  transition:all .18s; flex:1; min-width:0;
  background:transparent; border:none; font-family:'Plus Jakarta Sans',sans-serif;
}
.dc-nav-item:hover { background:#f6f4fe; }
.dc-nav-icon  { width:24px; height:24px; display:flex; align-items:center; justify-content:center; }
.dc-nav-label { font-size:10px; font-weight:600; color:#9ca3af; white-space:nowrap; }
.dc-nav-item.active { background:#eef2ff; }
.dc-nav-item.active .dc-nav-label { color:#4f46e5; font-weight:700; }

/* ── MOBILE ── */
@media (max-width: 768px) {
  .dc-sidebar-wrap { display:none !important; }
  .dc-main         { margin-left:0 !important; }
  .dc-panel-inline { display:none !important; }
  .dc-messages     { padding:16px 12px 10px !important; }
  .dc-input-wrap   { padding:8px 10px 10px !important; }
  .dc-bubble-doc   { max-width:88% !important; }
  .dc-bubble-ai    { max-width:90% !important; }
  .dc-pp4-panel    { max-width:100% !important; }
  .dc-check-card   { min-width:unset !important; width:100%; }
  .dc-topbar-title { font-size:13px !important; }
  .dc-topbar-sub   { display:none !important; }
  .dc-online-pill  { display:none !important; }
  .dc-inputbar     { border-radius:12px !important; }
  .dc-bubble-doc, .dc-bubble-ai { font-size:13.5px !important; }
  .dc-bottom-nav   { display:flex !important; }
  .dc-chat-body    { padding-bottom:64px !important; }
  .dc-att-name     { max-width:120px !important; }
}
@media (max-width: 480px) {
  .dc-pp4-score-row { flex-direction:column !important; }
}
`;

const T = {
  p700:"#6d28d9", p600:"#7c3aed", p500:"#8b5cf6",
  p200:"#ddd6fe", p100:"#ede9fe", p50:"#f5f3ff",
  white:"#ffffff", bg:"#f8f8fc", border:"#ebebf5",
  text:"#1a1535", sub:"#4b4675", muted:"#8b8aaa", light:"#b8b7d4",
  green:"#059669", amber:"#d97706", red:"#dc2626",
  greenBg:"#ecfdf5", amberBg:"#fffbeb", redBg:"#fef2f2",
  greenBd:"#6ee7b7", amberBd:"#fcd34d", redBd:"#fca5a5",
};

/* ── helper: human-readable file size ── */
const fmtSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024*1024)  return `${(bytes/1024).toFixed(1)} KB`;
  return `${(bytes/1024/1024).toFixed(1)} MB`;
};

/* ── helper: file type label + icon colour ── */
const fileType = (name = "") => {
  const ext = name.split(".").pop().toLowerCase();
  const map = { pdf:"PDF",doc:"DOC",docx:"DOC",txt:"TXT",csv:"CSV",xls:"XLS",xlsx:"XLS",vcf:"VCF",json:"JSON",xml:"XML",fasta:"FASTA",fastq:"FASTQ" };
  return map[ext] || ext.toUpperCase() || "FILE";
};

const ChecklistCard = ({ onSubmit, checklistData, gene, reportType }) => {
  const [checklist, setChecklist] = useState({});
  const [openCat,   setOpenCat]   = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const isNonWES = gene === "NOT_APPLICABLE" || gene === "UNKNOWN" || gene === "QUOTA_EXHAUSTED";

  const cats = !isNonWES ? [
    ...(checklistData?.core_prenatal_findings?.length ? [{ title:"Core Findings",       items:checklistData.core_prenatal_findings }] : []),
    ...(checklistData?.supportive_findings?.length    ? [{ title:"Supportive Findings", items:checklistData.supportive_findings }]    : []),
    ...(checklistData?.negative_findings?.length      ? [{ title:"Negative Findings",   items:checklistData.negative_findings }]      : []),
  ] : [];

  const clinicalFieldsMap = {
    CMA: [
      { label:"CNV Result", name:"cnv_result", opts:["Normal","Abnormal","Unknown"] },
      { label:"Consanguinity", name:"consanguinity", opts:["Yes","No","Unknown"] },
      { label:"Microdeletions", name:"microdeletions", opts:["Present","Not Present","Unknown"] },
      { label:"ROH (Regions of Homozygosity)", name:"roh", opts:["Detected","Not Detected","Unknown"] },
      { label:"Cardiac Findings", name:"cardiac_findings", opts:["Present","Not Present","Unknown"] },
    ],
    SCAN: [
      { label:"Anomalies Detected", name:"anomalies", opts:["Present","Not Present","Unknown"] },
      { label:"NT Measurement", name:"nt", opts:["Abnormal","Normal","Unknown"] },
      { label:"Nasal Bone", name:"nasal_bone", opts:["Absent","Hypoplastic","Normal","Unknown"] },
      { label:"Doppler Assessment", name:"doppler", opts:["Abnormal","Normal","Unknown"] },
      { label:"Amniotic Fluid", name:"liquor", opts:["Reduced","Increased","Normal","Unknown"] },
    ],
    SERUM: [
      { label:"NT Result", name:"nt_result", opts:["Abnormal","Normal","Unknown"] },
      { label:"Nasal Bone", name:"nasal_bone", opts:["Absent","Hypoplastic","Normal","Unknown"] },
      { label:"Ductus Venosus", name:"ductus_venosus", opts:["Abnormal","Normal","Unknown"] },
      { label:"Tricuspid Regurgitation", name:"tricuspid", opts:["Present","Not Present","Unknown"] },
    ],
  };
  const clinicalFields = clinicalFieldsMap[reportType] || [];
  const clinicalTotal = clinicalFields.length;

  useEffect(() => {
    if (isNonWES && clinicalTotal > 0) {
      const allFilled = clinicalFields.every(f => checklist[f.name]);
      if (allFilled && !submitted) {
        setSubmitted(true);
        onSubmit(checklist, gene);
      }
    }
  }, [checklist, clinicalTotal, submitted, isNonWES, clinicalFields]);

  const total = cats.reduce((a,c)=>a+c.items.length, 0);
  useEffect(() => {
    if (!isNonWES && Object.keys(checklist).length===total && total>0 && !submitted) {
      setSubmitted(true);
      onSubmit(checklist, gene);
    }
  }, [checklist, total, submitted, isNonWES]);

  const ckCard = {
    background:T.white, border:`1px solid ${T.border}`,
    borderRadius:"12px", overflow:"hidden",
    boxShadow:"0 2px 10px rgba(0,0,0,.05)", minWidth:"300px",
  };

  if (submitted) return (
    <div style={{...ckCard, padding:"11px 14px"}}>
      <span style={{fontSize:"13px", fontWeight:700, color:T.green, display:"flex", alignItems:"center", gap:"6px"}}>
        <CheckCircle size={14}/> Checklist completed
      </span>
    </div>
  );

  return (
    <div className="dc-check-card" style={ckCard}>
      <div style={{padding:"11px 14px", borderBottom:`1px solid ${T.border}`, fontSize:"11px", fontWeight:800, color:T.muted, letterSpacing:".8px", textTransform:"uppercase", display:"flex", alignItems:"center", gap:"6px"}}>
        <Activity size={12} color={T.p600}/> {isNonWES ? "Clinical Findings" : "Clinical Checklist"}
      </div>

      {isNonWES && (
        <div style={{padding:"10px"}}>
          {clinicalFields.map((field,fi) => (
            <div key={fi} style={{marginBottom: fi === clinicalFields.length - 1 ? 0 : "10px", paddingBottom: fi === clinicalFields.length - 1 ? 0 : "10px", borderBottom: fi === clinicalFields.length - 1 ? "none" : `1px solid ${T.border}`}}>
              <label style={{fontSize:"12px", fontWeight:700, color:T.text, display:"block", marginBottom:"6px"}}>{field.label}</label>
              <div style={{display:"flex", gap:"6px", flexWrap:"wrap"}}>
                {field.opts.map(opt => (
                  <label key={opt} style={{display:"flex", alignItems:"center", gap:"4px", fontSize:"11px", color:T.muted, cursor:"pointer", fontWeight:500, padding:"4px 8px", borderRadius:"6px", background:checklist[field.name]===opt?T.p100:"#fafafa", border:`1px solid ${checklist[field.name]===opt?T.p200:T.border}`}}>
                    <input type="radio" name={field.name} value={opt}
                      checked={checklist[field.name]===opt}
                      onChange={e=>setChecklist(p=>({...p,[field.name]:e.target.value}))}
                      style={{margin:0}}
                    /> {opt}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isNonWES && cats.map((cat,ci) => (
        <div key={ci}>
          <div className="dc-cat-hdr" onClick={()=>setOpenCat(openCat===ci?null:ci)}
            style={{padding:"9px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", borderBottom:`1px solid #f5f5fa`, transition:"background .15s"}}>
            <span style={{fontSize:"12px", fontWeight:700, color:T.text}}>{cat.title}</span>
            <span style={{color:T.light}}>{openCat===ci ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}</span>
          </div>
          {openCat===ci && (
            <div style={{padding:"6px 10px 10px", display:"flex", flexDirection:"column", gap:"5px"}}>
              {cat.items.map((item,ii)=>(
                <div key={ii} className="dc-chk-row"
                  style={{display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", borderRadius:"8px", background:"#fafafa", border:"1px solid #f0f0f8", gap:"10px", transition:"background .15s"}}>
                  <span style={{fontSize:"12px", color:T.text, flex:1, lineHeight:1.4}}>{item}</span>
                  <div style={{display:"flex", gap:"8px", flexShrink:0}}>
                    {["PRESENT","ABSENT","N/A"].map(opt=>(
                      <label key={opt} style={{display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:T.muted, cursor:"pointer", fontWeight:500}}>
                        <input type="radio" name={item} value={opt}
                          checked={checklist[item]===opt}
                          onChange={e=>setChecklist(p=>({...p,[item]:e.target.value}))}
                        /> {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {isNonWES && checklistData && (
        <>
          {[
            { title: "Clinical Action Items", key: "items" },
          ].map((cat, ci) => (
            <div key={ci}>
              <div style={{padding:"9px 14px", borderTop: ci === 0 ? `1px solid ${T.border}` : "none", display:"flex", justifyContent:"space-between", alignItems:"center", background:T.p50}}>
                <span style={{fontSize:"12px", fontWeight:700, color:T.p600}}>{cat.title}</span>
              </div>
              <div style={{padding:"8px 10px", display:"flex", flexDirection:"column", gap:"4px"}}>
                {(checklistData[cat.key] || []).map((item,ii)=>(
                  <div key={ii} style={{display:"flex", alignItems:"center", gap:"8px", padding:"6px 8px", fontSize:"12px", color:T.text}}>
                    <span style={{width:"4px", height:"4px", borderRadius:"50%", background:T.p600, flexShrink:0}}/>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default function DoctorChatbot() {
  const [collapsed,     setCollapsed]     = useState(false);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [file,          setFile]          = useState(null);
  const [fileSize,      setFileSize]      = useState(null);
  const [isRecording,   setIsRecording]   = useState(false);
  const [audioBlob,     setAudioBlob]     = useState(null);
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isAnalyzing,   setIsAnalyzing]   = useState(false);
  const [liveTranscript,setLiveTranscript]= useState("");
  const [interimText,   setInterimText]   = useState("");
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);
  const recognitionRef = useRef(null);
  const chatEndRef  = useRef(null);
  const navigate    = useNavigate();
  const location    = useLocation();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!currentChatId) return;
    (async () => {
      const res = await API.get(`/chat/messages/${currentChatId}`);
      setMessages(res.data.map(m => {
        if (m.type==="analysis-complete") return {...m, gene:m.data?.genetic?.gene, reportType:m.data?.report_type};
        if (m.type==="checklist") return {...m, checklistData:m.data?.checklist || m.data, reportType:m.data?.metadata?.report_type};
        if (m.type==="pp4") return {...m, pp4Data:m.data};
        if (m.sender==="doctor" && m.fileName) return {...m, file:{name:m.fileName, size:m.fileSize}};
        return m;
      }));
    })();
  }, [currentChatId]);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  useEffect(() => {
    return () => {
      console.log("[Chatbot Voice] Cleaning up resources");
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      if (recorderRef.current?.stream) {
        recorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentChatId]);

  const fetchConversations = async () => {
    try {
      const res = await API.get("/chat/conversation");
      setConversations(res.data);
      if (res.data.length > 0) setCurrentChatId(res.data[0]._id);
    } catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    const tr = input.trim().toLowerCase();
    if (!input.trim() && !file && !audioBlob) {
      setMessages(p=>[...p,{sender:"ai",text:"Please upload a gene file or enter clinical findings to begin analysis."}]);
      return;
    }
    
    if (audioBlob && audioBlob.size === 0) {
      console.error("[Chatbot Voice] Error: Audio blob is empty");
      alert("Voice recording error: No audio captured. Please try recording again.");
      return;
    }
    
    const cI=input, cF=file, cA=audioBlob, cFS=fileSize;
    setInput(""); setFile(null); setAudioBlob(null); setFileSize(null); setLiveTranscript(""); setInterimText("");

    const easy = async (t) => {
      setMessages(p=>[...p,{sender:"doctor",text:cI},{sender:"ai",text:t}]);
      try { await API.post("/chat/simple",{conversationId:currentChatId,doctorText:cI,aiText:t}); } catch {}
    };

    if (["hi","hello","hey","good morning","good afternoon"].includes(tr))
      return easy("Hello Doctor 👩‍⚕️ I'm ready to assist you with prenatal gene analysis.");
    if (["thank you","thanks","thankyou"].includes(tr))
      return easy("You're welcome Doctor 😊 I'm always here to assist you.");
    if (tr==="sorry")
      return easy("No worries Doctor. Please continue with the gene details when ready.");

    const kw = ["gene","analysis","clinical","pp4","file","mutation","variant","prenatal","fetal","chromosome","ultrasound","finding","syndrome","disorder","marker","gestation","trimester","amnio","scan","result","positive","negative","present","absent","risk","report","data","patient","case","test","abnormal","heart","brain","growth","nuchal","translucency","hydrops","ventriculomegaly","echogenic","cystic"];
    if (!kw.some(w=>tr.includes(w)) && !cF && !cA && tr.split(/\s+/).length<5)
      return easy("I am specialized in prenatal gene analysis and PP4 scoring. Please provide gene-related information or upload a file.");

    setMessages(p=>[...p,
      { sender:"doctor", text:cI||"", file:cF?{name:cF.name,size:cFS}:null, audio:cA?true:null },
      { sender:"ai", type:"loading" }
    ]);
    setIsAnalyzing(true);

    try {
      let response;
      if (cF||cA) {
        const fd=new FormData();
        if (cF) fd.append("file",cF);
        if (cA) {
          console.log("[Chatbot Voice] Appending audio blob. Size:", cA.size);
          fd.append("file",cA,"recorded.webm");
          if (liveTranscript) {
            console.log("[Chatbot Voice] Using live transcription text for analysis");
            fd.append("voice_transcription", liveTranscript);
          }
        }
        fd.append("text",cI||liveTranscript);
        fd.append("gestation",20);
        fd.append("conversationId",currentChatId);
        if (cF) { fd.append("fileName", cF.name); fd.append("fileSize", cF.size); }
        response = await API.post("/chat",fd);
      } else {
        response = await API.post("/chat",{text:cI,gestation:20,conversationId:currentChatId});
      }
      setMessages(p=>p.filter(m=>m.type!=="loading"));
      const gene = response.data?.data?.genetic?.gene;
      if (!gene) { setMessages(p=>[...p,{sender:"ai",text:"Gene not detected in input."}]); setIsAnalyzing(false); return; }
      
      const reportType = response.data?.data?.report_type;
      
      setMessages(p=>[...p,{sender:"ai",type:"analysis-complete",gene,reportType}]);
      const checklistPayload = { gene, conversationId:currentChatId };
      if (reportType) checklistPayload.reportType = reportType;
      
      const cr = await API.post("/checklist", checklistPayload);
      if (!cr.data.success) { setMessages(p=>[...p,{sender:"ai",text:cr.data.message||"Checklist generation failed."}]); setIsAnalyzing(false); return; }
      
      let checklistData = cr.data.data?.checklist || cr.data.data;
      
      if (Array.isArray(checklistData)) {
        console.log("[Chatbot] Formatting checklist from array to object format");
        const grouped = {};
        checklistData.forEach(item => {
          const cat = item.category || "Clinical Actions";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item.task || String(item));
        });
        checklistData = {
          core_prenatal_findings: grouped["Core Findings"] || grouped["core_prenatal_findings"] || [],
          supportive_findings: grouped["Supportive Findings"] || grouped["supportive_findings"] || [],
          negative_findings: grouped["Negative Findings"] || grouped["negative_findings"] || [],
        };
      }
      
      console.log("[Chatbot] Final checklist format:", checklistData);
      setMessages(p=>[...p,{sender:"ai",type:"checklist",checklistData,gene,reportType}]);
    } catch(err) {
      setMessages(p=>p.filter(m=>m.type!=="loading"));
      const errMsg = err.response?.data?.message || "Gene not detected in dataset.";
      console.error("[Chatbot Voice] Error:", errMsg);
      setMessages(p=>[...p,{sender:"ai",text:errMsg}]);
    }
    setIsAnalyzing(false);
  };

  // ── CHANGE 1: Auto-close panel on mobile after creating new conversation ──
  const handleNew = async () => {
    try {
      const r = await API.post("/chat/conversation");
      await fetchConversations();
      setCurrentChatId(r.data._id);
      setMessages([]);
      setInput("");
      setFile(null);
      setAudioBlob(null);
      setLiveTranscript("");
      setInterimText("");
      setIsRecording(false);
      recognitionRef.current?.stop();
      setPanelOpen(false); // always close panel after new chat (works for both mobile and desktop)
    } catch {}
  };

  const handleMic = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({audio:true});
        const mediaRec = new MediaRecorder(stream);
        recorderRef.current = mediaRec;
        chunksRef.current = [];
        mediaRec.ondataavailable = e => chunksRef.current.push(e.data);
        mediaRec.onstop = () => {
          const blob = new Blob(chunksRef.current, {type:"audio/webm"});
          console.log("[Chatbot Voice] Recording stopped. Blob size:", blob.size);
          setAudioBlob(blob);
        };
        mediaRec.onerror = (e) => {
          console.error("[Chatbot Voice] MediaRecorder error:", e);
          alert("Recording error: " + e.error);
        };
        mediaRec.start();
        setIsRecording(true);
        setLiveTranscript("");
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";
          recognition.onstart = () => console.log("[Chatbot Voice] Speech recognition started");
          recognition.onresult = (e) => {
            let final = "", interim = "";
            for (let i = e.resultIndex; i < e.results.length; i++) {
              if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
              else interim += e.results[i][0].transcript;
            }
            if (final) setLiveTranscript(prev => prev + final);
            setInterimText(interim);
          };
          recognition.onend = () => {
            if (isRecording) recognition.start();
          };
          recognition.onerror = (e) => {
            console.error("[Chatbot Voice] Speech recognition error:", e.error);
          };
          recognition.start();
          recognitionRef.current = recognition;
        }
      } catch (err) {
        console.error("[Chatbot Voice] Microphone error:", err);
        alert("Microphone access denied. Please allow microphone permissions.");
      }
    } else {
      console.log("[Chatbot Voice] Stopping microphone");
      recognitionRef.current?.stop();
      setInterimText("");
      recorderRef.current?.stop();
      setIsRecording(false);
      if (recorderRef.current?.stream) {
        recorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const handleChecklistSubmit = async (data, gene, reportType) => {
    setMessages(p=>[...p,{sender:"doctor",type:"checklist-summary",data}]);
    try { await API.post("/chat/checklist-summary",{conversationId:currentChatId,selections:data}); } catch {}
    setTimeout(()=>calcPP4(data,gene,reportType),500);
  };

  const calcPP4 = async (data, gene, reportType) => {
    const isNonWES = gene === "NOT_APPLICABLE" || gene === "UNKNOWN" || gene === "QUOTA_EXHAUSTED";

    if (isNonWES) {
      try {
        const clinicalFindings = {};
        if (reportType === "CMA") {
          clinicalFindings.cnv_result = (data.cnv_result || "").toLowerCase();
          clinicalFindings.consanguinity = data.consanguinity === "Yes" ? "yes" : "no";
          clinicalFindings.microdeletions = data.microdeletions === "Present" ? "detected" : "none";
          clinicalFindings.roh = data.roh === "Detected" ? "detected" : "none";
          clinicalFindings.cardiac_findings = data.cardiac_findings === "Present" ? ["cardiac finding"] : [];
        } else if (reportType === "SCAN") {
          clinicalFindings.anomalies = data.anomalies === "Present" ? ["anomaly"] : [];
          clinicalFindings.nt = data.nt === "Abnormal" ? "abnormal" : "normal";
          clinicalFindings.nasal_bone = data.nasal_bone ? data.nasal_bone.toLowerCase().replace(/\s+/g, "_") : "normal";
          clinicalFindings.doppler = data.doppler === "Abnormal" ? "abnormal" : "normal";
          clinicalFindings.liquor = data.liquor ? data.liquor.toLowerCase().replace(/\s+/g, "_") : "normal";
        } else if (reportType === "SERUM") {
          clinicalFindings.nt_result = data.nt_result === "Abnormal" ? "abnormal" : "normal";
          clinicalFindings.nasal_bone = data.nasal_bone ? data.nasal_bone.toLowerCase().replace(/\s+/g, "_") : "normal";
          clinicalFindings.ductus_venosus = data.ductus_venosus === "Abnormal" ? "abnormal" : "normal";
          clinicalFindings.tricuspid = data.tricuspid === "Present" ? "yes" : "no";
        }

        const r = await API.post("/pp4",{gene,gestation:20,extracted_data:clinicalFindings,reportType,conversationId:currentChatId});
        setMessages(p=>[...p,{sender:"ai",type:"clinical-risk",gene,reportType,riskData:r.data.data}]);
      } catch (e) {
        console.error("Clinical risk calculation failed:", e);
        setMessages(p=>[...p,{sender:"ai",text:"Clinical risk calculation failed: " + (e.response?.data?.message || e.message)}]);
      }
      return;
    }

    try {
      const sel={core:{},supportive:{},negative:{}};
      Object.entries(data).forEach(([k,v])=>{sel.core[k]=v;});
      const r = await API.post("/pp4",{gene,gestation:20,selections:sel,conversationId:currentChatId});
      setMessages(p=>[...p,{sender:"ai",type:"pp4",gene,pp4Data:r.data.data}]);
    } catch (e) {
      console.error("PP4 calculation failed:", e);
      setMessages(p=>[...p,{sender:"ai",text:"PP4 calculation failed: " + (e.response?.data?.message || e.message)}]);
    }
  };

  const handleRename = async (id) => {
    const n=prompt("New name:"); if(!n) return;
    try { await API.put(`/chat/conversation/${id}`,{title:n}); await fetchConversations(); } catch {}
  };
  const handleDelete = async (id) => {
    if(!window.confirm("Delete?")) return;
    try { await API.delete(`/chat/conversation/${id}`); await fetchConversations(); } catch {}
  };

  /* ── Render a single message ── */
  const renderMsg = (msg, idx) => {
    const isDoc = msg.sender === "doctor";

    const docBubble = {
      fontSize:"14px", lineHeight:"1.65",
      display:"flex", flexDirection:"column", gap:"8px",
      maxWidth:"65%",
      padding:"11px 14px",
      borderRadius:"18px 18px 4px 18px",
      background:`linear-gradient(135deg,${T.p600},${T.p500})`,
      color:"#fff",
      boxShadow:`0 4px 16px rgba(124,58,237,.22)`,
    };
    const aiBubble = {
      fontSize:"14px", lineHeight:"1.65",
      display:"flex", flexDirection:"column", gap:"6px",
      maxWidth:"72%",
      padding:"12px 16px",
      borderRadius:"18px 18px 18px 4px",
      background:T.white, border:`1px solid ${T.border}`,
      color:T.text, boxShadow:"0 2px 10px rgba(0,0,0,.05)",
    };

    return (
      <div key={idx} className="dc-msg"
        style={{display:"flex",justifyContent:isDoc?"flex-end":"flex-start",alignItems:"flex-end",gap:"8px"}}>

        {!isDoc && (
          <div style={{width:"32px",height:"32px",borderRadius:"10px",background:`linear-gradient(145deg,${T.p600},${T.p500})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 10px rgba(124,58,237,.28)`}}>
            <Dna size={14} color="#fff"/>
          </div>
        )}

        <div className={isDoc?"dc-bubble-doc":"dc-bubble-ai"} style={isDoc?docBubble:aiBubble}>

          {isDoc && msg.file && (
            <div className="dc-att-card">
              <div className="dc-att-icon">
                <FileText size={16} color="#fff"/>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="dc-att-name">{msg.file.name}</div>
                <div className="dc-att-meta">
                  <span style={{padding:"1px 6px",borderRadius:"4px",background:"rgba(255,255,255,.18)",fontSize:"9.5px",fontWeight:800,letterSpacing:".4px",textTransform:"uppercase",color:"rgba(255,255,255,.9)"}}>
                    {fileType(msg.file.name)}
                  </span>
                  {msg.file.size && <><span className="dc-att-dot"/><span>{fmtSize(msg.file.size)}</span></>}
                </div>
              </div>
              <div style={{width:"22px",height:"22px",borderRadius:"6px",background:"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <CheckCircle size={11} color="rgba(255,255,255,.8)"/>
              </div>
            </div>
          )}

          {isDoc && msg.audio && (
            <div className="dc-att-card" style={{background:"rgba(255,255,255,.10)"}}>
              <div className="dc-att-icon" style={{background:"rgba(255,255,255,.15)"}}>
                <Mic size={16} color="#fff"/>
              </div>
              <div>
                <div className="dc-att-name">Voice Recording</div>
                <div className="dc-att-meta">
                  <span style={{padding:"1px 6px",borderRadius:"4px",background:"rgba(255,255,255,.18)",fontSize:"9.5px",fontWeight:800,textTransform:"uppercase",color:"rgba(255,255,255,.9)"}}>AUDIO</span>
                  <span className="dc-att-dot"/>
                  <span>Sent</span>
                </div>
              </div>
            </div>
          )}

          {isDoc && msg.text && (
            <div className={msg.file || msg.audio ? "dc-att-text" : ""}>
              {msg.text}
            </div>
          )}

          {!isDoc && msg.text && <span>{msg.text}</span>}

          {msg.type==="loading" && (
            <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 14px",background:T.p50,border:`1px solid ${T.p200}`,borderRadius:"12px",color:T.p600,fontSize:"13px",fontWeight:600}}>
              <div style={{width:"15px",height:"15px",borderRadius:"50%",border:`2px solid ${T.p200}`,borderTopColor:T.p600,animation:"spin .7s linear infinite",flexShrink:0}}/>
              Analyzing gene data… please wait
            </div>
          )}

          {msg.type==="analysis-complete" && (
            <div style={{borderRadius:"12px",overflow:"hidden",border:`1px solid ${T.p200}`,background:T.white,boxShadow:`0 4px 16px rgba(124,58,237,.07)`}}>
              <div style={{padding:"10px 14px",background:`linear-gradient(135deg,${T.p700},${T.p500})`,color:"#fff",fontSize:"12px",fontWeight:800,letterSpacing:".5px",display:"flex",alignItems:"center",gap:"6px"}}>
                <CheckCircle size={12}/> ANALYSIS COMPLETE
              </div>
              <div style={{padding:"8px 14px",background:T.p50,borderBottom:`1px solid ${T.p200}`,fontSize:"13px",fontWeight:700,color:T.p600,display:"flex",alignItems:"center",gap:"6px"}}>
                <Dna size={12}/> {msg.reportType ? `Report: ${msg.reportType}` : `Gene: ${msg.gene}`}
              </div>
              <div style={{padding:"10px 14px",fontSize:"13px",color:T.muted}}>
                Initial gene analysis complete. Proceed with the clinical checklist below.
              </div>
            </div>
          )}

          {msg.type==="checklist" && (
            <ChecklistCard onSubmit={(d)=>handleChecklistSubmit(d,msg.gene,msg.reportType)} checklistData={msg.checklistData} gene={msg.gene} reportType={msg.reportType}/>
          )}

          {msg.type==="checklist-summary" && (
            <div style={{background:T.p50,border:`1px solid ${T.p200}`,borderRadius:"10px",padding:"10px 13px"}}>
              <div style={{fontSize:"11px",fontWeight:800,color:T.p600,marginBottom:"7px",textTransform:"uppercase",letterSpacing:".5px"}}>Checklist Submitted</div>
              {Object.entries(msg.data).map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:"6px",marginBottom:"3px",fontSize:"12px",alignItems:"center"}}>
                  <span style={{color:T.light}}>•</span>
                  <span style={{color:T.muted}}>{k}:</span>
                  <span style={{color:T.p600,fontWeight:700}}>{v}</span>
                </div>
              ))}
            </div>
          )}

          {msg.type==="clinical-risk" && (()=>{
            const risk = msg.riskData;
            const finalScore = risk?.pp4_result?.final_score ?? risk?.final_score ?? 0;
            const rawScore = risk?.pp4_result?.raw_score ?? risk?.raw_score ?? 0;
            const multiplier = risk?.pp4_result?.multiplier ?? risk?.multiplier ?? 1;
            const riskLevel = risk?.summaries?.risk_level ?? risk?.risk_level ?? "Unknown";
            const scoreType = risk?.pp4_result?.score_type ?? "Clinical Score";
            const summary = risk?.summaries?.doctor_summary ?? risk?.doctor_summary ?? "";
            
            const interp = summary.match(/Interpretation:(.*?)(Recommended Action:|$)/s);
            const recom = summary.match(/Recommended Action:(.*)/s);
            
            const riskStyle={
              "Low Risk":     {bg:"rgba(34,197,94,.08)",bd:"1px solid rgba(34,197,94,.3)",c:"#22c55e"},
              "Moderate Risk":{bg:"rgba(245,158,11,.08)",bd:"1px solid rgba(245,158,11,.3)",c:"#f59e0b"},
            }[riskLevel]||{bg:"rgba(239,68,68,.08)",bd:"1px solid rgba(239,68,68,.3)",c:"#ef4444"};
            
            const scoreBarWidth = Math.min(100, (finalScore / 10) * 100);
            
            return (
              <div className="dc-pp4-panel" style={{width:"100%",maxWidth:"560px"}}>
                <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:"16px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,.08)"}}>
                  <div style={{padding:"14px 20px",background:`linear-gradient(135deg,${T.p700},#9333ea)`,color:"#fff",fontSize:"13px",fontWeight:800,display:"flex",alignItems:"center",gap:"8px"}}>
                    <BarChart2 size={14}/>
                    <span>Clinical Risk Score</span>
                    <span style={{fontSize:"11px",fontWeight:600,marginLeft:"auto",opacity:0.8}}>Clinical assessment based on {msg.reportType || msg.gene} findings</span>
                  </div>
                  
                  <div style={{display:"flex",gap:"10px",padding:"16px"}}>
                    <div style={{flex:1,background:T.p50,border:`1px solid ${T.p200}`,borderRadius:"12px",padding:"12px 8px",textAlign:"center"}}>
                      <div style={{fontSize:"22px",fontWeight:900,color:T.p600,marginBottom:"2px"}}>{rawScore}</div>
                      <div style={{fontSize:"10px",color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>Raw Score</div>
                    </div>
                    <div style={{flex:1,background:T.p50,border:`1px solid ${T.p200}`,borderRadius:"12px",padding:"12px 8px",textAlign:"center"}}>
                      <div style={{fontSize:"22px",fontWeight:900,color:T.p600,marginBottom:"2px"}}>×{multiplier}</div>
                      <div style={{fontSize:"10px",color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>Multiplier</div>
                    </div>
                    <div style={{flex:1,background:`linear-gradient(135deg,${T.p600},${T.p700})`,border:`1px solid ${T.p700}`,borderRadius:"12px",padding:"12px 8px",textAlign:"center"}}>
                      <div style={{fontSize:"22px",fontWeight:900,color:"#fff",marginBottom:"2px"}}>{finalScore}</div>
                      <div style={{fontSize:"10px",color:"rgba(255,255,255,.7)",fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>Final Score</div>
                    </div>
                  </div>
                  
                  <div style={{padding:"0 16px 12px"}}>
                    <div style={{marginBottom:"6px",display:"flex",justifyContent:"space-between",fontSize:"10px",color:T.muted,fontWeight:600}}>
                      <span>0 — Low</span>
                      <span>5 — Moderate</span>
                      <span>10 — High</span>
                    </div>
                    <div style={{height:"6px",background:T.light,borderRadius:"3px",overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${scoreBarWidth}%`,background:`linear-gradient(90deg,#22c55e,#f59e0b,#ef4444)`,transition:"width .4s ease"}}/>
                    </div>
                  </div>
                  
                  <div style={{display:"flex",gap:"8px",padding:"0 16px 14px",flexWrap:"wrap"}}>
                    <div style={{padding:"5px 11px",borderRadius:"16px",fontSize:"11px",fontWeight:700,background:T.p50,border:`1px solid ${T.p200}`,color:T.p600}}>
                      <Activity size={11} style={{display:"inline",marginRight:"4px"}}/>{scoreType.replace(/_/g," ")}
                    </div>
                    <div style={{padding:"5px 11px",borderRadius:"16px",fontSize:"11px",fontWeight:700,background:riskStyle.bg,border:riskStyle.bd,color:riskStyle.c}}>
                      {riskLevel}
                    </div>
                  </div>
                  
                  <div style={{margin:"0 16px 16px",background:"#fafafa",border:`1px solid ${T.border}`,borderRadius:"12px",padding:"16px",lineHeight:1.7}}>
                    <div style={{marginBottom:"14px"}}>
                      <div style={{fontSize:"11px",fontWeight:800,color:T.p600,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:"10px",display:"flex",alignItems:"center",gap:"7px"}}>
                        <Heart size={14} color={T.p600}/> Clinical Summary
                      </div>
                      <div style={{fontSize:"13px",color:T.text,lineHeight:1.7,fontWeight:500}}>{summary.split("Interpretation:")[0]?.trim() || "Clinical assessment completed."}</div>
                    </div>
                    
                    {interp?.[1]?.trim() && (
                      <div style={{marginBottom:"14px",paddingTop:"12px",paddingBottom:"12px",borderTop:`1px solid ${T.border}`,borderBottom:`1px solid ${T.border}`}}>
                        <div style={{fontSize:"11px",fontWeight:800,color:T.p600,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:"8px"}}>📋 Interpretation</div>
                        <div style={{fontSize:"13px",color:T.text,lineHeight:1.7,fontWeight:500}}>{interp[1].trim()}</div>
                      </div>
                    )}
                    
                    {recom?.[1]?.trim() && (
                      <div style={{paddingTop:"12px"}}>
                        <div style={{fontSize:"11px",fontWeight:800,color:riskStyle.c,letterSpacing:"1.2px",textTransform:"uppercase",marginBottom:"8px",display:"flex",alignItems:"center",gap:"6px"}}>
                          <span style={{width:"3px",height:"3px",background:riskStyle.c,borderRadius:"50%",display:"inline-block"}}/>
                          🎯 Recommended Action
                        </div>
                        <div style={{fontSize:"13px",color:T.text,lineHeight:1.7,fontWeight:500,paddingLeft:"8px",borderLeft:`3px solid ${riskStyle.c}`}}>{recom[1].trim()}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {msg.type==="pp4" && (()=>{
            const pp4=msg.pp4Data;
            const sum=pp4?.summaries?.doctor_summary||"";
            const interp=sum.match(/Interpretation:(.*?)(Recommended Action:|$)/s);
            const recom=sum.match(/Recommended Action:(.*)/s);
            const risk=pp4?.summaries?.risk_level;
            const state=pp4?.pp4_result?.state;
            const riskStyle={
              "Low Risk":     {bg:T.greenBg,bd:T.greenBd,c:T.green},
              "Moderate Risk":{bg:T.amberBg,bd:T.amberBd,c:T.amber},
            }[risk]||{bg:T.redBg,bd:T.redBd,c:T.red};
            return (
              <div className="dc-pp4-panel" style={{width:"100%",maxWidth:"440px"}}>
                <div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:"16px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,.08)"}}>
                  <div style={{padding:"14px 20px",background:`linear-gradient(135deg,${T.p700},#9333ea)`,color:"#fff",fontSize:"13px",fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:"8px"}}>
                    <Activity size={14}/> PP4 Score Panel
                  </div>
                  <div className="dc-pp4-score-row" style={{display:"flex",gap:"8px",padding:"14px 14px 0"}}>
                    {[{label:"Raw Score",val:pp4?.pp4_result?.raw_score},{label:"Multiplier",val:`× ${pp4?.pp4_result?.multiplier}`},{label:"Final",val:pp4?.pp4_result?.final_score}].map(({label,val})=>(
                      <div key={label} style={{flex:1,background:T.p50,border:`1px solid ${T.p200}`,borderRadius:"10px",padding:"11px 6px",textAlign:"center"}}>
                        <div style={{fontSize:"19px",fontWeight:900,color:T.p600,marginBottom:"2px"}}>{val}</div>
                        <div style={{fontSize:"10px",color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:".4px"}}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:"7px",padding:"11px 14px 0",flexWrap:"wrap"}}>
                    <div style={{padding:"4px 11px",borderRadius:"16px",fontSize:"11px",fontWeight:700,background:state==="PP4_MET"?T.greenBg:"#f3f4f6",border:`1px solid ${state==="PP4_MET"?T.greenBd:"#e5e7eb"}`,color:state==="PP4_MET"?T.green:T.muted}}>{state?.replace(/_/g," ")}</div>
                    <div style={{padding:"4px 11px",borderRadius:"16px",fontSize:"11px",fontWeight:700,background:riskStyle.bg,border:`1px solid ${riskStyle.bd}`,color:riskStyle.c}}>{risk}</div>
                  </div>
                  <div style={{margin:"12px 14px 14px",background:"#fafafa",border:`1px solid ${T.border}`,borderRadius:"10px",padding:"14px"}}>
                    <div style={{fontSize:"10px",fontWeight:800,color:T.p600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"8px"}}>Reasoning Summary</div>
                    {[["Gene",msg.gene],["Final Score",pp4?.pp4_result?.final_score],["ACMG Rule",state?.replace(/_/g," ")],["Clinical Risk",risk]].map(([k,v])=>(
                      <div key={k} style={{display:"flex",gap:"8px",fontSize:"12px",marginBottom:"5px"}}>
                        <span style={{fontWeight:700,color:T.muted,minWidth:"86px",fontSize:"11px"}}>{k}</span>
                        <span style={{fontWeight:600}}>{v}</span>
                      </div>
                    ))}
                    {(interp?.[1]||recom?.[1])&&<div style={{height:"1px",background:T.border,margin:"10px 0"}}/>}
                    {interp?.[1]?.trim()&&(<div style={{marginBottom:"9px"}}><div style={{fontSize:"10px",fontWeight:800,color:T.p600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"4px"}}>Interpretation</div><div style={{fontSize:"12px",color:T.muted,lineHeight:1.7}}>{interp[1].trim()}</div></div>)}
                    {recom?.[1]?.trim()&&(<div><div style={{fontSize:"10px",fontWeight:800,color:T.p600,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"4px"}}>Recommended Action</div><div style={{fontSize:"12px",color:T.muted,lineHeight:1.7}}>{recom[1].trim()}</div></div>)}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    );
  };

  const PanelContent = () => (
    <>
      <div style={{padding:"0 16px",height:"64px",background:`linear-gradient(135deg,${T.p700},${T.p600})`,display:"flex",alignItems:"center",gap:"10px",flexShrink:0}}>
        <History size={15} color="rgba(255,255,255,.75)"/>
        <span style={{flex:1,fontSize:"14px",fontWeight:800,color:"#fff",letterSpacing:".2px"}}>Chat History</span>
        <button className="dc-new-btn" onClick={handleNew}
          style={{display:"flex",alignItems:"center",gap:"5px",padding:"6px 12px",borderRadius:"8px",background:"rgba(255,255,255,.18)",border:"1px solid rgba(255,255,255,.28)",color:"#fff",fontSize:"12px",fontWeight:700,cursor:"pointer",transition:"background .15s",whiteSpace:"nowrap"}}>
          <Plus size={11}/> New
        </button>
        {isMobile && (
          <button onClick={()=>setPanelOpen(false)}
            style={{width:"28px",height:"28px",background:"rgba(255,255,255,.15)",border:"none",borderRadius:"7px",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:"2px"}}>
            <ChevronLeft size={15}/>
          </button>
        )}
      </div>
      <div className="dc-convlist" style={{flex:1,overflowY:"auto",padding:"10px 8px"}}>
        {conversations.length===0
          ? <div style={{padding:"32px 16px",textAlign:"center",fontSize:"12px",color:T.muted}}>
              <MessageSquare size={28} color={T.light} style={{margin:"0 auto 8px",display:"block"}}/>
              No conversations yet
            </div>
          : conversations.map(conv=>(
            <div key={conv._id}
              className={`dc-conv-item${conv._id===currentChatId?" active":""}`}
              style={{display:"flex",alignItems:"center",padding:"9px 10px",borderRadius:"10px",cursor:"pointer",marginBottom:"3px",background:conv._id===currentChatId?T.p100:"transparent",border:`1px solid ${conv._id===currentChatId?T.p200:"transparent"}`,transition:"all .15s"}}>
              <div style={{width:"8px",height:"8px",borderRadius:"50%",background:conv._id===currentChatId?T.p600:T.light,flexShrink:0,marginRight:"9px",transition:"background .2s"}}/>
              <span style={{flex:1,fontSize:"13px",color:T.text,fontWeight:500,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}
                onClick={()=>{ setCurrentChatId(conv._id); if(isMobile) setPanelOpen(false); }}>
                {conv.title}
              </span>
              <div style={{display:"flex",gap:"1px",flexShrink:0}}>
                <button className="dc-edit-btn" title="Rename"
                  style={{background:"none",border:"none",cursor:"pointer",color:T.light,padding:"4px 5px",borderRadius:"6px",display:"flex",alignItems:"center",transition:"all .15s"}}
                  onClick={()=>handleRename(conv._id)}><LucideEdit2 size={12}/></button>
                <button className="dc-del-btn" title="Delete"
                  style={{background:"none",border:"none",cursor:"pointer",color:T.light,padding:"4px 5px",borderRadius:"6px",display:"flex",alignItems:"center",transition:"all .15s"}}
                  onClick={()=>handleDelete(conv._id)}><Trash2 size={12}/></button>
              </div>
            </div>
          ))
        }
      </div>
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className={`dc-overlay${panelOpen && isMobile ? " show" : ""}`} onClick={()=>setPanelOpen(false)}/>

      <div style={{display:"flex",height:"100vh",background:T.bg,fontFamily:"'Plus Jakarta Sans',sans-serif",overflow:"hidden"}}>

        <div className="dc-sidebar-wrap">
          <Sidebar collapsed={collapsed} toggle={()=>setCollapsed(!collapsed)}/>
        </div>

        <div className="dc-main" style={{
          flex:1, display:"flex", flexDirection:"column",
          marginLeft:collapsed?"72px":"240px",
          transition:"margin-left .3s cubic-bezier(.4,0,.2,1)",
          background:T.bg, overflow:"hidden", position:"relative", minWidth:0,
        }}>

          {/* ══ TOPBAR ══ */}
          <div style={{height:"64px",flexShrink:0,background:T.white,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",padding:"0 16px",gap:"10px",boxShadow:"0 1px 0 rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.04)",zIndex:20,position:"relative"}}>

            {/* ── CHANGE 2: Mobile Home icon removed — desktop-only history toggle ── */}
            {!isMobile && (
              <button className="dc-ham" onClick={()=>setPanelOpen(v=>!v)} title="Chat history"
                style={{width:"38px",height:"38px",background:panelOpen?T.p100:"transparent",border:`1.5px solid ${panelOpen?T.p200:T.border}`,borderRadius:"11px",color:panelOpen?T.p600:T.sub,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .18s",flexShrink:0}}>
                <Menu size={18}/>
              </button>
            )}

            <div style={{width:"1px",height:"28px",background:T.border,flexShrink:0}}/>

            <div style={{display:"flex",alignItems:"center",gap:"9px",flex:1,minWidth:0}}>
              <div style={{width:"34px",height:"34px",borderRadius:"10px",background:`linear-gradient(135deg,${T.p600},${T.p500})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 3px 10px rgba(124,58,237,.25)`}}>
                <Dna size={16} color="#fff"/>
              </div>
              <div style={{minWidth:0}}>
                <div className="dc-topbar-title" style={{fontSize:"15px",fontWeight:800,color:T.text,letterSpacing:"-.2px",lineHeight:1.2}}>
                  Prenatal Gene Copilot
                </div>
                <div className="dc-topbar-sub" style={{fontSize:"11px",color:T.muted,fontWeight:500}}>
                  {currentChatId ? conversations.find(c=>c._id===currentChatId)?.title || "Active session" : "Gene analysis & PP4 scoring"}
                </div>
              </div>
            </div>

            {/* Right side controls */}
            <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}}>

              {/* Mobile: history toggle on right side only */}
              {isMobile && (
                <button className="dc-ham" onClick={()=>setPanelOpen(v=>!v)} title="Chat history"
                  style={{width:"38px",height:"38px",background:panelOpen?T.p100:"transparent",border:`1.5px solid ${panelOpen?T.p200:T.border}`,borderRadius:"11px",color:panelOpen?T.p600:T.sub,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .18s",flexShrink:0}}>
                  <Menu size={18}/>
                </button>
              )}

              {/* Online pill (desktop) */}
              <div className="dc-online-pill" style={{display:"flex",alignItems:"center",gap:"5px",padding:"5px 11px",borderRadius:"20px",background:T.p50,border:`1px solid ${T.p200}`,fontSize:"11px",fontWeight:700,color:T.p600}}>
                <span style={{width:"6px",height:"6px",borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>
                Online
              </div>

              {/* Profile avatar */}
              <div
                className="dc-profile-btn"
                title="View Profile"
                onClick={() => navigate("/profile")}
              >
                <User size={16}/>
              </div>

            </div>
          </div>

          <div style={{display:"flex",flex:1,overflow:"hidden"}}>
            {panelOpen && !isMobile && (
              <div className="dc-panel dc-panel-inline"
                style={{width:"260px",flexShrink:0,background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",boxShadow:"2px 0 16px rgba(109,40,217,.06)",zIndex:10}}>
                <PanelContent/>
              </div>
            )}
            {panelOpen && isMobile && (
              <div className="dc-panel"
                style={{position:"fixed",top:0,left:0,width:"280px",height:"100vh",background:T.white,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",boxShadow:"4px 0 32px rgba(0,0,0,.14)",zIndex:36}}>
                <PanelContent/>
              </div>
            )}

            <div className="dc-chat-body" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
              <div className="dc-messages" style={{flex:1,overflowY:"auto",padding:"28px 40px 12px",display:"flex",flexDirection:"column",gap:"16px"}}>
                {messages.length===0 && (
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,gap:"14px",padding:"40px 20px"}}>
                    <div style={{width:"68px",height:"68px",borderRadius:"20px",background:`linear-gradient(145deg,${T.p100},${T.p50})`,border:`2px solid ${T.p200}`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 8px 28px rgba(124,58,237,.14)`}}>
                      <Dna size={30} color={T.p600}/>
                    </div>
                    <div style={{fontSize:"22px",fontWeight:800,color:T.text,letterSpacing:"-.4px"}}>Welcome, Doctor</div>
                    <div style={{fontSize:"14px",color:T.muted,textAlign:"center",lineHeight:1.65,maxWidth:"340px"}}>
                      Upload a gene file or describe clinical findings to begin prenatal analysis.
                    </div>
                    <div style={{display:"flex",gap:"10px",marginTop:"6px",flexWrap:"wrap",justifyContent:"center"}}>
                      {["📄 Upload file","🎤 Voice input","⌨️ Type findings"].map(h=>(
                        <span key={h} style={{padding:"7px 14px",borderRadius:"20px",background:T.white,border:`1px solid ${T.border}`,fontSize:"12px",color:T.sub,fontWeight:500,boxShadow:"0 1px 4px rgba(0,0,0,.05)"}}>{h}</span>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m,i)=>renderMsg(m,i))}
                <div ref={chatEndRef}/>
              </div>

              {/* ── Input bar ── */}
              <div className="dc-input-wrap" style={{background:T.white,borderTop:`1px solid ${T.border}`,padding:"10px 20px 16px",boxShadow:"0 -2px 16px rgba(0,0,0,.04)",flexShrink:0}}>

                {file && (
                  <div style={{display:"flex",alignItems:"center",gap:"10px",background:"#f5f3ff",border:`1px solid ${T.p200}`,borderRadius:"12px",padding:"9px 13px",marginBottom:"8px"}}>
                    <div style={{width:"38px",height:"38px",borderRadius:"10px",background:`linear-gradient(135deg,${T.p600},${T.p500})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <FileText size={16} color="#fff"/>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:"13px",fontWeight:700,color:T.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{file.name}</div>
                      <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"2px"}}>
                        <span style={{padding:"1px 7px",borderRadius:"5px",background:T.p100,border:`1px solid ${T.p200}`,fontSize:"9.5px",fontWeight:800,textTransform:"uppercase",letterSpacing:".4px",color:T.p600}}>
                          {fileType(file.name)}
                        </span>
                        <span style={{fontSize:"11px",color:T.muted}}>{fmtSize(file.size)}</span>
                        <span style={{fontSize:"11px",color:T.green,fontWeight:600}}>· Ready to send</span>
                      </div>
                    </div>
                    <button onClick={()=>{setFile(null);setFileSize(null);}}
                      style={{background:"none",border:"none",cursor:"pointer",padding:"4px",display:"flex",alignItems:"center",color:T.muted}}>
                      <X size={15}/>
                    </button>
                  </div>
                )}

                {(isRecording || audioBlob || liveTranscript) && (
                  <div style={{display:"flex",flexDirection:"column",gap:"8px",background:T.p50,border:`1px solid ${T.p200}`,borderRadius:"12px",padding:"12px",marginBottom:"8px"}}>
                    {isRecording && (
                      <div style={{display:"flex",alignItems:"center",gap:"8px",color:T.p600,fontSize:"13px",fontWeight:600}}>
                        <div style={{width:"10px",height:"10px",background:T.red,borderRadius:"50%",animation:"pulse 1s infinite"}}/>
                        Recording in progress...
                      </div>
                    )}
                    
                    {(liveTranscript || interimText) && (
                      <div style={{background:"#fff",border:`1px solid ${T.border}`,borderRadius:"8px",padding:"10px",fontSize:"13px",color:T.text,lineHeight:"1.5"}}>
                        <div style={{fontWeight:500,color:T.p600,marginBottom:"4px"}}>Transcription:</div>
                        <div>{liveTranscript}<span style={{fontStyle:"italic",opacity:0.7}}>{interimText}</span></div>
                      </div>
                    )}
                    
                    {audioBlob && (
                      <div style={{display:"flex",alignItems:"center",gap:"10px",background:"#fff",border:`1px solid ${T.border}`,borderRadius:"10px",padding:"10px"}}>
                        <div style={{width:"36px",height:"36px",borderRadius:"8px",background:`linear-gradient(135deg,${T.p600},${T.p500})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <Mic size={15} color="#fff"/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"12px",fontWeight:700,color:T.p600,marginBottom:"5px"}}>
                            Audio Ready • {(audioBlob.size / 1024).toFixed(1)}KB
                          </div>
                          <audio controls src={URL.createObjectURL(audioBlob)} 
                            style={{width:"100%",maxWidth:"240px",height:"24px",outline:"none"}}/>
                        </div>
                        <button onClick={()=>{setAudioBlob(null);setLiveTranscript("");}}
                          style={{background:"none",border:"none",cursor:"pointer",padding:"4px",display:"flex",alignItems:"center",color:T.muted}}>
                          <X size={16}/>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <style>{`
                  @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                  }
                `}</style>

                <div className="dc-inputbar" style={{display:"flex",alignItems:"center",gap:"8px",background:"#f8f8fc",border:`1.5px solid ${T.border}`,borderRadius:"14px",padding:"5px 8px",transition:"border-color .2s, box-shadow .2s"}}>
                  <label className="dc-clip" style={{color:T.light,cursor:"pointer",display:"flex",alignItems:"center",padding:"7px",borderRadius:"9px",transition:"all .15s"}} title="Attach file">
                    <Paperclip size={17}/>
                    <input hidden type="file" onChange={e=>{const f=e.target.files[0];if(f){setFile(f);setFileSize(f.size);}e.target.value="";}}/>
                  </label>
                  <input type="text"
                    placeholder={file?"Add a message or send file…":"Type clinical findings or gene details..."}
                    value={input} onChange={e=>setInput(e.target.value)}
                    onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
                    style={{flex:1,background:"none",border:"none",outline:"none",fontSize:"14px",color:T.text,padding:"9px 8px",height:"44px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}
                  />
                  <button type="button" className={`dc-mic-btn${isRecording?" dc-recording":""}`}
                    style={{width:"42px",height:"42px",borderRadius:"11px",flexShrink:0,
                      background:isRecording?"#fef2f2":"#f3f4f6",
                      border:`1.5px solid ${isRecording?"#fca5a5":"#e5e7eb"}`,
                      color:isRecording?T.red:T.muted,
                      display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"}}
                    onClick={handleMic}>
                    <Mic size={16}/>
                  </button>
                  <button className="dc-send-btn" onClick={handleSend}
                    style={{width:"42px",height:"42px",borderRadius:"11px",flexShrink:0,background:`linear-gradient(135deg,${T.p600},${T.p500})`,border:"none",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s",boxShadow:`0 4px 14px rgba(124,58,237,.32)`}}>
                    <Send size={16}/>
                  </button>
                </div>

                {isRecording && (
                  <div style={{display:"flex",alignItems:"center",gap:"7px",marginTop:"7px",padding:"6px 12px",background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:"8px"}}>
                    <span style={{width:"7px",height:"7px",borderRadius:"50%",background:T.red,display:"inline-block",animation:"pulseRed 1s infinite"}}/>
                    <span style={{fontSize:"12px",fontWeight:700,color:T.red}}>Recording… tap mic to stop</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="dc-bottom-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path === "/dashboard" && (location.pathname === "/" || location.pathname === "/dashboard"));
          return (
            <button key={item.path} className={`dc-nav-item${isActive ? " active" : ""}`} onClick={() => navigate(item.path)}>
              <div className="dc-nav-icon">
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.2 : 1.8} color={isActive ? "#4f46e5" : "#9ca3af"}/>
              </div>
              <span className="dc-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}