import { useState, useEffect } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import API from "../../services/api";
import CaseDetailsModal from "../../components/doctor/CaseDetailsModal";
import MobileBottomBar from "../../components/doctor/MobileBottomBar";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Eye,
  ChevronLeft, ChevronRight, FileText, X,
  Activity, User, Filter, Trash2, AlertCircle, CheckCircle2, RefreshCw,
} from "lucide-react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.cp { font-family: 'Figtree', sans-serif; min-height: 100vh; background: #f7f6fc; }

@keyframes fadeUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes scaleIn  { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
@keyframes shimmer  { 0%{background-position:-300% 0} 100%{background-position:300% 0} }
@keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
.cp-anim  { animation: fadeUp .3s ease both; }
.cp-shake { animation: shake .35s ease !important; }

/* ── MOBILE BANNER ── */
.cp-mob-bar{display:none;margin:14px 14px 0;border-radius:18px;background:linear-gradient(130deg,#6d5acd 0%,#8b7ee8 55%,#c5bcf5 100%);padding:13px 15px;position:relative;overflow:hidden;}
.cp-mob-bar::before{content:'';position:absolute;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.08);top:-50px;right:20px;pointer-events:none;}
.cp-mob-bar::after{content:'';position:absolute;width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,.05);bottom:-15px;right:-10px;pointer-events:none;}
.cp-mob-bar-inner{display:flex;align-items:center;justify-content:space-between;position:relative;z-index:1;}
.cp-mob-logo{display:flex;align-items:center;gap:10px;}
.cp-mob-logo-box{width:38px;height:38px;border-radius:11px;background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
.cp-mob-logo-name{font-size:15px;font-weight:800;color:#fff;line-height:1.15;}
.cp-mob-logo-sub{font-size:11px;font-weight:500;color:rgba(255,255,255,.72);}
.cp-mob-avatar{width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.18);border:1.5px solid rgba(255,255,255,.28);display:flex;align-items:center;justify-content:center;color:#fff;cursor:pointer;transition:background .18s;}
.cp-mob-avatar:hover{background:rgba(255,255,255,.28);}
.cp-mob-title{display:none;padding:14px 16px 4px;}
.cp-mob-title h2{font-size:20px;font-weight:900;color:#1e1b3a;letter-spacing:-.3px;}
.cp-mob-title p{font-size:12px;color:#9ca3af;margin-top:3px;font-weight:500;}

/* ── CREATE CARD ── */
.cp-create-card{background:#fff;border-radius:20px;border:1px solid #e8e4f5;box-shadow:0 2px 16px rgba(109,90,205,.06);position:relative;overflow:hidden;}
.cp-create-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6d5acd,#8b7ee8,#b8aef5,#8b7ee8,#6d5acd);background-size:300% 100%;animation:shimmer 4s linear infinite;}
.cp-create-inner{padding:22px 24px 24px;}
.cp-field-label{display:block;font-size:10px;font-weight:800;color:#9b8fd4;text-transform:uppercase;letter-spacing:.8px;margin-bottom:6px;}
.cp-field-label.req::after{content:' *';color:#ef4444;font-weight:900;}

/* ── Input states ── */
.cp-field-input{width:100%;height:44px;padding:0 14px;border-radius:11px;border:1.5px solid #ebe7f8;font-size:13px;color:#1e1b3a;background:#fbfaff;outline:none;font-family:'Figtree',sans-serif;transition:all .2s ease;}
.cp-field-input:focus{border-color:#8b7ee8;background:#fff;box-shadow:0 0 0 3px rgba(139,126,232,.1);}
.cp-field-input::placeholder{color:#c8c1ed;}
.cp-field-input.err{border-color:#ef4444!important;background:#fff5f5!important;box-shadow:0 0 0 3px rgba(239,68,68,.08)!important;}
.cp-field-input.ok {border-color:#22c55e!important;background:#f0fdf4!important;box-shadow:0 0 0 3px rgba(34,197,94,.06)!important;}

/* ── Field wrapper ── */
.cp-fw{position:relative;}
.cp-fw .cp-field-input{padding-right:38px;}
.cp-fstatus{position:absolute;right:12px;top:50%;transform:translateY(-50%);display:flex;align-items:center;pointer-events:none;}

/* ── Messages ── */
.cp-ferr{display:flex;align-items:center;gap:4px;margin-top:5px;font-size:11px;font-weight:700;color:#ef4444;line-height:1.4;}
.cp-fhint{display:flex;align-items:center;gap:4px;margin-top:5px;font-size:11px;font-weight:500;color:#9ca3af;line-height:1.4;}

/* ── Validation banner ── */
.cp-vbanner{display:flex;align-items:flex-start;gap:10px;padding:12px 15px;border-radius:13px;background:#fef2f2;border:1.5px solid #fecaca;margin-bottom:16px;animation:fadeUp .2s ease;}
.cp-vbanner-ico{color:#ef4444;flex-shrink:0;margin-top:1px;}
.cp-vbanner-txt{font-size:12px;color:#b91c1c;font-weight:600;line-height:1.6;}

.cp-create-btn{width:100%;height:44px;border-radius:11px;border:none;background:linear-gradient(135deg,#6d5acd,#8b7ee8);color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:'Figtree',sans-serif;box-shadow:0 4px 14px rgba(109,90,205,.22);transition:all .25s ease;display:flex;align-items:center;justify-content:center;gap:6px;}
.cp-create-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(109,90,205,.3);}
.cp-create-btn:active{transform:scale(.97);}

/* ── SEARCH / FILTER ── */
.cp-search-wrap{display:flex;align-items:center;gap:10px;padding:0 14px;height:44px;background:#fff;border:1.5px solid #ebe7f8;border-radius:12px;box-shadow:0 1px 6px rgba(109,90,205,.04);transition:all .2s;flex:1;}
.cp-search-wrap:focus-within{border-color:#8b7ee8;box-shadow:0 0 0 3px rgba(139,126,232,.1);}
.cp-search-wrap input{flex:1;border:none;outline:none;font-size:13px;background:transparent;color:#1e1b3a;font-family:'Figtree',sans-serif;}
.cp-search-wrap input::placeholder{color:#c8c1ed;}
.cp-filter-btn{display:flex;align-items:center;gap:6px;height:44px;padding:0 14px;background:#fff;border:1.5px solid #ebe7f8;border-radius:12px;color:#6d5acd;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:'Figtree',sans-serif;transition:all .2s;}
.cp-filter-btn:hover{background:#f6f4fe;border-color:#d8d2f5;}
.cp-status-select{height:44px;padding:0 14px;border-radius:12px;border:1.5px solid #ebe7f8;background:#fff;color:#1e1b3a;font-size:13px;font-weight:600;font-family:'Figtree',sans-serif;cursor:pointer;outline:none;transition:all .2s;min-width:140px;}
.cp-status-select:focus{border-color:#8b7ee8;box-shadow:0 0 0 3px rgba(139,126,232,.1);}
.cp-count{font-size:11px;font-weight:800;color:#9b8fd4;text-transform:uppercase;letter-spacing:.8px;}

/* ── DESKTOP CASE CARD ── */
.cp-dcase{background:#fff;border:1.5px solid #ebe7f8;border-radius:16px;padding:16px 20px;margin-bottom:10px;transition:all .2s ease;position:relative;overflow:hidden;}
.cp-dcase:last-child{margin-bottom:0;}
.cp-dcase::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#6d5acd,#b8aef5);opacity:0;transition:opacity .2s;}
.cp-dcase:hover{box-shadow:0 4px 18px rgba(109,90,205,.08);border-color:#d8d2f5;transform:translateX(3px);}
.cp-dcase:hover::before{opacity:1;}
.cp-dcase-inner{display:flex;align-items:center;gap:16px;}
.cp-week-av{width:50px;height:50px;border-radius:14px;flex-shrink:0;background:linear-gradient(135deg,#f2f0fc,#e8e4f8);color:#6d5acd;font-weight:800;font-size:12px;display:flex;align-items:center;justify-content:center;border:1.5px solid #ddd8f5;text-align:center;line-height:1.2;}
.cp-dcase-info{flex:1;min-width:0;}
.cp-dcase-row1{display:flex;align-items:center;gap:10px;margin-bottom:4px;flex-wrap:wrap;}
.cp-dcase-pid{font-size:15px;font-weight:800;color:#1e1b3a;letter-spacing:-.2px;}
.cp-dcase-name{font-size:13px;font-weight:600;color:#374151;margin-bottom:6px;}
.cp-dcase-meta{display:flex;align-items:center;gap:14px;flex-wrap:wrap;}
.cp-meta-item{display:flex;align-items:center;gap:5px;font-size:12px;color:#6b7280;font-weight:500;}
.cp-meta-item svg{color:#a09ac4;flex-shrink:0;}

/* ── ACTION BUTTONS ── */
.cp-mv-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;background:#fff;color:#5a4bb5;border:1.5px solid #d5cff2;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Figtree',sans-serif;transition:all .18s ease;box-shadow:0 1px 4px rgba(109,90,205,.08);}
.cp-mv-btn:hover{background:#6d5acd;color:#fff;border-color:#6d5acd;box-shadow:0 4px 14px rgba(109,90,205,.25);transform:translateY(-1px);}
.cp-mv-btn:active{transform:scale(.97);}
.cp-del-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;background:#fff;color:#dc2626;border:1.5px solid #fecaca;cursor:pointer;flex-shrink:0;transition:all .18s ease;box-shadow:0 1px 4px rgba(220,38,38,.06);}
.cp-del-btn:hover{background:#ef4444;color:#fff;border-color:#ef4444;box-shadow:0 4px 14px rgba(220,38,38,.25);transform:translateY(-1px);}
.cp-del-btn:active{transform:scale(.97);}
.cp-recheck-btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;background:#10b981;color:#fff;border:1.5px solid #10b981;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:'Figtree',sans-serif;transition:all .18s ease;box-shadow:0 1px 4px rgba(16,185,129,.08);}
.cp-recheck-btn:hover{background:#059669;border-color:#059669;box-shadow:0 4px 14px rgba(16,185,129,.25);transform:translateY(-1px);}
.cp-recheck-btn:active{transform:scale(.97);}
.cp-recheck-btn-mobile{display:inline-flex;align-items:center;gap:4px;padding:6px 10px;border-radius:7px;font-size:11px;}

/* ── MOBILE CASE ROW ── */
.cp-mcase{background:#fbfaff;border:1.5px solid #ebe7f8;border-radius:14px;padding:13px 14px;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between;gap:12px;position:relative;overflow:hidden;transition:all .18s;}
.cp-mcase:last-child{margin-bottom:0;}
.cp-mcase::before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,#6d5acd,#b8aef5);opacity:0;transition:opacity .18s;}
.cp-mcase:hover{background:#fff;border-color:#d8d2f5;box-shadow:0 3px 10px rgba(109,90,205,.07);}
.cp-mcase:hover::before{opacity:1;}
.cp-mcase-left{flex:1;min-width:0;}
.cp-mcase-top{display:flex;align-items:center;gap:8px;margin-bottom:3px;flex-wrap:wrap;}
.cp-mcase-pid{font-size:14px;font-weight:800;color:#6d5acd;}
.cp-mcase-name{font-size:12px;font-weight:600;color:#6b7280;}

/* ── BADGES ── */
.cp-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.03em;}
.cp-bdot{width:5px;height:5px;border-radius:50%;flex-shrink:0;}
.cp-b-up  {background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;} .cp-b-up .cp-bdot  {background:#3b82f6;}
.cp-b-rev {background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;} .cp-b-rev .cp-bdot {background:#f97316;}
.cp-b-done{background:#f0fdf4;color:#15803d;border:1px solid #bbf7d0;} .cp-b-done .cp-bdot{background:#22c55e;}
.cp-b-def {background:#f9fafb;color:#6b7280;border:1px solid #e5e7eb;} .cp-b-def .cp-bdot {background:#9ca3af;}

/* ── CONFIRM DIALOG ── */
.cp-confirm-overlay{position:fixed;inset:0;z-index:9999;background:rgba(20,16,45,.45);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:scaleIn .2s ease;}
.cp-confirm-box{background:#fff;border-radius:18px;padding:28px 28px 24px;max-width:380px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.2);text-align:center;}
.cp-confirm-ico{width:52px;height:52px;border-radius:16px;background:#fef2f2;border:1.5px solid #fecaca;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:#ef4444;}
.cp-confirm-title{font-size:17px;font-weight:800;color:#111827;margin-bottom:6px;}
.cp-confirm-sub{font-size:13px;color:#6b7280;line-height:1.6;margin-bottom:22px;}
.cp-confirm-actions{display:flex;gap:10px;}
.cp-confirm-cancel{flex:1;height:42px;border-radius:11px;border:1.5px solid #e5e7eb;background:#fff;color:#374151;font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Figtree',sans-serif;transition:all .15s;}
.cp-confirm-cancel:hover{background:#f9fafb;}
.cp-confirm-delete{flex:1;height:42px;border-radius:11px;border:none;background:linear-gradient(135deg,#ef4444,#f87171);color:#fff;font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Figtree',sans-serif;box-shadow:0 4px 14px rgba(239,68,68,.3);transition:all .15s;display:flex;align-items:center;justify-content:center;gap:7px;}
.cp-confirm-delete:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(239,68,68,.38);}
.cp-confirm-delete:disabled{opacity:.6;cursor:not-allowed;transform:none;}

/* ── PAGINATION ── */
.cp-page-btn{width:36px;height:36px;border-radius:10px;border:1.5px solid #ebe7f8;background:#fff;font-size:13px;font-weight:700;color:#6b7280;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-family:'Figtree',sans-serif;}
.cp-page-btn:hover{border-color:#8b7ee8;color:#6d5acd;background:#f6f4fe;}
.cp-page-btn.active{background:linear-gradient(135deg,#6d5acd,#8b7ee8);color:#fff;border-color:transparent;box-shadow:0 4px 12px rgba(109,90,205,.22);}
.cp-page-btn:disabled{opacity:.4;cursor:not-allowed;}

/* ── MISC ── */
.cp-empty{text-align:center;padding:50px 20px;color:#9ca3af;}
.cp-empty-box{width:56px;height:56px;border-radius:17px;background:#f6f4fe;border:1.5px solid #ebe7f8;display:flex;align-items:center;justify-content:middle;margin:0 auto 14px;}
.cp-section{background:#fff;border-radius:18px;border:1px solid #ebe7f8;box-shadow:0 2px 12px rgba(109,90,205,.04);overflow:hidden;}
.cp-section-bar{height:3px;background:linear-gradient(90deg,#6d5acd,#8b7ee8,#b8aef5);}
.cp-sec-icon{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#ede9fe,#ddd6fe);color:#6d5acd;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:1px solid #c8c1ed;}
.cp-divider{height:1px;background:#f7f5fe;margin:0 18px;}
.cp-desk-hdr{background:#fff;border-radius:18px;border:1px solid #ebe7f8;box-shadow:0 2px 12px rgba(109,90,205,.05);position:relative;overflow:hidden;}
.cp-desk-hdr-bar{position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#6d5acd,#8b7ee8,#b8aef5,#8b7ee8,#6d5acd);background-size:300% 100%;animation:shimmer 4s linear infinite;}
.cp-filter-sheet{position:fixed;inset:0;z-index:200;background:rgba(20,16,45,.22);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;animation:scaleIn .2s ease both;}
.cp-filter-panel{background:#fff;width:100%;max-width:480px;border-radius:22px 22px 0 0;padding:20px 20px 36px;box-shadow:0 -8px 40px rgba(109,90,205,.1);}
.cp-filter-handle{width:40px;height:4px;border-radius:2px;background:#ddd8f5;margin:0 auto 18px;}

/* ── RESPONSIVE ── */
@media (min-width:769px){
  .cp-mob-bar{display:none!important;} .cp-mob-title{display:none!important;}
  .cp-mob-cases{display:none!important;} .cp-desk-cases{display:block!important;}
  .cp-mob-filter-btn{display:none!important;} .cp-desk-filter{display:flex!important;}
}
@media (max-width:768px){
  .cp-sidebar{display:none!important;} .cp-main{margin-left:0!important;}
  .cp-topbar-wrap{display:none!important;} .cp-desk-hdr{display:none!important;}
  .cp-mob-bar{display:block!important;} .cp-mob-title{display:block!important;}
  .cp-desk-cases{display:none!important;} .cp-mob-cases{display:block!important;}
  .cp-desk-filter{display:none!important;} .cp-mob-filter-btn{display:flex!important;}
  .cp-page-pad{padding:12px 14px 90px!important;gap:14px!important;}
  .cp-create-inner{padding:16px 16px 18px!important;}
  .cp-create-grid{grid-template-columns:1fr!important;gap:12px!important;}
}
`;

const badgeClass = (s) => ({
  "Uploaded":     "cp-badge cp-b-up",
  "Under Review": "cp-badge cp-b-rev",
  "Completed":    "cp-badge cp-b-done",
}[s] || "cp-badge cp-b-def");

/* ══════════════════
   VALIDATION
══════════════════ */
const PID_RE   = /^[A-Za-z0-9\-_]+$/;
const NAME_RE  = /^[A-Za-z\s'.,-]+$/;

// ── CHANGED: added existingIds param for duplicate check ──
function validate({ patientId, patientName, gestationalAge }, existingIds = []) {
  const e = {};
  if (!patientId.trim())                                                    e.patientId = "Patient ID is required.";
  else if (patientId.trim().length < 3)                                     e.patientId = "Minimum 3 characters required.";
  else if (!PID_RE.test(patientId.trim()))                                  e.patientId = "Only letters, numbers, - or _ allowed.";
  else if (existingIds.includes(patientId.trim().toLowerCase()))            e.patientId = "This ID already exists. Please choose another ID.";

  if (!patientName.trim())                     e.patientName = "Patient name is required.";
  else if (patientName.trim().length < 2)      e.patientName = "Minimum 2 characters required.";
  else if (!NAME_RE.test(patientName.trim()))  e.patientName = "Name should not contain numbers or special characters.";

  if (gestationalAge !== "") {
    const n = Number(gestationalAge);
    if (!Number.isInteger(n) || isNaN(n))      e.gestationalAge = "Must be a whole number.";
    else if (n < 4)                            e.gestationalAge = "Minimum gestational age is 4 weeks.";
    else if (n > 43)                           e.gestationalAge = "Maximum gestational age is 43 weeks.";
  }
  return e;
}

/* ══════════════════
   CONFIRM DELETE
══════════════════ */
function ConfirmDelete({ caseName, onCancel, onConfirm, deleting }) {
  return (
    <div className="cp-confirm-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="cp-confirm-box">
        <div className="cp-confirm-ico"><Trash2 size={22}/></div>
        <div className="cp-confirm-title">Delete Case?</div>
        <div className="cp-confirm-sub">
          Are you sure you want to delete <strong>{caseName}</strong>?<br/>This action cannot be undone.
        </div>
        <div className="cp-confirm-actions">
          <button className="cp-confirm-cancel" onClick={onCancel}>Cancel</button>
          <button className="cp-confirm-delete" onClick={onConfirm} disabled={deleting}>
            <Trash2 size={14}/>{deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════
   CREATE FORM
══════════════════ */
// ── CHANGED: added existingIds = [] prop ──
function CreateForm({ patientId, setPatientId, patientName, setPatientName,
                      gestationalAge, setGestationalAge, consanguinity, setConsanguinity,
                      mode, setMode, existingIds = [], onSubmit }) {

  const [errors,  setErrors]  = useState({});
  const [touched, setTouched] = useState({});
  const [shake,   setShake]   = useState(false);

  // ── CHANGED: pass existingIds into validate ──
  const revalidate = (overrides = {}) => {
    const errs = validate({
      patientId:      overrides.patientId      ?? patientId,
      patientName:    overrides.patientName    ?? patientName,
      gestationalAge: overrides.gestationalAge ?? gestationalAge,
    }, existingIds);
    setErrors(errs);
    return errs;
  };

  const touch = (f) => setTouched(p => ({ ...p, [f]: true }));

  const handleField = (field, value, setter) => {
    setter(value);
    if (touched[field]) revalidate({ [field]: value });
  };

  /* Block non-numeric and >43 live while typing */
  const handleGAKeyDown = (e) => {
    const safe = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter"];
    if (safe.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    const preview = parseInt((gestationalAge || "") + e.key, 10);
    if (preview > 43) e.preventDefault();
  };

  const handleSubmit = () => {
    setTouched({ patientId: true, patientName: true, gestationalAge: true });
    const errs = revalidate();
    if (Object.keys(errs).length) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    onSubmit();
  };

  const cls = (f) => {
    if (!touched[f]) return "cp-field-input";
    return errors[f] ? "cp-field-input err" : "cp-field-input ok";
  };

  const visibleErrors = Object.entries(errors).filter(([k]) => touched[k]);

  return (
    <>
      {visibleErrors.length > 0 && (
        <div className="cp-vbanner">
          <AlertCircle size={15} className="cp-vbanner-ico"/>
          <div className="cp-vbanner-txt">
            <strong>{visibleErrors.length} issue{visibleErrors.length > 1 ? "s" : ""} to fix:</strong>
            <ul style={{margin:"4px 0 0 14px",listStyle:"disc"}}>
              {visibleErrors.map(([,msg]) => <li key={msg}>{msg}</li>)}
            </ul>
          </div>
        </div>
      )}

      <div className="cp-create-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"16px"}}>

        {/* Patient ID */}
        <div>
          <label className="cp-field-label req">PATIENT ID</label>
          <div className="cp-fw">
            <input className={cls("patientId")} placeholder="e.g. PT-2024-001"
              value={patientId}
              onChange={e => handleField("patientId", e.target.value, setPatientId)}
              onBlur={() => { touch("patientId"); revalidate(); }}
            />
            <span className="cp-fstatus">
              {touched.patientId && errors.patientId  && <AlertCircle  size={14} color="#ef4444"/>}
              {touched.patientId && !errors.patientId && <CheckCircle2 size={14} color="#22c55e"/>}
            </span>
          </div>
          {touched.patientId && errors.patientId
            ? <div className="cp-ferr"><AlertCircle size={11}/>{errors.patientId}</div>
            : <div className="cp-fhint">Min 3 chars · letters, numbers, - or _</div>
          }
        </div>

        {/* Patient Name */}
        <div>
          <label className="cp-field-label req">PATIENT NAME</label>
          <div className="cp-fw">
            <input className={cls("patientName")} placeholder="Full name"
              value={patientName}
              onChange={e => handleField("patientName", e.target.value, setPatientName)}
              onBlur={() => { touch("patientName"); revalidate(); }}
            />
            <span className="cp-fstatus">
              {touched.patientName && errors.patientName  && <AlertCircle  size={14} color="#ef4444"/>}
              {touched.patientName && !errors.patientName && <CheckCircle2 size={14} color="#22c55e"/>}
            </span>
          </div>
          {touched.patientName && errors.patientName
            ? <div className="cp-ferr"><AlertCircle size={11}/>{errors.patientName}</div>
            : <div className="cp-fhint">Letters only · no numbers or symbols</div>
          }
        </div>

        {/* Gestational Age */}
        <div>
          <label className="cp-field-label">GESTATIONAL AGE (WEEKS)</label>
          <div className="cp-fw">
            <input
              className={cls("gestationalAge")}
              placeholder="4 – 43"
              value={gestationalAge}
              type="text"
              inputMode="numeric"
              maxLength={2}
              onKeyDown={handleGAKeyDown}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, "");
                handleField("gestationalAge", v, setGestationalAge);
              }}
              onBlur={() => { touch("gestationalAge"); revalidate(); }}
            />
            <span className="cp-fstatus">
              {touched.gestationalAge && errors.gestationalAge   && <AlertCircle  size={14} color="#ef4444"/>}
              {touched.gestationalAge && gestationalAge && !errors.gestationalAge && <CheckCircle2 size={14} color="#22c55e"/>}
            </span>
          </div>
          {touched.gestationalAge && errors.gestationalAge
            ? <div className="cp-ferr"><AlertCircle size={11}/>{errors.gestationalAge}</div>
            : <div className="cp-fhint">
                Optional ·&nbsp;
                <span style={{fontWeight:700,color:gestationalAge && Number(gestationalAge) > 43 ? "#ef4444" : "#9ca3af"}}>
                  valid range: 4 – 43 weeks
                </span>
              </div>
          }
        </div>

        {/* Consanguinity */}
        <div>
          <label className="cp-field-label">CONSANGUINITY</label>
          <select value={consanguinity} onChange={e => setConsanguinity(e.target.value)}
            className="cp-field-input" style={{cursor:"pointer"}}>
            <option>No</option><option>Yes</option>
          </select>
        </div>

        {/* Mode of Conception */}
        <div>
          <label className="cp-field-label">MODE OF CONCEPTION</label>
          <select value={mode} onChange={e => setMode(e.target.value)}
            className="cp-field-input" style={{cursor:"pointer"}}>
            <option>Natural</option><option>IVF</option><option>ICSI</option><option>IUI</option>
          </select>
        </div>

        {/* Submit */}
        <div style={{display:"flex",alignItems:"flex-end"}}>
          <button className={`cp-create-btn${shake?" cp-shake":""}`} onClick={handleSubmit}>
            <Plus size={14}/> Create Case
          </button>
        </div>

      </div>
    </>
  );
}

/* ══════════════════
   MAIN COMPONENT
══════════════════ */
export default function Cases() {
  const [collapsed,      setCollapsed]      = useState(window.innerWidth <= 768);
  const [cases,          setCases]          = useState([]);
  const [selectedCase,   setSelectedCase]   = useState(null);
  const [searchTerm,     setSearchTerm]     = useState("");
  const [status,         setStatus]         = useState("All");
  const [patientId,      setPatientId]      = useState("");
  const [patientName,    setPatientName]    = useState("");
  const [gestationalAge, setGestationalAge] = useState("");
  const [consanguinity,  setConsanguinity]  = useState("No");
  const [mode,           setMode]           = useState("Natural");
  const [currentPage,    setCurrentPage]    = useState(1);
  const [showMobFilter,  setShowMobFilter]  = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget,   setDeleteTarget]   = useState(null);
  const [deleting,       setDeleting]       = useState(false);
  const casesPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
    const onR = () => setCollapsed(window.innerWidth <= 768);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  const fetchCases = async () => {
    try { const res = await API.get("/cases"); setCases(res.data.cases || res.data || []); }
    catch(e) { console.error(e); }
  };

  const filtered = cases.filter(c => {
    const m = c.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              c.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    return m && (status === "All" || c.status === status);
  });

  const totalPages = Math.ceil(filtered.length / casesPerPage);
  const paginated  = filtered.slice((currentPage-1)*casesPerPage, currentPage*casesPerPage);

  const handleCreate = async () => {
    try {
      await API.post("/cases",{ patientId, patientName, gestationalAge, consanguinity, modeOfConception:mode });
      fetchCases();
      setPatientId(""); setPatientName(""); setGestationalAge("");
      setShowCreateForm(false);
    } catch { alert("Error creating case"); }
  };

  const openDetails = async (id) => {
    try {
      const res = await API.get(`/cases/${id}`);
      const d = res.data;
      setSelectedCase(d?.case ?? d?.data ?? d);
    } catch(e) { console.error(e); alert("Failed to load case"); }
  };

  const handleRecheck = (caseId) => {
    navigate(`/gene-analysis?caseId=${caseId}&recheck=true`);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await API.delete(`/cases/${deleteTarget.id}`);
      setCases(prev => prev.filter(c => c._id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch(e) { console.error(e); alert("Failed to delete case."); }
    finally { setDeleting(false); }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="cp">
        <div className="cp-sidebar"><Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)}/></div>

        <div className="cp-main cp-anim" style={{marginLeft:collapsed?"72px":"240px",transition:"margin-left .3s cubic-bezier(.4,0,.2,1)"}}>

          {/* Desktop Topbar */}
          <div className="cp-topbar-wrap" style={{background:"#fff",borderBottom:"1px solid #ede9f8",height:"64px",display:"flex",alignItems:"center",justifyContent:"flex-end",padding:"0 28px",position:"sticky",top:0,zIndex:50,boxShadow:"0 1px 8px rgba(109,90,205,.05)"}}>
            <div onClick={() => navigate("/profile")}
              style={{width:"40px",height:"40px",borderRadius:"12px",background:"linear-gradient(135deg,#ede9fe,#ddd6fe)",border:"1.5px solid #c8c1ed",display:"flex",alignItems:"center",justifyContent:"center",color:"#6d5acd",cursor:"pointer",transition:"all .18s",boxShadow:"0 2px 8px rgba(109,90,205,.12)"}}
              onMouseEnter={e=>{e.currentTarget.style.background="linear-gradient(135deg,#6d5acd,#8b7ee8)";e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.background="linear-gradient(135deg,#ede9fe,#ddd6fe)";e.currentTarget.style.color="#6d5acd";}}>
              <User size={18}/>
            </div>
          </div>

          {/* Mobile banner */}
          <div className="cp-mob-bar">
            <div className="cp-mob-bar-inner">
              <div className="cp-mob-logo">
                <div className="cp-mob-logo-box">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                    <path d="M12 7v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div><div className="cp-mob-logo-name">Prenatal AI</div><div className="cp-mob-logo-sub">Copilot</div></div>
              </div>
              <div className="cp-mob-avatar" onClick={() => navigate("/profile")}><User size={16}/></div>
            </div>
          </div>

          <div className="cp-mob-title"><h2>Case Management</h2><p>Track and review all patient cases</p></div>

          <div className="cp-page-pad" style={{padding:"22px 26px 28px",maxWidth:"1200px",margin:"0 auto",display:"flex",flexDirection:"column",gap:"18px"}}>

            {/* Desktop header */}
            <div className="cp-desk-hdr">
              <div className="cp-desk-hdr-bar"/>
              <div style={{padding:"20px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
                <div>
                  <div style={{fontSize:"10px",fontWeight:800,letterSpacing:"1.5px",color:"#9b8fd4",textTransform:"uppercase",marginBottom:"5px"}}>Prenatal AI · Cases</div>
                  <h1 style={{fontSize:"21px",fontWeight:900,color:"#1e1b3a",letterSpacing:"-.3px",margin:0}}>Case Management</h1>
                  <p style={{fontSize:"12px",color:"#9ca3af",marginTop:"3px"}}>Manage, track and review all patient cases</p>
                </div>
                <div style={{display:"flex",gap:"6px"}}>
                  {[{label:`${cases.length} Total`,c:"#5a4bb5",bg:"#f0edfb",bd:"#d5cff2"},{label:`${cases.filter(c=>c.status==="Uploaded").length} Uploaded`,c:"#2563eb",bg:"#eff6ff",bd:"#bfdbfe"},{label:`${cases.filter(c=>c.status==="Completed").length} Completed`,c:"#15803d",bg:"#f0fdf4",bd:"#bbf7d0"}].map(s=>(
                    <div key={s.label} style={{padding:"4px 10px",borderRadius:"8px",background:s.bg,border:`1px solid ${s.bd}`,fontSize:"11px",fontWeight:700,color:s.c}}>{s.label}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Create case card */}
            <div className="cp-create-card">
              <div className="cp-create-inner">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px",flexWrap:"wrap",gap:"10px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div style={{width:"34px",height:"34px",borderRadius:"10px",background:"linear-gradient(135deg,#ede9fe,#ddd6fe)",border:"1px solid #c8c1ed",display:"flex",alignItems:"center",justifyContent:"center",color:"#6d5acd"}}><Plus size={16}/></div>
                    <div>
                      <div style={{fontWeight:800,color:"#1e1b3a",fontSize:"14px",lineHeight:1.2}}>Create New Case</div>
                      <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"1px"}}>Fill in the patient details below</div>
                    </div>
                  </div>
                  <button className="cp-mob-filter-btn"
                    style={{display:"none",alignItems:"center",gap:"5px",padding:"6px 12px",borderRadius:"9px",background:showCreateForm?"#f0edfb":"linear-gradient(135deg,#6d5acd,#8b7ee8)",color:showCreateForm?"#6d5acd":"#fff",border:showCreateForm?"1px solid #d5cff2":"none",fontSize:"12px",fontWeight:700,cursor:"pointer",fontFamily:"'Figtree',sans-serif"}}
                    onClick={() => setShowCreateForm(!showCreateForm)}>
                    {showCreateForm ? <><X size={13}/> Hide</> : <><Plus size={13}/> New Case</>}
                  </button>
                </div>
                <div className="cp-create-form-wrap" style={{display:showCreateForm||window.innerWidth>768?"block":"none"}}>
                  {/* ── CHANGED: pass existingIds derived from cases list ── */}
                  <CreateForm
                    patientId={patientId}           setPatientId={setPatientId}
                    patientName={patientName}       setPatientName={setPatientName}
                    gestationalAge={gestationalAge} setGestationalAge={setGestationalAge}
                    consanguinity={consanguinity}   setConsanguinity={setConsanguinity}
                    mode={mode}                     setMode={setMode}
                    existingIds={cases.map(c => c.patientId?.toLowerCase()).filter(Boolean)}
                    onSubmit={handleCreate}
                  />
                </div>
                <style>{`@media(min-width:769px){.cp-create-form-wrap{display:block!important;}}`}</style>
              </div>
            </div>

            {/* Desktop search + filter */}
            <div className="cp-desk-filter" style={{display:"flex",alignItems:"center",gap:"10px",flexWrap:"wrap"}}>
              <div className="cp-search-wrap">
                <Search size={14} color="#c8c1ed"/>
                <input placeholder="Search by Patient ID or Name..." value={searchTerm} onChange={e=>{ setSearchTerm(e.target.value); setCurrentPage(1); }}/>
              </div>
              <select value={status} onChange={e=>{ setStatus(e.target.value); setCurrentPage(1); }} className="cp-status-select">
                <option>All</option><option>Under Review</option><option>Uploaded</option><option>Completed</option>
              </select>
            </div>

            {/* Mobile search + filter */}
            <div className="cp-mob-filter-btn" style={{display:"none",gap:"10px"}}>
              <div className="cp-search-wrap">
                <Search size={14} color="#c8c1ed"/>
                <input placeholder="Search..." value={searchTerm} onChange={e=>{ setSearchTerm(e.target.value); setCurrentPage(1); }}/>
              </div>
              <button className="cp-filter-btn" onClick={()=>setShowMobFilter(true)}><Filter size={13}/> Filter</button>
            </div>

            {/* Case list */}
            <div className="cp-section">
              <div className="cp-section-bar"/>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 20px 12px"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div className="cp-sec-icon"><Activity size={15}/></div>
                  <div>
                    <div style={{fontWeight:800,color:"#1e1b3a",fontSize:"14px",lineHeight:1.2}}>All Cases</div>
                    <div style={{fontSize:"11px",color:"#9ca3af",marginTop:"1px"}}>{filtered.length} case{filtered.length!==1?"s":""} found</div>
                  </div>
                </div>
                <span className="cp-count">{filtered.length} total</span>
              </div>
              <div className="cp-divider"/>
              <div style={{padding:"14px 16px 16px"}}>
                {paginated.length === 0 ? (
                  <div className="cp-empty">
                    <div className="cp-empty-box"><FileText size={22} color="#c8c1ed"/></div>
                    <p style={{fontWeight:700,color:"#6b7280",fontSize:"14px",margin:"0 0 4px"}}>No cases found</p>
                    <p style={{fontSize:"12px",color:"#9ca3af",margin:0}}>Try adjusting your search or filters</p>
                  </div>
                ) : (<>
                  {/* Desktop */}
                  <div className="cp-desk-cases">
                    {paginated.map(c => (
                      <div key={c._id} className="cp-dcase">
                        <div className="cp-dcase-inner">
                          <div className="cp-week-av">{c.gestationalAge ? `${c.gestationalAge}w` : (c.patientName?.charAt(0)?.toUpperCase()||"P")}</div>
                          <div className="cp-dcase-info">
                            <div className="cp-dcase-row1">
                              <span className="cp-dcase-pid">{c.patientId}</span>
                              <span className={badgeClass(c.status)}><span className="cp-bdot"/>{c.status||"Draft"}</span>
                            </div>
                            <div className="cp-dcase-name">{c.patientName}</div>
                            <div className="cp-dcase-meta">
                              {c.gestationalAge && <span className="cp-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{c.gestationalAge} weeks</span>}
                              {c.modeOfConception && <span className="cp-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>{c.modeOfConception}</span>}
                              {c.consanguinity !== undefined && <span className="cp-meta-item"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>Consanguinity: {c.consanguinity?"Yes":"No"}</span>}
                            </div>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:"8px",flexShrink:0}} onClick={e=>e.stopPropagation()}>
                            <button className="cp-mv-btn" onClick={()=>openDetails(c._id)}><Eye size={13}/> View Details</button>
                            {c.status === "Completed" && (
                              <button className="cp-recheck-btn" onClick={()=>handleRecheck(c._id)}><RefreshCw size={13}/> Recheck</button>
                            )}
                            <button className="cp-del-btn" title="Delete case" onClick={()=>setDeleteTarget({id:c._id,name:c.patientName||c.patientId})}><Trash2 size={14}/></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Mobile */}
                  <div className="cp-mob-cases">
                    {paginated.map(c => (
                      <div key={c._id} className="cp-mcase">
                        <div className="cp-mcase-left">
                          <div className="cp-mcase-top">
                            <span className="cp-mcase-pid">{c.patientId}</span>
                            <span className={badgeClass(c.status)}><span className="cp-bdot"/>{c.status||"Draft"}</span>
                          </div>
                          <div className="cp-mcase-name">{c.patientName}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:"7px",flexShrink:0}} onClick={e=>e.stopPropagation()}>
                          <button className="cp-mv-btn" onClick={()=>openDetails(c._id)}><Eye size={12}/> View</button>
                          {c.status === "Completed" && (
                            <button className="cp-recheck-btn cp-recheck-btn-mobile" onClick={()=>handleRecheck(c._id)}><RefreshCw size={12}/> Recheck</button>
                          )}
                          <button className="cp-del-btn" title="Delete case" onClick={()=>setDeleteTarget({id:c._id,name:c.patientName||c.patientId})}><Trash2 size={13}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>)}
              </div>
              {totalPages > 1 && (
                <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"0 16px 16px"}}>
                  <button className="cp-page-btn" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}><ChevronLeft size={15}/></button>
                  {[...Array(totalPages)].map((_,i)=>(
                    <button key={i} className={`cp-page-btn${currentPage===i+1?" active":""}`} onClick={()=>setCurrentPage(i+1)}>{i+1}</button>
                  ))}
                  <button className="cp-page-btn" disabled={currentPage===totalPages} onClick={()=>setCurrentPage(p=>p+1)}><ChevronRight size={15}/></button>
                </div>
              )}
            </div>
          </div>
        </div>
        <MobileBottomBar />
      </div>

      {/* Mobile filter sheet */}
      {showMobFilter && (
        <div className="cp-filter-sheet" onClick={e=>{ if(e.target===e.currentTarget) setShowMobFilter(false); }}>
          <div className="cp-filter-panel">
            <div className="cp-filter-handle"/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"18px"}}>
              <span style={{fontSize:"16px",fontWeight:800,color:"#1e1b3a"}}>Filter Cases</span>
              <button onClick={()=>setShowMobFilter(false)} style={{width:"30px",height:"30px",borderRadius:"9px",background:"#f6f4fe",border:"1px solid #ebe7f8",color:"#6d5acd",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={14}/></button>
            </div>
            <label className="cp-field-label" style={{display:"block",marginBottom:"6px"}}>FILTER BY STATUS</label>
            {["All","Uploaded","Under Review","Completed"].map(s=>(
              <button key={s} onClick={()=>{ setStatus(s); setCurrentPage(1); setShowMobFilter(false); }}
                style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"12px 14px",borderRadius:"12px",marginBottom:"8px",border:`1.5px solid ${status===s?"#8b7ee8":"#ebe7f8"}`,background:status===s?"#f0edfb":"#fbfaff",color:status===s?"#6d5acd":"#374151",fontSize:"13px",fontWeight:status===s?800:600,cursor:"pointer",fontFamily:"'Figtree',sans-serif"}}>
                {s}{status===s&&<span style={{width:"8px",height:"8px",borderRadius:"50%",background:"#8b7ee8",display:"inline-block"}}/>}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedCase && <CaseDetailsModal caseData={selectedCase} onClose={()=>setSelectedCase(null)}/>}

      {deleteTarget && (
        <ConfirmDelete caseName={deleteTarget.name} onCancel={()=>setDeleteTarget(null)} onConfirm={handleDeleteConfirm} deleting={deleting}/>
      )}
    </>
  );
}