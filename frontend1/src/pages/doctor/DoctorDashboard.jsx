import { useState, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import API from "../../services/api";
import CaseDetailsModal from "../../components/doctor/CaseDetailsModal";
import MobileBottomBar from "../../components/doctor/MobileBottomBar";
import { useNavigate } from "react-router-dom";

import {
  Eye, Activity, Calendar, PlusCircle,
  ChevronRight, User, FolderOpen,
  BarChart3, Clock, CheckCircle, Upload, Sparkles, RefreshCw,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.dr { font-family: 'Figtree', sans-serif; min-height: 100vh; background: #f7f6fc; }

@keyframes fadeUp        { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer       { 0%{background-position:-300% 0} 100%{background-position:300% 0} }
@keyframes skeletonPulse { 0%,100%{opacity:.4} 50%{opacity:.9} }
@keyframes slideIn       { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
.dr-anim { animation: fadeUp .3s ease both; }

/* ── MOBILE BANNER ── */
.dr-mob-bar {
  display:none; margin:14px 14px 0; border-radius:18px;
  background:linear-gradient(130deg,#6d5acd 0%,#8b7ee8 55%,#c5bcf5 100%);
  padding:13px 15px; position:relative; overflow:hidden; flex-shrink:0;
}
.dr-mob-bar::before{content:'';position:absolute;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.08);top:-50px;right:20px;pointer-events:none;}
.dr-mob-bar::after {content:'';position:absolute;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.05);bottom:-15px;right:-10px;pointer-events:none;}
.dr-mob-bar-inner{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;}
.dr-mob-logo{display:flex;align-items:center;gap:10px;}
.dr-mob-logo-box{width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.dr-mob-logo-name{font-size:15px;font-weight:800;color:#fff;line-height:1.15;}
.dr-mob-logo-sub {font-size:11px;font-weight:500;color:rgba(255,255,255,.72);}
.dr-mob-avatar{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;color:#fff;}
.dr-mob-welcome{display:none;padding:16px 16px 4px;}
.dr-mob-wtitle{font-size:20px;font-weight:900;color:#1e1b3a;letter-spacing:-.4px;line-height:1.2;margin-bottom:4px;}
.dr-mob-wtitle span{color:#6d5acd;}
.dr-mob-wsub{font-size:12px;color:#9ca3af;font-weight:500;}

/* ── DESKTOP STAT CARDS ── */
.dr-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;}
.dr-stat{border-radius:20px;padding:18px 16px 15px;position:relative;overflow:hidden;cursor:default;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;}
.dr-stat:hover{transform:translateY(-5px);}
.dr-s0{background:linear-gradient(145deg,#6d5acd,#8b7ee8,#b8aef5);box-shadow:0 4px 18px rgba(109,90,205,.3);}
.dr-s1{background:linear-gradient(145deg,#c2410c,#ea580c,#fb923c);box-shadow:0 4px 18px rgba(194,65,12,.3);}
.dr-s2{background:linear-gradient(145deg,#0e7490,#0891b2,#22d3ee);box-shadow:0 4px 18px rgba(14,116,144,.3);}
.dr-s3{background:linear-gradient(145deg,#065f46,#059669,#34d399);box-shadow:0 4px 18px rgba(6,95,70,.3);}
.dr-s0:hover{box-shadow:0 14px 30px rgba(109,90,205,.38);}
.dr-s1:hover{box-shadow:0 14px 30px rgba(194,65,12,.40);}
.dr-s2:hover{box-shadow:0 14px 30px rgba(14,116,144,.40);}
.dr-s3:hover{box-shadow:0 14px 30px rgba(6,95,70,.40);}
.dr-sorb1{position:absolute;width:90px;height:90px;border-radius:50%;background:rgba(255,255,255,.1);top:-30px;right:-24px;pointer-events:none;}
.dr-sorb2{position:absolute;width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.06);bottom:-14px;right:10px;pointer-events:none;}
.dr-stat-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px;}
.dr-stat-ico{width:30px;height:30px;border-radius:9px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.dr-stat-lbl{font-size:10px;font-weight:700;color:rgba(255,255,255,.85);text-transform:uppercase;letter-spacing:.5px;line-height:1.3;padding-top:2px;}
.dr-stat-val{font-size:32px;font-weight:900;color:#fff;line-height:1;letter-spacing:-1px;}
.dr-stat-sub{font-size:10px;color:rgba(255,255,255,.55);margin-top:3px;font-weight:500;}
.dr-stat-bar{height:3px;background:rgba(255,255,255,.18);border-radius:99px;overflow:hidden;margin-top:13px;}
.dr-stat-fill{height:100%;background:rgba(255,255,255,.6);border-radius:99px;transition:width 1s ease;}

/* ══════════════════════════════════════
   MOBILE STAT ROW — single horizontal line
══════════════════════════════════════ */
.dr-mob-stats {
  display: none;
  flex-direction: row;
  gap: 8px;
}
.dr-mob-pill {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 10px 6px 9px;
  border-radius: 14px;
  position: relative;
  overflow: hidden;
  min-width: 0;
}
.dr-mob-pill-0 { background:linear-gradient(145deg,#6d5acd,#8b7ee8); box-shadow:0 3px 10px rgba(109,90,205,.25); }
.dr-mob-pill-1 { background:linear-gradient(145deg,#c2410c,#ea580c); box-shadow:0 3px 10px rgba(194,65,12,.22); }
.dr-mob-pill-2 { background:linear-gradient(145deg,#0e7490,#0891b2); box-shadow:0 3px 10px rgba(14,116,144,.22); }
.dr-mob-pill-3 { background:linear-gradient(145deg,#065f46,#059669); box-shadow:0 3px 10px rgba(6,95,70,.22); }
.dr-mob-pill-ico {
  width:22px;height:22px;border-radius:7px;
  background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.22);
  display:flex;align-items:center;justify-content:center;color:#fff;
  margin-bottom:2px;flex-shrink:0;
}
.dr-mob-pill-val { font-size:20px;font-weight:900;color:#fff;line-height:1;letter-spacing:-.8px; }
.dr-mob-pill-lbl { font-size:8px;font-weight:700;color:rgba(255,255,255,.72);text-transform:uppercase;letter-spacing:.5px;text-align:center;white-space:nowrap; }

/* ── WELCOME CARD ── */
.dr-desk-card{background:#fff;border-radius:20px;border:1px solid #ebe7f8;box-shadow:0 2px 14px rgba(109,90,205,.06);position:relative;overflow:hidden;}
.dr-desk-bar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6d5acd,#8b7ee8,#b8aef5,#8b7ee8,#6d5acd);background-size:300% 100%;animation:shimmer 4s linear infinite;}
.dr-grad{background:linear-gradient(135deg,#6d5acd,#8b7ee8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.dr-date-badge{display:inline-flex;align-items:center;gap:5px;background:#f6f4fe;border:1px solid #ebe7f8;color:#6d5acd;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:600;}

/* ── SECTION ── */
.dr-section{background:#fff;border-radius:20px;border:1px solid #ebe7f8;box-shadow:0 2px 12px rgba(109,90,205,.04);overflow:hidden;}
.dr-section-bar{height:3px;background:linear-gradient(90deg,#6d5acd,#8b7ee8,#b8aef5);}
.dr-sec-icon{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#f4f2fc,#e8e4f8);color:#6d5acd;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #ddd8f5;}
.dr-divider{height:1px;background:#f7f5fe;margin:0 16px;}

/* ── DESKTOP CASE CARD ── */
.dr-dcase{background:#fff;border:1.5px solid #ebe7f8;border-radius:16px;padding:16px 20px;margin-bottom:10px;transition:all .2s ease;position:relative;overflow:hidden;animation:slideIn .3s ease backwards;}
.dr-dcase:last-child{margin-bottom:0;}
.dr-dcase::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#6d5acd,#b8aef5);opacity:0;transition:opacity .2s;border-radius:3px 0 0 3px;}
.dr-dcase:hover{box-shadow:0 4px 18px rgba(109,90,205,.08);border-color:#d8d2f5;transform:translateX(3px);}
.dr-dcase:hover::before{opacity:1;}
.dr-dcase-inner{display:flex;align-items:center;gap:16px;}
.dr-week-av{width:50px;height:50px;border-radius:14px;flex-shrink:0;background:linear-gradient(135deg,#f2f0fc,#e8e4f8);color:#6d5acd;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;border:1.5px solid #ddd8f5;text-align:center;line-height:1.2;}
.dr-dcase-info{flex:1;min-width:0;}
.dr-dcase-row1{display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap;}
.dr-dcase-pid{font-size:15px;font-weight:800;color:#1e1b3a;letter-spacing:-.2px;}
.dr-dcase-name{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;}
.dr-dcase-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.dr-meta-item{display:flex;align-items:center;gap:5px;font-size:12px;color:#6b7280;font-weight:500;}
.dr-meta-item svg{color:#a09ac4;flex-shrink:0;}

/* ── MOBILE CASE ROW ── */
.dr-mcase{background:#fbfaff;border:1.5px solid #ebe7f8;border-radius:14px;padding:13px 14px;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative;overflow:hidden;transition:all .18s;}
.dr-mcase:last-child{margin-bottom:0;}
.dr-mcase::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#6d5acd,#b8aef5);opacity:0;transition:opacity .18s;}
.dr-mcase:hover{background:#fff;border-color:#d8d2f5;box-shadow:0 3px 10px rgba(109,90,205,.07);}
.dr-mcase:hover::before{opacity:1;}
.dr-mcase-left{flex:1;min-width:0;}
.dr-mcase-top{display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;}
.dr-mcase-pid{font-size:14px;font-weight:800;color:#6d5acd;}
.dr-mcase-name{font-size:12px;font-weight:600;color:#6b7280;}

/* ── STATUS PILLS ── */
.dr-sp {display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:999px;font-size:10px;font-weight:800;}
.dr-spd{width:4px;height:4px;border-radius:50%;flex-shrink:0;}
.dr-sp-up  {background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;} .dr-sp-up  .dr-spd{background:#3b82f6;}
.dr-sp-rev {background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;} .dr-sp-rev .dr-spd{background:#f97316;}
.dr-sp-done{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;} .dr-sp-done .dr-spd{background:#22c55e;}
.dr-sp-def {background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb;} .dr-sp-def .dr-spd{background:#9ca3af;}

/* ── BUTTONS ── */
.dr-vbtn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;background:#fff;color:#5a4bb5;border:1.5px solid #d5cff2;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Figtree',sans-serif;transition:all .18s ease;box-shadow:0 1px 4px rgba(109,90,205,.08);}
.dr-vbtn:hover{background:#6d5acd;color:#fff;border-color:#6d5acd;box-shadow:0 4px 14px rgba(109,90,205,.25);transform:translateY(-1px);}
.dr-vbtn:active{transform:scale(.97);}
.dr-recheck-btn{background:#10b981 !important;color:#fff !important;border-color:#10b981 !important;}
.dr-recheck-btn:hover{background:#059669 !important;border-color:#059669 !important;box-shadow:0 4px 14px rgba(16,185,129,.25) !important;}
.dr-btn-p{display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg,#6d5acd,#8b7ee8);color:#fff;border:none;padding:10px 18px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 13px rgba(109,90,205,.22);white-space:nowrap;font-family:'Figtree',sans-serif;transition:all .25s;}
.dr-btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(109,90,205,.3);}
.dr-btn-g{display:inline-flex;align-items:center;gap:5px;background:#f6f4fe;color:#6d5acd;border:1px solid #d8d2f5;padding:7px 12px;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;font-family:'Figtree',sans-serif;transition:all .2s;}
.dr-btn-g:hover{background:#ede9f8;}

/* ── MISC ── */
.dr-empty{text-align:center;padding:40px 20px;}
.dr-name-skeleton{display:inline-block;width:120px;height:22px;border-radius:6px;background:linear-gradient(90deg,#e8e4f8,#d5cff2,#e8e4f8);background-size:200% 100%;animation:skeletonPulse 1.4s ease infinite;vertical-align:middle;}

/* ── RESPONSIVE ── */
@media (min-width:769px){
  .dr-desk-cases{display:block!important;}
  .dr-mob-cases{display:none!important;}
  .dr-mob-stats{display:none!important;}
}
@media (max-width:768px){
  .dr-sidebar{display:none!important;}
  .dr-main{margin-left:0!important;}
  .dr-topbar-wrap{display:none!important;}
  .dr-desk-card{display:none!important;}
  .dr-mob-bar{display:block!important;}
  .dr-mob-welcome{display:block!important;}
  .dr-desk-cases{display:none!important;}
  .dr-mob-cases{display:block!important;}
  .dr-stats{display:none!important;}
  .dr-mob-stats{display:flex!important;}
  .dr-page-pad{padding:10px 12px 90px!important;gap:10px!important;}
}
`;

/* ── Helpers ── */
const spClass = s => ({"Uploaded":"dr-sp dr-sp-up","Under Review":"dr-sp dr-sp-rev","Completed":"dr-sp dr-sp-done"}[s]||"dr-sp dr-sp-def");
const STAT_ICONS = [BarChart3, Clock, CheckCircle, Upload];
const STAT_CLS   = ["dr-s0","dr-s1","dr-s2","dr-s3"];

const MOB_PILL_CFG = [
  { cls:"dr-mob-pill-0", icon:BarChart3,   lbl:"Total"    },
  { cls:"dr-mob-pill-1", icon:Clock,        lbl:"Review"   },
  { cls:"dr-mob-pill-2", icon:CheckCircle,  lbl:"Done"     },
  { cls:"dr-mob-pill-3", icon:Upload,       lbl:"Uploaded" },
];

/* ── Desktop Stat card ── */
function StatCard({ stat, index }) {
  const Icon = STAT_ICONS[index];
  return (
    <div className={`dr-stat ${STAT_CLS[index]}`}>
      <span className="dr-sorb1"/><span className="dr-sorb2"/>
      <div className="dr-stat-top">
        <p className="dr-stat-lbl">{stat.title}</p>
        <div className="dr-stat-ico"><Icon size={13}/></div>
      </div>
      <h2 className="dr-stat-val">{stat.value}</h2>
      <p className="dr-stat-sub">{stat.sub}</p>
      <div className="dr-stat-bar">
        <div className="dr-stat-fill" style={{ width:`${stat._pct}%` }}/>
      </div>
    </div>
  );
}

/* ── Mobile horizontal pill row ── */
function MobileStats({ stats }) {
  return (
    <div className="dr-mob-stats">
      {MOB_PILL_CFG.map((cfg, i) => {
        const Icon = cfg.icon;
        return (
          <div key={cfg.lbl} className={`dr-mob-pill ${cfg.cls}`}>
            <div className="dr-mob-pill-ico"><Icon size={11}/></div>
            <div className="dr-mob-pill-val">{stats[i]?.value ?? 0}</div>
            <div className="dr-mob-pill-lbl">{cfg.lbl}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════ */
export default function DoctorDashboard() {
  const [collapsed,    setCollapsed]    = useState(window.innerWidth <= 768);
  const [cases,        setCases]        = useState([]);
  const [stats,        setStats]        = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [doctorName,   setDoctorName]   = useState("");
  const [nameLoaded,   setNameLoaded]   = useState(false);

  const navigate = useNavigate();
  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorId = user?.id;
  const today    = new Date().toLocaleDateString("en-IN", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

  const fetchDoctorName = async () => {
    if (!doctorId) return;
    try {
      const { data } = await API.get(`/doctor-profile/${doctorId}`);
      setDoctorName(data?.fullName || user?.name || "Doctor");
    } catch {
      setDoctorName(user?.name || "Doctor");
    } finally {
      setNameLoaded(true);
    }
  };

  const fetchData = async () => {
    try {
      const res  = await API.get("/cases");
      const all  = res.data?.cases || res.data || [];
      setCases(all);
      const total = all.length, base = total || 1;
      const rev   = all.filter(c => c.status === "Under Review").length;
      const done  = all.filter(c => c.status === "Completed").length;
      const up    = all.filter(c => c.status === "Uploaded").length;
      setStats([
        { title:"Total Cases",  value:total, sub:"All patients",      _pct:100 },
        { title:"Under Review", value:rev,   sub:"Awaiting analysis", _pct:Math.round(rev/base*100) },
        { title:"Completed",    value:done,  sub:"Fully analysed",    _pct:Math.round(done/base*100) },
        { title:"Uploaded",     value:up,    sub:"Files received",    _pct:Math.round(up/base*100) },
      ]);
    } catch(e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
    fetchDoctorName();
    const onResize = () => setCollapsed(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    const onProfileUpdated = (e) => {
      if (e.detail?.fullName) setDoctorName(e.detail.fullName);
      else fetchDoctorName();
    };
    window.addEventListener("doctor-profile-updated", onProfileUpdated);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("doctor-profile-updated", onProfileUpdated);
    };
  }, []);

  const handleView = async (id) => {
    try {
      const res = await API.get(`/cases/${id}`);
      const d   = res.data;
      setSelectedCase(d?.case ?? d?.data ?? d);
    } catch(e) { console.error(e); alert("Failed to load case"); }
  };

  const handleRecheck = (caseId) => {
    navigate(`/gene-analysis?caseId=${caseId}&recheck=true`);
  };

  const NameDisplay = () => nameLoaded
    ? <span className="dr-grad">Dr. {doctorName}</span>
    : <span className="dr-name-skeleton"/>;

  return (
    <>
      <style>{CSS}</style>
      <div className="dr">

        {/* ── Sidebar ── */}
        <div className="dr-sidebar">
          <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)}/>
        </div>

        {/* ── Main content ── */}
        <div className="dr-main dr-anim"
          style={{ marginLeft: collapsed ? "72px" : "240px", transition:"margin-left .3s cubic-bezier(.4,0,.2,1)" }}>

          <div className="dr-topbar-wrap"><Topbar/></div>

          {/* Mobile banner */}
          <div className="dr-mob-bar">
            <div className="dr-mob-bar-inner">
              <div className="dr-mob-logo">
                <div className="dr-mob-logo-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                    <path d="M12 7v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="dr-mob-logo-name">Prenatal AI</div>
                  <div className="dr-mob-logo-sub">Copilot</div>
                </div>
              </div>
              <div className="dr-mob-avatar" onClick={() => navigate("/profile")} style={{ cursor:"pointer" }}><User size={16}/></div>
            </div>
          </div>

          {/* Mobile welcome text */}
          <div className="dr-mob-welcome">
            <div className="dr-mob-wtitle">
              Welcome back,{" "}
              {nameLoaded
                ? <span>Dr. {doctorName}</span>
                : <span className="dr-name-skeleton" style={{ width:"90px", height:"18px" }}/>
              } 👋
            </div>
            <div className="dr-mob-wsub">Here's an overview of your clinical dashboard</div>
          </div>

          {/* ── Page content ── */}
          <div className="dr-page-pad"
            style={{ padding:"22px 24px 28px", maxWidth:"1200px", margin:"0 auto", display:"flex", flexDirection:"column", gap:"16px" }}>

            {/* ── DESKTOP WELCOME CARD ── */}
            <div className="dr-desk-card">
              <div className="dr-desk-bar"/>
              <div style={{
                padding:"22px 24px 20px",
                display:"flex", alignItems:"center",
                justifyContent:"space-between",
                flexWrap:"wrap", gap:"16px",
              }}>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                    <Sparkles size={10} color="#b8aef5"/>
                    <span style={{ fontSize:"10px", fontWeight:800, letterSpacing:"1.5px", color:"#9b8fd4", textTransform:"uppercase" }}>
                      Prenatal AI · Dashboard
                    </span>
                  </div>
                  <h1 style={{ fontSize:"clamp(16px,2vw,22px)", fontWeight:900, color:"#1e1b3a", lineHeight:1.2, letterSpacing:"-.3px", margin:0 }}>
                    Welcome back, <NameDisplay /> 👋
                  </h1>
                  <div className="dr-date-badge" style={{ width:"fit-content" }}>
                    <Calendar size={10}/>{today}
                  </div>
                </div>
                <button className="dr-btn-p" onClick={() => navigate("/cases")}>
                  <PlusCircle size={14}/> New Case
                </button>
              </div>
            </div>

            {/* ── DESKTOP STAT CARDS ── */}
            <div className="dr-stats">
              {stats.map((s, i) => <StatCard key={i} stat={s} index={i}/>)}
            </div>

            {/* ── MOBILE STAT PILLS — single horizontal row ── */}
            <MobileStats stats={stats} />

            {/* ── RECENT CASES ── */}
            <div className="dr-section">
              <div className="dr-section-bar"/>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"15px 18px 12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                  <div className="dr-sec-icon"><Activity size={15}/></div>
                  <div>
                    <div style={{ fontWeight:800, color:"#1e1b3a", fontSize:"14px", lineHeight:1.2 }}>Recently Uploaded</div>
                    <div style={{ fontSize:"11px", color:"#9ca3af", marginTop:"1px" }}>Latest case submissions</div>
                  </div>
                </div>
                <button className="dr-btn-g" onClick={() => navigate("/cases")}>
                  View All <ChevronRight size={12}/>
                </button>
              </div>
              <div className="dr-divider"/>

              <div style={{ padding:"12px 14px 14px" }}>
                {cases.length === 0 ? (
                  <div className="dr-empty">
                    <div style={{ width:"48px", height:"48px", borderRadius:"14px", background:"#f6f4fe", border:"1.5px solid #ebe7f8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px" }}>
                      <FolderOpen size={20} color="#c8c1ed"/>
                    </div>
                    <p style={{ fontWeight:700, color:"#6b7280", fontSize:"14px", margin:"0 0 3px" }}>No cases yet</p>
                    <p style={{ fontSize:"12px", color:"#9ca3af", margin:0 }}>Create your first case to get started</p>
                  </div>
                ) : (<>

                  {/* Desktop */}
                  <div className="dr-desk-cases">
                    {cases.slice(0, 5).map((c, idx) => (
                      <div key={c._id} className="dr-dcase" style={{ animationDelay:`${idx * 0.05}s` }}>
                        <div className="dr-dcase-inner">
                          <div className="dr-week-av">
                            {c.gestationalAge ? `${c.gestationalAge}w` : (c.patientName?.charAt(0)?.toUpperCase() || "P")}
                          </div>
                          <div className="dr-dcase-info">
                            <div className="dr-dcase-row1">
                              <span className="dr-dcase-pid">{c.patientId}</span>
                              <span className={spClass(c.status)}><span className="dr-spd"/>{c.status || "Draft"}</span>
                            </div>
                            <div className="dr-dcase-name">{c.patientName}</div>
                            <div className="dr-dcase-meta">
                              {c.gestationalAge && (
                                <span className="dr-meta-item">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                  {c.gestationalAge} weeks
                                </span>
                              )}
                              {c.modeOfConception && (
                                <span className="dr-meta-item">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                  {c.modeOfConception}
                                </span>
                              )}
                              {c.consanguinity !== undefined && (
                                <span className="dr-meta-item">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                  Consanguinity: {c.consanguinity ? "Yes" : "No"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ flexShrink:0, display:"flex", gap:"8px" }} onClick={e => e.stopPropagation()}>
                            <button className="dr-vbtn" onClick={() => handleView(c._id)}>
                              <Eye size={13}/> View Details
                            </button>
                            {c.status === "Completed" && (
                              <button className="dr-vbtn dr-recheck-btn" onClick={() => handleRecheck(c._id)}>
                                <RefreshCw size={13}/> Recheck
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile */}
                  <div className="dr-mob-cases">
                    {cases.slice(0, 5).map(c => (
                      <div key={c._id} className="dr-mcase">
                        <div className="dr-mcase-left">
                          <div className="dr-mcase-top">
                            <span className="dr-mcase-pid">{c.patientId}</span>
                            <span className={spClass(c.status)}><span className="dr-spd"/>{c.status || "Draft"}</span>
                          </div>
                          <div className="dr-mcase-name">{c.patientName}</div>
                        </div>
                        <div style={{ flexShrink:0, display:"flex", flexDirection:"column", gap:"6px" }} onClick={e => e.stopPropagation()}>
                          <button className="dr-vbtn" onClick={() => handleView(c._id)}>
                            <Eye size={12}/> View
                          </button>
                          {c.status === "Completed" && (
                            <button className="dr-vbtn dr-recheck-btn" onClick={() => handleRecheck(c._id)}>
                              <RefreshCw size={12}/> Recheck
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                </>)}
              </div>
            </div>

          </div>
        </div>

        {/* ── Mobile nav ── */}
        <MobileBottomBar />

      </div>

      {selectedCase && (
        <CaseDetailsModal
          caseData={selectedCase}
          onClose={() => setSelectedCase(null)}
          onUpdated={() => { setSelectedCase(null); fetchData(); }}
        />
      )}
    </>
  );
}
