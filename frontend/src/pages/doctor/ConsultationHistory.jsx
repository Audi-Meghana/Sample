import { useState } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import MobileBottomBar from "../../components/doctor/MobileBottomBar";
import { useNavigate } from "react-router-dom";
import { useHistoryContext } from "../../context/HistoryContext";
import {
  History, Search, FileText, FilePlus, Edit,
  Trash2, CheckCircle, Dna, Clock, Activity, User, MessageCircle,
} from "lucide-react";

/* ─── action style maps ─── */
const ICO_GRAD = {
  CREATED:                     "linear-gradient(135deg,#059669,#34d399)",
  UPDATED:                     "linear-gradient(135deg,#2563eb,#60a5fa)",
  STATUS_CHANGED:              "linear-gradient(135deg,#7c3aed,#a78bfa)",
  DELETED:                     "linear-gradient(135deg,#dc2626,#f87171)",
  GENE_ANALYSIS:               "linear-gradient(135deg,#6d5acd,#a89ee8)",
  PP4_RESULT:                  "linear-gradient(135deg,#d97706,#fbbf24)",
  CHATBOT:                     "linear-gradient(135deg,#0891b2,#22d3ee)",
  CHAT_CONVERSATION_CREATED:   "linear-gradient(135deg,#0891b2,#22d3ee)",
  CHAT_CONVERSATION_DELETED:   "linear-gradient(135deg,#64748b,#94a3b8)",
  CHAT_CONVERSATION_RENAMED:   "linear-gradient(135deg,#0369a1,#38bdf8)",
CHAT_PP4_CALCULATED:         "linear-gradient(135deg,#d97706,#fbbf24)",
  
};
const LEFT_BORDER = {
  CREATED:"#34d399", UPDATED:"#60a5fa", STATUS_CHANGED:"#a78bfa",
  DELETED:"#f87171", GENE_ANALYSIS:"#a89ee8", PP4_RESULT:"#fbbf24",
  CHATBOT:"#22d3ee",
  CHAT_CONVERSATION_CREATED:"#22d3ee",
  CHAT_CONVERSATION_DELETED:"#94a3b8",
  CHAT_CONVERSATION_RENAMED:   "#38bdf8",
CHAT_PP4_CALCULATED:         "#fbbf24",
};
const MSG_STYLE = {
  CREATED:                     { color:"#065f46", background:"#d1fae5", borderColor:"#6ee7b7" },
  UPDATED:                     { color:"#1d4ed8", background:"#dbeafe", borderColor:"#93c5fd" },
  STATUS_CHANGED:              { color:"#5b21b6", background:"#ede9fe", borderColor:"#c4b5fd" },
  DELETED:                     { color:"#dc2626", background:"#fee2e2", borderColor:"#fca5a5" },
  GENE_ANALYSIS:               { color:"#4c1d95", background:"#ede9fe", borderColor:"#c4b5fd" },
  PP4_RESULT:                  { color:"#92400e", background:"#fef3c7", borderColor:"#fcd34d" },
  CHATBOT:                     { color:"#164e63", background:"#cffafe", borderColor:"#67e8f9" },
  CHAT_CONVERSATION_CREATED:   { color:"#164e63", background:"#cffafe", borderColor:"#67e8f9" },
  CHAT_CONVERSATION_DELETED:   { color:"#374151", background:"#f1f5f9", borderColor:"#cbd5e1" },
  CHAT_CONVERSATION_RENAMED:   { color:"#0c4a6e", background:"#e0f2fe", borderColor:"#7dd3fc" },
CHAT_PP4_CALCULATED:         { color:"#92400e", background:"#fef3c7", borderColor:"#fcd34d" },
};
const ACT_LABEL = {
  CREATED:"Created", UPDATED:"Updated", STATUS_CHANGED:"Status",
  DELETED:"Deleted", GENE_ANALYSIS:"Gene", PP4_RESULT:"PP4",
  CHATBOT:"Chatbot",
  CHAT_CONVERSATION_CREATED:"Chat Created",
  CHAT_CONVERSATION_DELETED:"Chat Deleted",
  CHAT_CONVERSATION_RENAMED:   "Chat Renamed",
CHAT_PP4_CALCULATED:         "PP4 Calculated",
};

const getIcon = (action, size = 15) => ({
  CREATED:                   <FilePlus size={size}/>,
  UPDATED:                   <Edit size={size}/>,
  STATUS_CHANGED:            <CheckCircle size={size}/>,
  DELETED:                   <Trash2 size={size}/>,
  GENE_ANALYSIS:             <Dna size={size}/>,
  PP4_RESULT:                <Activity size={size}/>,
  CHATBOT:                   <MessageCircle size={size}/>,
  CHAT_CONVERSATION_CREATED: <MessageCircle size={size}/>,
  CHAT_CONVERSATION_DELETED: <MessageCircle size={size}/>,
  CHAT_CONVERSATION_RENAMED:   <MessageCircle size={size}/>,
CHAT_PP4_CALCULATED:        <MessageCircle size={size}/>,
}[action] || <FileText size={size}/>);

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.ht { font-family: 'Figtree', sans-serif; min-height: 100vh; background: #f7f6fc; }

@keyframes fadeUp  { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer { 0%{background-position:-300% 0} 100%{background-position:300% 0} }
@keyframes slideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
.ht-anim { animation: fadeUp .3s ease both; }

/* ── TOPBAR ── */
.ht-topbar-wrap{
  background:#fff;
  border-bottom:1px solid #ede9f8;
  height:64px;
  display:flex;
  align-items:center;
  justify-content:flex-end;
  padding:0 28px;
  position:sticky;
  top:0;
  z-index:50;
  box-shadow:0 1px 8px rgba(109,90,205,.05);
}

/* ── MOBILE BANNER ── */
.ht-mob-bar{display:none;margin:14px 14px 0;border-radius:18px;background:linear-gradient(130deg,#4f46e5 0%,#6366f1 55%,#818cf8 100%);padding:13px 15px;position:relative;overflow:hidden;flex-shrink:0;}
.ht-mob-bar::before{content:'';position:absolute;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.08);top:-50px;right:20px;pointer-events:none;}
.ht-mob-bar::after{content:'';position:absolute;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.05);bottom:-15px;right:-10px;pointer-events:none;}
.ht-mob-bar-inner{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;}
.ht-mob-logo{display:flex;align-items:center;gap:10px;}
.ht-mob-logo-box{width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.ht-mob-logo-name{font-size:15px;font-weight:800;color:#fff;line-height:1.15;}
.ht-mob-logo-sub{font-size:11px;font-weight:500;color:rgba(255,255,255,.72);}
.ht-mob-avatar{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;transition:background .18s;}
.ht-mob-avatar:hover{background:rgba(255,255,255,.28);}

/* ── CARDS / SECTIONS ── */
.ht-desk-card{background:#fff;border-radius:18px;border:1px solid #e8eaf0;box-shadow:0 2px 12px rgba(0,0,0,.05);position:relative;overflow:hidden;}
.ht-desk-bar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6366f1,#818cf8,#c7d2fe,#818cf8,#6366f1);background-size:300% 100%;animation:shimmer 4s linear infinite;}
.ht-section{background:#fff;border-radius:18px;border:1px solid #e8eaf0;box-shadow:0 2px 12px rgba(0,0,0,.04);overflow:hidden;}
.ht-section-bar{height:3px;background:linear-gradient(90deg,#6366f1,#818cf8,#c7d2fe);}
.ht-sec-icon{width:34px;height:34px;border-radius:10px;background:#f1f5f9;color:#475569;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #e2e8f0;}
.ht-divider{height:1px;background:#f7f5fe;margin:0 16px;}

/* ── TOOLBAR ── */
.ht-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 14px 14px;}
.ht-filters{display:flex;gap:9px;flex-wrap:wrap;align-items:center;flex:1;min-width:0;}
.ht-search{display:flex;align-items:center;gap:8px;background:#f7f6fc;border:1.5px solid #e8e4f5;border-radius:11px;padding:0 12px;height:38px;min-width:200px;flex:1;transition:all .15s;}
.ht-search:focus-within{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);background:#fff;}
.ht-search-ico{color:#b0aac6;flex-shrink:0;}
.ht-search input{border:none;outline:none;background:transparent;font-size:13px;font-weight:500;color:#111827;font-family:'Figtree',sans-serif;width:100%;}
.ht-search input::placeholder{color:#b0aac6;}
.ht-select{height:38px;padding:0 28px 0 10px;border:1.5px solid #e8e4f5;border-radius:11px;font-size:12.5px;font-weight:600;color:#374151;font-family:'Figtree',sans-serif;background:#f7f6fc url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 8px center;appearance:none;cursor:pointer;transition:border-color .15s;flex-shrink:0;}
.ht-select:focus{outline:none;border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1);background:#fff;}

/* ── DELETE ALL ── */
.ht-del-all-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:1.5px solid #fca5a5;background:#fff5f5;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer;font-family:'Figtree',sans-serif;transition:all .18s;flex-shrink:0;}
.ht-del-all-btn:hover{background:#dc2626;color:#fff;border-color:#dc2626;transform:translateY(-1px);box-shadow:0 4px 14px rgba(220,38,38,.25);}

/* ── DESKTOP HISTORY CARD ── */
.ht-dcard{background:#fff;border:1.5px solid #eaecf0;border-radius:16px;padding:15px 18px;margin-bottom:10px;transition:all .2s ease;position:relative;overflow:hidden;cursor:pointer;animation:slideIn .3s ease backwards;}
.ht-dcard:last-child{margin-bottom:0;}
.ht-dcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;opacity:0;transition:opacity .2s;border-radius:3px 0 0 3px;}
.ht-dcard:hover{box-shadow:0 4px 18px rgba(0,0,0,.08);border-color:#c7d2fe;transform:translateX(3px);}
.ht-dcard:hover::before{opacity:1;}
.ht-dcard-inner{display:flex;align-items:center;gap:16px;}
.ht-dcard-ico{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.ht-dcard-info{flex:1;min-width:0;}
.ht-dcard-msg{display:inline-flex;align-items:center;padding:3px 12px;border-radius:999px;font-size:12.5px;font-weight:700;border:1px solid;margin-bottom:5px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ht-dcard-meta{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.ht-dcard-cid{font-size:12px;color:#9ca3af;font-weight:600;display:flex;align-items:center;gap:5px;}
.ht-act-tag{display:inline-flex;align-items:center;gap:3px;padding:2px 9px;border-radius:999px;font-size:10px;font-weight:800;border:1px solid;}
.ht-dcard-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}
.ht-dcard-time{font-size:11.5px;color:#b0aac6;font-weight:500;white-space:nowrap;display:flex;align-items:center;gap:4px;}
.ht-del-btn{width:32px;height:32px;border-radius:9px;border:1.5px solid #fca5a5;background:#fff5f5;color:#dc2626;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0;}
.ht-del-btn:hover{background:#dc2626;color:#fff;border-color:#dc2626;transform:scale(1.08);}

/* ── MOBILE HISTORY CARD ── */
.ht-mcard{background:#fafafa;border:1.5px solid #eaecf0;border-radius:14px;padding:13px 14px;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative;overflow:hidden;transition:all .18s;cursor:pointer;}
.ht-mcard:last-child{margin-bottom:0;}
.ht-mcard::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;opacity:0;transition:opacity .18s;border-radius:3px 0 0 3px;}
.ht-mcard:hover{background:#fff;border-color:#c7d2fe;box-shadow:0 3px 10px rgba(0,0,0,.06);}
.ht-mcard:hover::before{opacity:1;}
.ht-mcard-left{display:flex;align-items:center;gap:11px;flex:1;min-width:0;}
.ht-mcard-ico{width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.ht-mcard-info{flex:1;min-width:0;}
.ht-mcard-msg{font-size:13px;font-weight:800;color:#1e1b3a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;}
.ht-mcard-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
.ht-mcard-cid{font-size:11px;font-weight:700;color:#4f46e5;}
.ht-mcard-time{font-size:10.5px;color:#b0aac6;font-weight:500;}
.ht-mcard-right{display:flex;align-items:center;gap:7px;flex-shrink:0;}

/* ── EMPTY / PAGINATION ── */
.ht-empty{text-align:center;padding:40px 20px;}
.ht-empty-ico{width:48px;height:48px;border-radius:14px;background:#f6f4fe;border:1.5px solid #ebe7f8;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;}
.ht-pagination{display:flex;align-items:center;justify-content:center;gap:10px;padding:10px 14px 14px;}
.ht-page-btn{display:inline-flex;align-items:center;gap:5px;padding:7px 16px;border-radius:10px;border:1.5px solid #e8e4f5;background:#fff;color:#374151;font-size:13px;font-weight:700;cursor:pointer;font-family:'Figtree',sans-serif;transition:all .15s;}
.ht-page-btn:hover:not(:disabled){background:#4f46e5;color:#fff;border-color:#4f46e5;}
.ht-page-btn:disabled{opacity:.4;cursor:not-allowed;}
.ht-page-info{font-size:13px;font-weight:600;color:#6b7280;padding:0 4px;}

/* ── RESPONSIVE ── */
@media (min-width:769px){
  .ht-desk-cards{display:block!important;}
  .ht-mob-cards{display:none!important;}
}
@media (max-width:768px){
  .ht-sidebar{display:none!important;}
  .ht-main{margin-left:0!important;}
  .ht-topbar-wrap{display:none!important;}
  .ht-desk-card{display:none!important;}
  .ht-mob-bar{display:block!important;}
  .ht-page-pad{padding:12px 14px 90px!important;gap:12px!important;}
  .ht-toolbar{flex-direction:column;align-items:stretch;padding:10px 14px 12px;}
  .ht-filters{flex-direction:column;gap:8px;}
  .ht-search{min-width:unset!important;width:100%;}
  .ht-select{width:100%;}
  .ht-desk-cards{display:none!important;}
  .ht-mob-cards{display:block!important;}
}
`;

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function ConsultationHistory() {
  const [collapsed,      setCollapsed]      = useState(window.innerWidth <= 768);
  const [search,         setSearch]         = useState("");
  const navigate = useNavigate();

  const {
    history, page, setPage, limit, setLimit,
    totalPages, actionFilter, setActionFilter,
    timeFilter, setTimeFilter, clearHistory, deleteSingleHistory,
  } = useHistoryContext();

  /* combined filter: text search + existing filters */
  const filtered = history.filter(item => {
    const msg = item.message?.toLowerCase() || "";
    const cid = item.caseId?.toString()     || "";
    return msg.includes(search.toLowerCase()) || cid.includes(search);
  });

  return (
    <>
      <style>{CSS}</style>
      <div className="ht">

        {/* Sidebar */}
        <div className="ht-sidebar">
          <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
        </div>

        {/* Main */}
        <div className="ht-main ht-anim"
          style={{ marginLeft: collapsed ? "72px" : "240px", transition: "margin-left .3s cubic-bezier(.4,0,.2,1)" }}>

          {/* ── Desktop Topbar ── */}
          <div className="ht-topbar-wrap">
            <div
              onClick={() => navigate("/profile")}
              style={{
                width:"40px", height:"40px", borderRadius:"12px",
                background:"linear-gradient(135deg,#ede9fe,#ddd6fe)",
                border:"1.5px solid #c8c1ed",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"#6d5acd", cursor:"pointer",
                transition:"all .18s",
                boxShadow:"0 2px 8px rgba(109,90,205,.12)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background="linear-gradient(135deg,#6d5acd,#8b7ee8)"; e.currentTarget.style.color="#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background="linear-gradient(135deg,#ede9fe,#ddd6fe)"; e.currentTarget.style.color="#6d5acd"; }}
            >
              <User size={18}/>
            </div>
          </div>

          {/* Mobile banner */}
          <div className="ht-mob-bar">
            <div className="ht-mob-bar-inner">
              <div className="ht-mob-logo">
                <div className="ht-mob-logo-box"><History size={18}/></div>
                <div>
                  <div className="ht-mob-logo-name">History</div>
                  <div className="ht-mob-logo-sub">Audit trail</div>
                </div>
              </div>
              <div className="ht-mob-avatar" onClick={() => navigate("/profile")}>
                <User size={16}/>
              </div>
            </div>
          </div>

          {/* Page content */}
          <div className="ht-page-pad"
            style={{ padding:"22px 24px 28px", maxWidth:"1200px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"16px" }}>

            {/* Desktop header card */}
            <div className="ht-desk-card">
              <div className="ht-desk-bar"/>
              <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"14px", padding:"20px 22px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"13px" }}>
                  <div style={{ width:"46px", height:"46px", borderRadius:"14px", background:"linear-gradient(135deg,#4f46e5,#6366f1)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 14px rgba(79,70,229,.25)", flexShrink:0 }}>
                    <History size={22}/>
                  </div>
                  <div>
                    <h1 style={{ fontSize:"clamp(16px,2vw,21px)", fontWeight:900, color:"#1e1b3a", lineHeight:1.2, letterSpacing:"-.3px", margin:0 }}>
                      Consultation History
                    </h1>
                    <p style={{ fontSize:"11px", color:"#9ca3af", marginTop:"3px", fontWeight:500 }}>
                      Complete audit trail of all case activities
                    </p>
                  </div>
                </div>
                <button className="ht-del-all-btn"
                  onClick={() => { if (window.confirm("Delete entire history?")) clearHistory(); }}>
                  <Trash2 size={13}/> Delete All
                </button>
              </div>
            </div>

            {/* Activity log section */}
            <div className="ht-section">
              <div className="ht-section-bar"/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 18px 12px", flexWrap:"wrap", gap:"10px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                  <div className="ht-sec-icon"><History size={15}/></div>
                  <div>
                    <div style={{ fontWeight:800, color:"#1e1b3a", fontSize:"14px", lineHeight:1.2 }}>Activity Log</div>
                    <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>
                      {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
                    </div>
                  </div>
                </div>
              </div>

              <div className="ht-divider"/>

              {/* Filters toolbar */}
              <div className="ht-toolbar">
                <div className="ht-filters">

                  {/* Search */}
                  <div className="ht-search">
                    <Search size={14} className="ht-search-ico"/>
                    <input placeholder="Search by message or Case ID…"
                      value={search} onChange={e => setSearch(e.target.value)}/>
                  </div>

                  <select className="ht-select" value={actionFilter}
                    onChange={e => { setPage(1); setActionFilter(e.target.value); }}>
                    <option value="ALL">All Actions</option>
                    <option value="CREATED">Created</option>
                    <option value="UPDATED">Updated</option>
                    <option value="STATUS_CHANGED">Status Changed</option>
                    <option value="DELETED">Deleted</option>
                    <option value="GENE_ANALYSIS">Gene Analysis</option>
                    <option value="PP4_RESULT">PP4 Result</option>
                    <option value="CHAT_CONVERSATION_CREATED">Chat Conversation Created</option>
                    <option value="CHAT_CONVERSATION_DELETED">Chat Conversation Deleted</option>
                    
<option value="CHAT_CONVERSATION_RENAMED">Chat Conversation Renamed</option>
<option value="CHAT_PP4_CALCULATED">Chat PP4 Calculated</option>
                  </select>

                  {/* Time filter */}
                  <select className="ht-select" value={timeFilter}
                    onChange={e => { setPage(1); setTimeFilter(e.target.value); }}>
                    <option value="">All Time</option>
                    <option value="TODAY">Today</option>
                    <option value="WEEK">Last 7 Days</option>
                    <option value="MONTH">Last 30 Days</option>
                  </select>

                  {/* Per-page */}
                  <select className="ht-select" value={limit}
                    onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>

                </div>
              </div>

              <div className="ht-divider"/>

              {/* Records */}
              <div style={{ padding:"12px 14px 6px" }}>
                {filtered.length === 0 ? (
                  <div className="ht-empty">
                    <div className="ht-empty-ico">
                      <History size={20} color="#c8c1ed"/>
                    </div>
                    <p style={{ fontWeight:700, color:"#6b7280", fontSize:"14px", margin:"0 0 3px" }}>No history records found</p>
                    <p style={{ fontSize:"12px", color:"#9ca3af", margin:0 }}>Activities appear here as cases are created and updated</p>
                  </div>
                ) : (<>

                  {/* Desktop cards */}
                  <div className="ht-desk-cards">
                    {filtered.map((item, idx) => {
                      const ms   = MSG_STYLE[item.action]   || { color:"#374151", background:"#f3f4f6", borderColor:"#e5e7eb" };
                      const lb   = LEFT_BORDER[item.action] || "#a89ee8";
                      const grad = ICO_GRAD[item.action]    || "linear-gradient(135deg,#6d5acd,#a89ee8)";
                      return (
                        <div key={item.id} className="ht-dcard"
                          style={{ animationDelay:`${Math.min(idx,12)*0.04}s` }}
                          onClick={() => item.action !== "DELETED" && navigate(
                            item.action === "CHATBOT" ? "/copilot" : "/cases",
                            { state:{ highlightId:item.mongoCaseId, action:item.action } }
                          )}>
                          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"3px", background:lb, borderRadius:"3px 0 0 3px" }}/>
                          <div className="ht-dcard-inner" style={{ paddingLeft:"8px" }}>
                            <div className="ht-dcard-ico" style={{ background:grad }}>{getIcon(item.action, 16)}</div>
                            <div className="ht-dcard-info">
                              <div className="ht-dcard-msg" style={ms}>{item.message}</div>
                              <div className="ht-dcard-meta">
                                <span className="ht-dcard-cid">
                                  <FileText size={11} color="#b0aac6"/>
                                  {item.action === "CHATBOT"
                                    ? <><strong style={{ color:"#0891b2" }}>Session:</strong> {item.caseId}</>
                                    : <>Case ID: <strong style={{ color:"#4f46e5" }}>{item.caseId}</strong></>
                                  }
                                </span>
                                <span className="ht-act-tag" style={ms}>{ACT_LABEL[item.action]||item.action}</span>
                              </div>
                            </div>
                            <div className="ht-dcard-right">
                              <span className="ht-dcard-time"><Clock size={11} color="#b0aac6"/>{item.timestamp}</span>
                              <button className="ht-del-btn"
                                onClick={e => { e.stopPropagation(); if (window.confirm("Delete this record?")) deleteSingleHistory(item.id); }}>
                                <Trash2 size={13}/>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile cards */}
                  <div className="ht-mob-cards">
                    {filtered.map(item => {
                      const ms   = MSG_STYLE[item.action]   || { color:"#374151", background:"#f3f4f6", borderColor:"#e5e7eb" };
                      const lb   = LEFT_BORDER[item.action] || "#a89ee8";
                      const grad = ICO_GRAD[item.action]    || "linear-gradient(135deg,#6d5acd,#a89ee8)";
                      return (
                        <div key={item.id} className="ht-mcard"
                          onClick={() => item.action !== "DELETED" && navigate(
                            item.action === "CHATBOT" ? "/copilot" : "/cases",
                            { state:{ highlightId:item.mongoCaseId, action:item.action } }
                          )}>
                          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"3px", background:lb, borderRadius:"3px 0 0 3px", opacity:1 }}/>
                          <div className="ht-mcard-left" style={{ paddingLeft:"6px" }}>
                            <div className="ht-mcard-ico" style={{ background:grad }}>{getIcon(item.action, 14)}</div>
                            <div className="ht-mcard-info">
                              <div className="ht-mcard-msg">{item.message}</div>
                              <div className="ht-mcard-meta">
                                <span className="ht-mcard-cid">{item.caseId}</span>
                                <span style={{ color:"#d1d5db", fontSize:"10px" }}>·</span>
                                <span className="ht-mcard-time">{item.timestamp}</span>
                                <span className="ht-act-tag" style={{ ...ms, fontSize:"9px" }}>{ACT_LABEL[item.action]||item.action}</span>
                              </div>
                            </div>
                          </div>
                          <div className="ht-mcard-right">
                            <button className="ht-del-btn" style={{ width:"28px", height:"28px" }}
                              onClick={e => { e.stopPropagation(); if (window.confirm("Delete?")) deleteSingleHistory(item.id); }}>
                              <Trash2 size={12}/>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </>)}
              </div>

              {/* Pagination */}
              {totalPages > 0 && (
                <div className="ht-pagination">
                  <button className="ht-page-btn" disabled={page===1} onClick={() => setPage(page-1)}>← Prev</button>
                  <span className="ht-page-info">Page {page} of {totalPages}</span>
                  <button className="ht-page-btn" disabled={page===totalPages} onClick={() => setPage(page+1)}>Next →</button>
                </div>
              )}
            </div>

          </div>
        </div>

        <MobileBottomBar />

      </div>
    </>
  );
}