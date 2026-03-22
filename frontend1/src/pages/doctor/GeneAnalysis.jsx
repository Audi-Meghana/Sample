import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import MobileBottomBar from "../../components/doctor/MobileBottomBar";
import { jsPDF } from "jspdf";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import API from "../../services/api";
import {
  Dna, AlertTriangle, UploadCloud, FileText, X,
  CheckCircle, ChevronDown, ChevronUp, Download,
  Mic, MicOff, User, Send, MessageSquare,
  Activity, Shield, Zap, Loader, Search,
  TrendingUp, Info, Phone, ClipboardList,
  ChevronRight, BarChart2, Heart, Eye
} from "lucide-react";

/* ═══════════════════════════════════════
   STYLES
═══════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap');

:root {
  --teal:     #7c3aed;
  --teal-l:   #a78bfa;
  --teal-d:   #5b21b6;
  --teal-xl:  #ede9fe;
  --navy:     #2e1065;
  --navy-m:   #4c1d95;
  --slate:    #334155;
  --muted:    #64748b;
  --border:   #e2e8f0;
  --surface:  #ffffff;
  --bg:       #faf9ff;
  --red:      #ef4444;
  --amber:    #f59e0b;
  --green:    #10b981;
  --blue:     #3b82f6;
  --r:        14px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.g-root {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  min-height: 100vh;
  color: var(--navy);
}

@keyframes g-fade   { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
@keyframes g-pop    { from { opacity:0; transform:scale(.97) } to { opacity:1; transform:scale(1) } }
@keyframes g-spin   { to { transform:rotate(360deg) } }
@keyframes g-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.4)} 60%{box-shadow:0 0 0 12px rgba(124,58,237,0)} }
@keyframes g-bar    { from{width:0} to{width:var(--bar-w,100%)} }
@keyframes g-num    { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
@keyframes g-tick   { 0%{transform:scale(0)}60%{transform:scale(1.2)}100%{transform:scale(1)} }

.g-main { display:flex; flex-direction:column; min-height:100vh; }
.g-body  { flex:1; padding:24px; overflow-y:auto; animation:g-fade .4s ease; }

.g-mob-top {
  display: none;
  background: var(--navy);
  padding: 14px 16px;
  align-items: center;
  justify-content: space-between;
}
.g-mob-logo { display:flex; align-items:center; gap:10px; }
.g-mob-logo-ico {
  width:36px; height:36px; border-radius:10px;
  background: linear-gradient(135deg,var(--teal),var(--teal-l));
  display:flex; align-items:center; justify-content:center; color:#fff;
}
.g-mob-logo-name { font-size:16px; font-weight:800; color:#fff; }
.g-mob-logo-sub  { font-size:10px; color:rgba(255,255,255,.5); }
.g-mob-avatar {
  width:36px; height:36px; border-radius:10px;
  background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15);
  display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer;
}

.g-header {
  background: var(--navy);
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.g-header::before {
  content:'';
  position:absolute; inset:0;
  background: radial-gradient(circle at 80% 50%, rgba(124,58,237,.25) 0%, transparent 60%);
  pointer-events:none;
}
.g-header-inner { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:14px; }
.g-header-left  { display:flex; align-items:center; gap:14px; }
.g-header-ico   {
  width:48px; height:48px; border-radius:14px;
  background: linear-gradient(135deg,var(--teal),var(--teal-l));
  display:flex; align-items:center; justify-content:center; color:#fff;
  box-shadow: 0 4px 16px rgba(13,148,136,.4);
}
.g-header-title { font-size:22px; font-weight:800; color:#fff; }
.g-header-sub   { font-size:12px; color:rgba(255,255,255,.5); margin-top:2px; }
.g-header-chips { display:flex; gap:8px; }
.g-chip {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 12px; border-radius:999px;
  background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
  font-size:11px; font-weight:600; color:rgba(255,255,255,.75);
}

.g-disc {
  display:flex; gap:12px; padding:12px 16px;
  border-radius:12px; background:#fffbeb;
  border:1.5px solid #fde68a; margin-bottom:20px;
}
.g-disc-title { font-size:12px; font-weight:700; color:#92400e; }
.g-disc-body  { font-size:11.5px; color:#a16207; line-height:1.6; margin-top:2px; }

.g-steps {
  display:flex; align-items:center; gap:0;
  margin-bottom:24px; background:var(--surface);
  border-radius:14px; border:1.5px solid var(--border);
  padding:16px 20px; overflow-x:auto;
}
.g-step-item { display:flex; align-items:center; gap:0; flex-shrink:0; }
.g-step-node {
  display:flex; flex-direction:column; align-items:center; gap:6px; cursor:default;
}
.g-step-circle {
  width:36px; height:36px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:800;
  background:var(--border); color:var(--muted);
  border:2px solid var(--border); transition:all .3s;
  flex-shrink:0;
}
.g-step-circle.active { background:var(--teal); color:#fff; border-color:var(--teal); box-shadow:0 4px 12px rgba(13,148,136,.3); }
.g-step-circle.done   { background:var(--green); color:#fff; border-color:var(--green); }
.g-step-label { font-size:11px; font-weight:600; color:var(--muted); white-space:nowrap; }
.g-step-label.active { color:var(--teal); }
.g-step-label.done   { color:var(--green); }
.g-step-line { width:40px; height:2px; background:var(--border); margin-top:-12px; transition:background .3s; flex-shrink:0; }
.g-step-line.done { background:var(--green); }

.g-card {
  background:var(--surface); border-radius:var(--r);
  border:1.5px solid var(--border);
  box-shadow:0 1px 8px rgba(15,23,42,.05);
  animation:g-pop .3s ease;
}
.g-card-head {
  display:flex; align-items:center; gap:12px;
  padding:16px 20px; border-bottom:1.5px solid var(--border);
  border-radius:var(--r) var(--r) 0 0;
}
.g-card-ico {
  width:36px; height:36px; border-radius:10px;
  background:var(--teal-xl); color:var(--teal);
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.g-card-title { font-size:15px; font-weight:700; color:var(--navy); }
.g-card-sub   { font-size:11.5px; color:var(--muted); margin-top:2px; }
.g-card-body  { padding:20px; }

.cs-wrap { position:relative; }
.cs-box {
  width:100%; height:50px; padding:0 14px;
  border:2px solid #e2e8f0; border-radius:12px;
  background:#fff; display:flex; align-items:center;
  justify-content:space-between; gap:10px;
  cursor:pointer; transition:border-color .2s, box-shadow .2s;
  user-select:none;
}
.cs-box:hover   { border-color:#a78bfa; }
.cs-box.cs-open { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,.12); }
.cs-left { display:flex; align-items:center; gap:10px; flex:1; min-width:0; }
.cs-icon { color:#7c3aed; flex-shrink:0; }
.cs-text { font-size:14px; font-weight:500; color:#1e1b4b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cs-text.cs-ph  { color:#94a3b8; font-weight:400; }
.cs-pill { padding:3px 10px; border-radius:999px; font-size:11px; font-weight:700; flex-shrink:0; }
.cs-pill-u { background:#dbeafe; color:#1d4ed8; }
.cs-pill-r { background:#fef3c7; color:#b45309; }
.cs-arrow { color:#94a3b8; flex-shrink:0; transition:transform .2s; }
.cs-box.cs-open .cs-arrow { transform:rotate(180deg); color:#7c3aed; }

.cs-panel {
  position:absolute; top:calc(100% + 6px); left:0; right:0;
  background:#fff; border:2px solid #7c3aed; border-radius:14px;
  box-shadow:0 12px 40px rgba(124,58,237,.18);
  z-index:9999; overflow:hidden;
}
.cs-search {
  display:flex; align-items:center; gap:8px;
  padding:10px 14px; border-bottom:1px solid #ede9fe;
  background:#faf8ff;
}
.cs-search-icon { color:#a78bfa; flex-shrink:0; }
.cs-search input {
  flex:1; border:none; outline:none; background:transparent;
  font-family:inherit; font-size:13px; color:#1e1b4b;
}
.cs-search input::placeholder { color:#c4b5fd; }
.cs-list { max-height:240px; overflow-y:auto; }
.cs-list::-webkit-scrollbar { width:4px; }
.cs-list::-webkit-scrollbar-thumb { background:#ddd8f5; border-radius:4px; }
.cs-item {
  display:flex; align-items:center; justify-content:space-between; gap:10px;
  padding:11px 14px; cursor:pointer; border-bottom:1px solid #f5f3ff;
  transition:background .12s;
}
.cs-item:last-child { border-bottom:none; }
.cs-item:hover { background:#f5f3ff; }
.cs-item.cs-sel { background:#ede9fe; }
.cs-item-name { font-size:13px; font-weight:600; color:#1e1b4b; }
.cs-item-id   { font-size:11px; color:#64748b; margin-top:2px; font-family:'Fira Code',monospace; }
.cs-empty { padding:20px; text-align:center; font-size:13px; color:#94a3b8; }

.g-tabs {
  display:flex; gap:0; padding:4px;
  background:#f1f5f9; border-radius:12px; margin-bottom:16px;
}
.g-tab {
  flex:1; display:flex; align-items:center; justify-content:center; gap:6px;
  padding:10px 6px; border-radius:9px; cursor:pointer;
  border:none; background:transparent;
  font-family:'Plus Jakarta Sans',sans-serif; font-size:12px; font-weight:700;
  color:var(--muted); transition:all .2s;
}
.g-tab.active { background:#fff; color:var(--teal); box-shadow:0 2px 8px rgba(15,23,42,.08); }
.g-tab:hover:not(.active) { color:var(--teal); }

.g-drop {
  border:2px dashed #cbd5e1; border-radius:14px;
  padding:40px 20px; text-align:center; cursor:pointer;
  background:#f8fafc; transition:all .25s;
}
.g-drop:hover, .g-drop.drag {
  border-color:var(--teal); background:#f5f3ff;
  transform:translateY(-2px); box-shadow:0 8px 24px rgba(124,58,237,.1);
}
.g-drop-ico {
  width:64px; height:64px; margin:0 auto 14px; border-radius:50%;
  background:linear-gradient(135deg,var(--teal),var(--teal-l));
  display:flex; align-items:center; justify-content:center; color:#fff;
  box-shadow:0 6px 18px rgba(124,58,237,.3); transition:transform .2s;
}
.g-drop:hover .g-drop-ico { transform:scale(1.07); }
.g-drop-title { font-size:15px; font-weight:700; color:var(--navy); margin-bottom:5px; }
.g-drop-sub   { font-size:12.5px; color:var(--muted); }
.g-drop-pills { display:flex; justify-content:center; gap:6px; margin-top:14px; flex-wrap:wrap; }
.g-pill {
  padding:3px 10px; border-radius:999px;
  background:#f1f5f9; border:1px solid var(--border);
  font-size:10px; font-weight:700; color:var(--slate);
  font-family:'Fira Code',monospace;
}

.g-file-prev {
  display:flex; align-items:center; gap:14px; padding:14px 16px;
  border-radius:12px; background:#f5f3ff; border:1.5px solid #c4b5fd;
  animation:g-fade .3s ease;
}
.g-file-prev-ico {
  width:44px; height:44px; border-radius:12px;
  background:#ede9fe; display:flex; align-items:center; justify-content:center; color:var(--teal); flex-shrink:0;
}
.g-file-name { font-size:13px; font-weight:700; color:var(--navy); }
.g-file-size { font-size:11px; color:var(--muted); font-family:'Fira Code',monospace; margin-top:2px; }
.g-file-rm {
  margin-left:auto; width:30px; height:30px; border-radius:8px;
  background:#fee2e2; border:none; color:var(--red);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:all .15s; flex-shrink:0;
}
.g-file-rm:hover { background:var(--red); color:#fff; }

.g-mic-zone {
  display:flex; flex-direction:column; align-items:center;
  padding:32px 20px; border-radius:14px;
  background:#f8fafc; border:1.5px solid var(--border); gap:14px;
}
.g-mic-btn {
  width:72px; height:72px; border-radius:50%; border:none;
  background:linear-gradient(135deg,var(--teal),var(--teal-l));
  color:#fff; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 20px rgba(13,148,136,.35); transition:all .2s;
}
.g-mic-btn:hover { transform:scale(1.06); }
.g-mic-btn.rec {
  background:linear-gradient(135deg,#dc2626,#f87171);
  animation:g-pulse 1.5s infinite;
}
.g-mic-label { font-size:13px; font-weight:600; color:var(--slate); }
.g-mic-sub   { font-size:11px; color:var(--muted); }

.g-textarea {
  width:100%; min-height:120px; padding:14px;
  border-radius:12px; border:1.5px solid var(--border);
  background:#f8fafc; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:13px; color:var(--navy); resize:vertical; outline:none; transition:all .15s;
}
.g-textarea:focus { border-color:var(--teal); background:#fff; box-shadow:0 0 0 3px rgba(124,58,237,.1); }
.g-textarea::placeholder { color:#94a3b8; }

.g-btn-primary {
  display:flex; align-items:center; justify-content:center; gap:8px;
  padding:13px 22px; border:none; border-radius:12px;
  background:linear-gradient(135deg,var(--teal-d),var(--teal));
  color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:14px; font-weight:700; cursor:pointer;
  box-shadow:0 4px 14px rgba(124,58,237,.3); transition:all .2s;
}
.g-btn-primary:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 22px rgba(124,58,237,.4); }
.g-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
.g-btn-secondary {
  display:flex; align-items:center; justify-content:center; gap:8px;
  padding:11px 20px; border:1.5px solid var(--border); border-radius:12px;
  background:#fff; color:var(--slate); font-family:'Plus Jakarta Sans',sans-serif;
  font-size:13px; font-weight:600; cursor:pointer; transition:all .2s;
}
.g-btn-secondary:hover { border-color:var(--teal); color:var(--teal); }

.g-start-btn {
  width:100%; margin-top:18px;
  padding:15px; border:none; border-radius:13px;
  background:linear-gradient(135deg,#4c1d95,#7c3aed,#a78bfa);
  color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:15px; font-weight:800; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:9px;
  box-shadow:0 6px 24px rgba(124,58,237,.35); transition:all .22s; letter-spacing:.2px;
}
.g-start-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(124,58,237,.45); }
.g-start-btn:disabled { opacity:.5; cursor:not-allowed; }
.g-spin { animation:g-spin .8s linear infinite; }

.g-audio-prev {
  padding:14px 16px; border-radius:12px;
  background:#f5f3ff; border:1.5px solid #ddd8f5;
  display:flex; flex-direction:column; gap:10px;
}
.g-audio-top { display:flex; align-items:center; gap:10px; }
.g-audio-rm {
  margin-left:auto; width:28px; height:28px; border-radius:8px;
  background:#fee2e2; border:none; color:var(--red);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
}
audio { width:100%; border-radius:10px; height:36px; }

.g-text-preview {
  padding:12px 14px; border-radius:11px;
  background:#f5f3ff; border:1.5px solid #c4b5fd;
  font-size:12.5px; color:var(--navy); line-height:1.6;
  max-height:100px; overflow-y:auto;
  font-family:'Fira Code',monospace;
}

.g-analysis { display:flex; flex-direction:column; gap:20px; margin-top:24px; animation:g-fade .4s ease; }

.g-gene-grid {
  display:grid; grid-template-columns:repeat(3,1fr); gap:12px; padding:18px;
}
.g-gene-stat {
  background:linear-gradient(135deg,#f5f3ff,#ede9fe);
  border-radius:14px; padding:18px 14px;
  border:1.5px solid #ddd8f5; text-align:center;
  transition:transform .2s;
}
.g-gene-stat:hover { transform:translateY(-2px); }
.g-gene-val { font-size:20px; font-weight:800; color:var(--teal-d); font-family:'Fira Code',monospace; }
.g-gene-lbl { font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-top:5px; }

/* ── REPORT TYPE BANNER (new) ── */
.g-report-banner {
  margin: 0 18px 18px;
  padding: 14px 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
}
.g-report-banner.cma   { background:#dbeafe; border:1.5px solid #93c5fd; color:#1e40af; }
.g-report-banner.scan  { background:#d1fae5; border:1.5px solid #6ee7b7; color:#065f46; }
.g-report-banner.serum { background:#fef3c7; border:1.5px solid #fcd34d; color:#92400e; }

/* ── CHECKLIST ITEMS (non-WES display only) ── */
.g-cl-item-display {
  display:flex; align-items:flex-start; gap:12px;
  padding:12px 14px; border-radius:11px;
  background:#f8fafc; border:1.5px solid var(--border);
  transition:border-color .15s;
}
.g-cl-item-display:hover { border-color:#c4b5fd; background:#f5f3ff; }
.g-cl-item-dot {
  width:8px; height:8px; border-radius:50%;
  background:var(--teal); flex-shrink:0; margin-top:5px;
}
.g-cl-item-text { font-size:13px; font-weight:500; color:var(--slate); flex:1; }

.g-checklist-body { padding:0; }
.g-cat-wrap { border-bottom:1px solid var(--border); }
.g-cat-wrap:last-child { border-bottom:none; }
.g-cat-head {
  display:flex; align-items:center; justify-content:space-between;
  padding:14px 20px; cursor:pointer; background:#fafafa;
  font-size:14px; font-weight:700; color:var(--navy);
  transition:background .15s; gap:10px;
}
.g-cat-head:hover { background:#f5f3ff; color:var(--teal); }
.g-cat-count {
  padding:2px 9px; border-radius:999px;
  background:var(--teal-xl); color:var(--teal);
  font-size:11px; font-weight:700;
}
.g-cat-body { padding:12px 16px; display:flex; flex-direction:column; gap:8px; background:#fff; }
.g-chk-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:12px 14px; border-radius:11px;
  background:#f8fafc; border:1.5px solid var(--border); gap:12px;
  transition:border-color .15s;
}
.g-chk-row:hover { border-color:#c4b5fd; }
.g-chk-label { font-size:13px; font-weight:500; color:var(--slate); flex:1; min-width:0; }
.g-chk-opts  { display:flex; gap:16px; flex-shrink:0; }
.g-radio-wrap { display:flex; align-items:center; gap:5px; cursor:pointer; }
.g-radio-wrap input { accent-color:var(--teal); cursor:pointer; width:15px; height:15px; }
.g-radio-lbl { font-size:12px; font-weight:600; color:var(--muted); }
.g-chk-footer { padding:16px 20px; border-top:1.5px solid var(--border); background:#fafafa; }
.g-chk-hint { font-size:12px; color:var(--muted); margin-bottom:12px; }

.g-results-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; padding:18px; }
.g-result-box {
  border-radius:14px; padding:18px 12px; text-align:center;
  border:1.5px solid var(--border); background:#f8fafc;
  transition:transform .2s;
}
.g-result-box:hover { transform:translateY(-2px); }
.g-result-val {
  font-size:22px; font-weight:800; font-family:'Fira Code',monospace;
  color:var(--teal-d); animation:g-num .4s ease;
}
.g-result-val.big { font-size:30px; }
.g-result-lbl { font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-top:5px; }
.g-result-box.highlight {
  background:linear-gradient(135deg,var(--teal-d),var(--teal));
  border-color:transparent;
}
.g-result-box.highlight .g-result-val { color:#fff; }
.g-result-box.highlight .g-result-lbl { color:rgba(255,255,255,.7); }

.g-badges { display:flex; gap:8px; flex-wrap:wrap; padding:0 18px 18px; }
.g-badge {
  padding:6px 16px; border-radius:999px;
  font-size:12px; font-weight:700; display:flex; align-items:center; gap:6px;
}
.bg-green  { background:#d1fae5; color:#065f46; border:1px solid #6ee7b7; }
.bg-red    { background:#fee2e2; color:#991b1b; border:1px solid #fca5a5; }
.bg-amber  { background:#fef3c7; color:#92400e; border:1px solid #fcd34d; }
.bg-slate  { background:#f1f5f9; color:#334155; border:1px solid #cbd5e1; }

.g-score-bar-wrap { padding:0 18px 18px; }
.g-score-bar-label { display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--muted); margin-bottom:8px; }
.g-score-bar-bg { height:12px; border-radius:99px; background:#e2e8f0; overflow:hidden; }
.g-score-bar-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,var(--teal-d),var(--teal));
  transition:width 1s ease;
}

.g-summary-box { padding:16px; border-radius:13px; background:#f5f3ff; border:1.5px solid #ddd8f5; margin:0 18px 18px; }
.g-summary-head { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
.g-summary-title { font-size:12px; font-weight:800; color:var(--teal-d); text-transform:uppercase; letter-spacing:.8px; }
.g-summary-text  { font-size:13px; color:var(--slate); line-height:1.75; white-space:pre-line; }

.g-export-section { padding:18px; display:flex; flex-direction:column; gap:12px; }
.g-export-title { font-size:12px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.8px; margin-bottom:4px; }
.g-btn-export {
  width:100%; padding:13px; border:none; border-radius:12px;
  background:linear-gradient(135deg,var(--navy),var(--navy-m));
  color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:14px; font-weight:700; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:8px;
  box-shadow:0 4px 14px rgba(15,23,42,.25); transition:all .2s;
}
.g-btn-export:hover { transform:translateY(-1px); box-shadow:0 8px 22px rgba(15,23,42,.35); }
.g-btn-wa {
  width:100%; padding:13px; border:none; border-radius:12px;
  background:#25d366; color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:14px; font-weight:700; cursor:pointer;
  display:flex; align-items:center; justify-content:center; gap:8px;
  box-shadow:0 4px 14px rgba(37,211,102,.3); transition:all .2s;
}
.g-btn-wa:hover { background:#1ebe5d; transform:translateY(-1px); }
.g-phone-wrap { display:flex; gap:10px; }
.g-phone-input {
  flex:1; padding:12px 14px; border-radius:11px;
  border:1.5px solid var(--border); background:#fff;
  font-family:'Plus Jakarta Sans',sans-serif; font-size:13px; color:var(--navy);
  outline:none; transition:all .15s;
}
.g-phone-input:focus { border-color:var(--teal); box-shadow:0 0 0 3px rgba(124,58,237,.1); }
.g-phone-input::placeholder { color:#94a3b8; }
.g-btn-send {
  padding:12px 18px; border:none; border-radius:11px;
  background:#25d366; color:#fff; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:13px; font-weight:700; cursor:pointer;
  display:flex; align-items:center; gap:6px; white-space:nowrap;
  transition:all .2s;
}
.g-btn-send:hover { background:#1ebe5d; }
.g-cancel-link { text-align:center; font-size:12px; color:var(--muted); cursor:pointer; text-decoration:underline; }

.g-overlay {
  position:fixed; inset:0; z-index:9999;
  background:rgba(15,23,42,.55); backdrop-filter:blur(10px);
  display:flex; align-items:center; justify-content:center;
}
.g-loader-card {
  background:#fff; border-radius:20px; padding:36px 48px;
  text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.2);
  animation:g-pop .3s ease; max-width:340px; width:90%;
}
.g-loader-ring {
  width:56px; height:56px; border-radius:50%;
  border:5px solid #ede9fe; border-top-color:var(--teal);
  animation:g-spin .8s linear infinite;
  margin:0 auto 16px;
}
.g-loader-title { font-size:16px; font-weight:800; color:var(--navy); margin-bottom:4px; }
.g-loader-sub   { font-size:12.5px; color:var(--muted); line-height:1.6; }
.g-loader-dots  { margin-top:16px; display:flex; justify-content:center; gap:6px; }
.g-dot {
  width:8px; height:8px; border-radius:50%; background:var(--teal);
  animation:g-pulse 1.4s ease infinite;
}
.g-dot:nth-child(2) { animation-delay:.2s; }
.g-dot:nth-child(3) { animation-delay:.4s; }

/* ── PP4 NOT APPLICABLE NOTICE ── */
.g-pp4-na {
  padding: 20px;
  background: #f1f5f9;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  margin: 18px;
  text-align: center;
}
.g-pp4-na-title { font-size: 14px; font-weight: 700; color: var(--muted); margin-bottom: 6px; }
.g-pp4-na-sub   { font-size: 12px; color: var(--muted); }

@media (max-width:768px) {
  .g-sidebar { display:none!important; }
  .g-topbar  { display:none!important; }
  .g-mob-top { display:flex!important; }
  .g-main    { margin-left:0!important; }
  .g-body    { padding:12px 12px 100px; }
  .g-header  { padding:18px 16px; border-radius:14px; }
  .g-header-chips { display:none; }
  .g-steps   { padding:10px 10px; gap:0; overflow-x:auto; }
  .g-step-line { width:20px; flex-shrink:0; }
  .g-step-label { font-size:9px; }
  .g-step-circle { width:30px; height:30px; font-size:11px; }
  .g-gene-grid { grid-template-columns:1fr 1fr; gap:10px; padding:14px; }
  .g-gene-stat:nth-child(3) { grid-column:span 2; }
  .g-results-grid { grid-template-columns:1fr 1fr; gap:10px; padding:14px; }
  .g-result-box:last-child { grid-column:span 2; }
  .g-chk-row { flex-direction:column; align-items:flex-start; gap:10px; }
  .g-chk-opts { gap:14px; }
  .g-phone-wrap { flex-direction:column; }
  .g-header-left { gap:10px; }
  .g-card-body { padding:14px; }
  .g-tabs { gap:0; }
  .g-tab { font-size:11px; padding:10px 4px; }
  .g-summary-box { margin:0 14px 14px; }
  .g-badges { padding:0 14px 14px; }
  .g-score-bar-wrap { padding:0 14px 14px; }
  .g-export-section { padding:14px; }
}

@media (max-width:420px) {
  .g-step-line { width:14px; }
  .g-step-label { font-size:8px; }
  .g-tab { font-size:11px; padding:10px 4px; }
}
`;

const ALLOWED = [
  "application/pdf",
  "audio/mpeg","audio/mp3","audio/wav","audio/webm",
  "video/mp4","image/jpeg","image/png","text/plain",
];


function getBadgeClass(type, value) {
  if (type === "state") {
    const v = (value||"").toLowerCase();
    if (v.includes("true") || v.includes("pp4_true")) return "bg-green";
    if (v.includes("not")) return "bg-red";
    return "bg-slate";
  }
  if (type === "risk") {
    const v = (value||"").toLowerCase();
    if (v.includes("low"))  return "bg-green";
    if (v.includes("high")) return "bg-red";
    if (v.includes("mod"))  return "bg-amber";
    return "bg-slate";
  }
  return "bg-slate";
}

function getRiskIcon(val) {
  const v = (val||"").toLowerCase();
  if (v.includes("low"))  return <Shield size={13}/>;
  if (v.includes("high")) return <AlertTriangle size={13}/>;
  return <Activity size={13}/>;
}

/* ── CASE SELECT ── */
function CaseSelect({ cases, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q,    setQ]    = useState("");
  const ref = useRef();

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const list     = cases.filter(c =>
    c.patientName?.toLowerCase().includes(q.toLowerCase()) ||
    c.patientId?.toLowerCase().includes(q.toLowerCase())
  );
  const selected = cases.find(c => c._id === value);

  return (
    <div className="cs-wrap" ref={ref}>
      <div
        className={`cs-box${open ? " cs-open" : ""}`}
        onClick={() => { setOpen(o => !o); setQ(""); }}
      >
        <div className="cs-left">
          <User size={16} className="cs-icon"/>
          {selected ? (
            <span className="cs-text">
              {selected.patientName} &mdash; <span style={{fontFamily:"monospace",fontSize:12,color:"#64748b"}}>{selected.patientId}</span>
            </span>
          ) : (
            <span className="cs-text cs-ph">Select a patient case…</span>
          )}
        </div>
        {selected && (
          <span className={`cs-pill ${selected.status === "Under Review" ? "cs-pill-r" : "cs-pill-u"}`}>
            {selected.status === "Under Review" ? "Under Review" : "Uploaded"}
          </span>
        )}
        <ChevronDown size={16} className="cs-arrow"/>
      </div>

      {open && (
        <div className="cs-panel">
          <div className="cs-search">
            <Search size={14} className="cs-search-icon"/>
            <input
              autoFocus
              placeholder="Search name or patient ID…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <div className="cs-list">
            {list.length === 0 ? (
              <div className="cs-empty">No cases found</div>
            ) : list.map(c => (
              <div
                key={c._id}
                className={`cs-item${value === c._id ? " cs-sel" : ""}`}
                onClick={() => { onChange(c._id); setOpen(false); setQ(""); }}
              >
                <div>
                  <div className="cs-item-name">{c.patientName}</div>
                  <div className="cs-item-id">{c.patientId}</div>
                </div>
                <span className={`cs-pill ${c.status === "Under Review" ? "cs-pill-r" : "cs-pill-u"}`}>
                  {c.status === "Under Review" ? "Review" : "Uploaded"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── STEP TRACKER ── */
function StepTracker({ current }) {
  const steps = [
    { label:"Select Case",    num:1 },
    { label:"Upload Report",  num:2 },
    { label:"Checklist",      num:3 },
    { label:"PP4 Results",    num:4 },
  ];
  return (
    <div className="g-steps">
      {steps.map((s,i) => (
        <div key={i} className="g-step-item">
          <div className="g-step-node">
            <div className={`g-step-circle ${current===s.num?"active":current>s.num?"done":""}`}>
              {current > s.num ? <CheckCircle size={16}/> : s.num}
            </div>
            <span className={`g-step-label ${current===s.num?"active":current>s.num?"done":""}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length-1 && (
            <div className={`g-step-line ${current>s.num?"done":""}`}/>
          )}
        </div>
      ))}
    </div>
  );
}

export default function GeneAnalysis() {
  const [collapsed,       setCollapsed]       = useState(window.innerWidth <= 768);
  const [selectedCase,    setSelectedCase]    = useState("");
  const [cases,           setCases]           = useState([]);
  const [uploadMode,      setUploadMode]      = useState("file");
  const [file,            setFile]            = useState(null);
  const [dragActive,      setDragActive]      = useState(false);
  const [voiceText,       setVoiceText]       = useState("");
  const [submittedText,   setSubmittedText]   = useState("");
  const [audioBlob,       setAudioBlob]       = useState(null);
  const [isRecording,     setIsRecording]     = useState(false);
  const [mediaRecorder,   setMediaRecorder]   = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [geneData,        setGeneData]        = useState(null);
  const [backendChecklist,setBackendChecklist]= useState([]);
  const [checklist,       setChecklist]       = useState({});
  const [openCategory,    setOpenCategory]    = useState(0);
  const [pp4Result,       setPp4Result]       = useState(null);
  const [pp4Calculated,   setPp4Calculated]   = useState(false);
  const [animatedFinal,   setAnimatedFinal]   = useState(0);
  const [phone,           setPhone]           = useState("");
  const [showWAInput,     setShowWAInput]     = useState(false);
  const [scoreBarWidth,   setScoreBarWidth]   = useState(0);
  const [isNonWES,        setIsNonWES]        = useState(false);  // ✅ NEW
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const resetState = () => {
    setFile(null);
    setAnalysisStarted(false);
    setPp4Calculated(false);
    setPp4Result(null);
    setIsNonWES(false);
    setAnimatedFinal(0);
    setScoreBarWidth(0);
    setGeneData(null);
    setBackendChecklist([]);
    setChecklist({});
  };

  const currentStep = !selectedCase ? 1
    : !analysisStarted ? 2
    : !pp4Calculated ? 3
    : 4;

  useEffect(() => {
    const onR = () => setCollapsed(window.innerWidth <= 768);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/cases", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCases((res.data.cases||[]).filter(c=>c.status==="Uploaded"||c.status==="Under Review"));
      } catch(e) { console.error(e); }
    })();
  }, []);

  useEffect(() => {
    const found = cases.find(c=>c._id===selectedCase);
    if (found?.status==="Completed") {
      alert("This case is already completed.");
      setSelectedCase("");
    }
  }, [selectedCase, cases]);

  useEffect(() => {
    if (pp4Calculated && pp4Result?.pp4_result?.final_score) {
      const end = pp4Result.pp4_result.final_score;
      let s = 0;
      const inc = end / (600/16);
      const t = setInterval(() => {
        s += inc;
        if (s >= end) { s = end; clearInterval(t); }
        setAnimatedFinal(Number(s.toFixed(2)));
      }, 16);
      setTimeout(() => setScoreBarWidth(Math.min((end/10)*100, 100)), 300);
    }
  }, [pp4Calculated, pp4Result]);

  /* ── FILE ── */
  const handleFile = (f) => {
    if (!f) return;
    if (!selectedCase) { alert("Please select a case first."); return; }
    const ok = ALLOWED.includes(f.type) || f.name.endsWith(".pdf");
    if (!ok) { alert("Supported: PDF, MP3, WAV, MP4, WEBM, JPEG, PNG, TXT"); return; }
    if (f.size > 50*1024*1024) { alert("Max 50MB."); return; }
    setFile(f);
  };

  /* ── VOICE ── */
  const handleMic = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        let chunks = [];
        rec.ondataavailable = e => chunks.push(e.data);
        rec.onstop = () => { setAudioBlob(new Blob(chunks,{type:"audio/webm"})); chunks=[]; };
        rec.start(); setMediaRecorder(rec); setIsRecording(true);
      } catch { alert("Microphone permission denied."); }
    } else {
      mediaRecorder.stop(); setIsRecording(false);
    }
  };

  /* ── UPLOAD + ANALYZE ── */
 const handleUpload = async () => {
  if (!selectedCase) { alert("Select a case first."); return; }
  if (!file && !audioBlob && !submittedText) { alert("Please provide input."); return; }
  try {
    setLoading(true);
    const fd = new FormData();
    if (file)          fd.append("file", file, file.name);
    if (audioBlob)     fd.append("file", audioBlob, "voice.webm");
    if (submittedText) { fd.append("type","text"); fd.append("text",submittedText); }
 
    const res    = await API.post(`/gene/analyze/${selectedCase}`, fd, {
      headers: { "Content-Type":"multipart/form-data" }
    });
    const result = res.data;
    await API.put(`/cases/${selectedCase}/status`, { status:"Under Review" });
 
    const reportType = result?.report_type || "WES";
 
    // ✅ Non-WES (CMA, SCAN, SERUM)
    if (reportType !== "WES") {
      setIsNonWES(true);
      setGeneData({
        gene:             reportType + " Report",
        variant:          result?.extracted?.result_summary || "See checklist below",
        visibility_score: null,
        report_type:      reportType,
        extracted:        result?.extracted || {}
      });
      const nonWESChecklist = result?.checklist || [];
      if (Array.isArray(nonWESChecklist) && nonWESChecklist.length > 0) {
        const grouped = {};
        nonWESChecklist.forEach(item => {
          const cat = item.category || "Clinical Actions";
          if (!grouped[cat]) grouped[cat] = [];
          grouped[cat].push(item.task || String(item));
        });
        setBackendChecklist(Object.entries(grouped).map(([title, items]) => ({ title, items })));
      } else {
        setBackendChecklist([{ title:"Clinical Action Items", items:["No checklist items generated"] }]);
      }
      setChecklist({});
      setAnalysisStarted(true);
      setPp4Calculated(false);
      setPp4Result(null);
      setLoading(false);
      return;
    }
 
    // ✅ WES
    setIsNonWES(false);
    if (!result?.genetic?.gene || result.genetic.gene === "UNKNOWN" || result.warning) {
      alert(result.warning || "Gene not detected. Please check your report.");
      setLoading(false); return;
    }
    setGeneData({ ...result.genetic, report_type: "WES" });
    const clRes = await API.post(`/gene/checklist/${selectedCase}`, { gene: result.genetic.gene });
    setBackendChecklist(clRes.data.checklist);
    setGeneData(prev => ({
      ...prev,
      visibility_class:  clRes.data.metadata?.visibility_class,
      visibility_score:  clRes.data.metadata?.visibility_score,
      confidence_factor: clRes.data.metadata?.confidence_factor,
    }));
    setChecklist({});
    setAnalysisStarted(true);
    setPp4Calculated(false);
    setPp4Result(null);
  } catch(e) {
    console.error(e);
    alert(e.response?.data?.message || "Analysis failed. Please try again.");
  } finally { setLoading(false); }
};
 

  /* ── PP4 CALCULATE ── */
 const handleCalculate = async () => {
  if (pp4Calculated) { alert("Score already calculated."); return; }
 
  // ✅ Non-WES → Clinical Risk Score
  if (isNonWES) {
    try {
      // Validate that doctor filled in clinical findings
      const requiredFields = {
        "CMA": ["cnv_result", "consanguinity", "microdeletions", "roh", "cardiac_findings"],
        "SCAN": ["anomalies", "nt", "nasal_bone", "doppler", "liquor"],
        "SERUM": ["nt_result", "nasal_bone", "ductus_venosus", "tricuspid"]
      };
      
      const reportType = geneData?.report_type || "CMA";
      const required = requiredFields[reportType] || [];
      
      for (const field of required) {
         if (!checklist[field]) {
           const fieldNames = {
             "cnv_result": "CNV Result",
             "consanguinity": "Consanguinity",
             "microdeletions": "Microdeletions",
             "roh": "ROH (Regions of Homozygosity)",
             "cardiac_findings": "Cardiac Findings",
             "anomalies": "Anomalies",
             "nt": "NT Measurement",
             "nasal_bone": "Nasal Bone",
             "doppler": "Doppler",
             "liquor": "Amniotic Fluid",
             "nt_result": "NT Result",
             "ductus_venosus": "Ductus Venosus",
             "tricuspid": "Tricuspid Regurgitation"
           };
           alert(`⚠️ MISSING: Please fill in "${fieldNames[field] || field}" in the Clinical Findings section above.`);
           return;
         }
       }
      
      // Map doctor's selections to risk scorer format
      const clinicalFindings = {};
      if (reportType === "CMA") {
        clinicalFindings.cnv_result = (checklist.cnv_result || "").toLowerCase();
        clinicalFindings.consanguinity = checklist.consanguinity === "Yes" ? "yes" : "no";
        clinicalFindings.microdeletions = checklist.microdeletions === "Present" ? "detected" : "none";
        clinicalFindings.roh = checklist.roh === "Detected" ? "detected" : "none";
        clinicalFindings.cardiac_findings = checklist.cardiac_findings === "Present" ? ["cardiac finding"] : [];
      } else if (reportType === "SCAN") {
        clinicalFindings.anomalies = checklist.anomalies === "Present" ? ["anomaly"] : [];
        clinicalFindings.nt = checklist.nt === "Abnormal" ? "abnormal" : "normal";
        clinicalFindings.nasal_bone = checklist.nasal_bone ? checklist.nasal_bone.toLowerCase().replace(" ", "_") : "normal";
        clinicalFindings.doppler = checklist.doppler === "Abnormal" ? "abnormal" : "normal";
        clinicalFindings.liquor = checklist.liquor ? checklist.liquor.toLowerCase().replace(" ", "_") : "normal";
      } else if (reportType === "SERUM") {
        clinicalFindings.nt_result = checklist.nt_result === "Abnormal" ? "abnormal" : "normal";
        clinicalFindings.nasal_bone = checklist.nasal_bone ? checklist.nasal_bone.toLowerCase().replace(" ", "_") : "normal";
        clinicalFindings.ductus_venosus = checklist.ductus_venosus === "Abnormal" ? "abnormal" : "normal";
        clinicalFindings.tricuspid = checklist.tricuspid === "Present" ? "yes" : "no";
      }
      
      console.log(`[calculatePP4] Non-WES clinical findings:`, clinicalFindings);
      
      const res = await API.post(`/gene/calculate/${selectedCase}`, {
        gene:           reportType,
        gestation:      20,
        extracted_data: clinicalFindings,
        checklist:      checklist
      });
      setPp4Result(res.data);
      setPp4Calculated(true);
      await API.put(`/cases/${selectedCase}/status`, { status:"Completed" });
    } catch(e) {
      console.error("[handleCalculate] Error:", e);
      const errorMsg = e.response?.data?.message || e.response?.data?.detail || e.message;
      alert(`❌ Risk score calculation failed:\n\n${errorMsg}`);
    }
    return;
  }
 
  // ✅ WES → PP4
  const allItems = backendChecklist.filter(c=>c.items?.length).flatMap(c=>c.items);
  for (const item of allItems) {
    if (!checklist[item]) { alert("⚠️ Please answer all checklist items."); return; }
  }
  try {
    const selections = { core:{}, supportive:{}, negative:{} };
    backendChecklist.forEach(cat => {
      cat.items.forEach(item => {
        const v = checklist[item];
        if (cat.title==="Core Findings"||cat.title==="Fetal Echo Findings") selections.core[item]=v;
        else if (cat.title==="Supportive Findings") selections.supportive[item]=v;
        else if (cat.title==="Negative Findings") selections.negative[item]=v;
        else selections.core[item]=v;
      });
    });
    const res = await API.post(`/gene/calculate/${selectedCase}`, {
      gene:geneData?.gene, gestation:20, selections
    });
    setPp4Result(res.data);
    setPp4Calculated(true);
    await API.put(`/cases/${selectedCase}/status`, { status:"Completed" });
  } catch(e) { console.error(e); alert("PP4 calculation failed."); }
};
  /* ── PDF EXPORT ── */
  const handlePDF = () => {
    if (!pp4Result?.pp4_result && !isNonWES) { alert("Calculate PP4 first."); return; }
    const doc = new jsPDF({ unit:"mm", format:"a4" });
    const W = 210; const H = 297;
    const ml = 20; const mr = W-20; const cw = mr-ml;

    doc.setFillColor(15,23,42);
    doc.rect(0,0,W,50,"F");
    doc.setFillColor(124,58,237);
    doc.rect(0,50,W,4,"F");
    doc.setTextColor(255,255,255);
    doc.setFontSize(22); doc.setFont("helvetica","bold");
    doc.text("Prenatal AI — Clinical Analysis Report",ml,22);
    doc.setFontSize(10); doc.setFont("helvetica","normal");
    doc.setTextColor(180,220,215);
    doc.text(`Generated: ${new Date().toLocaleString()}`,ml,32);
    doc.text("CONFIDENTIAL — For authorised medical personnel only",ml,40);

    let y = 62;

    const caseInfo = cases.find(c=>c._id===selectedCase);
    doc.setFillColor(245,243,255);
    doc.roundedRect(ml,y,cw,34,4,4,"F");
    doc.setDrawColor(196,181,253); doc.setLineWidth(0.5);
    doc.roundedRect(ml,y,cw,34,4,4,"D");
    doc.setTextColor(15,23,42);
    doc.setFontSize(11); doc.setFont("helvetica","bold");
    doc.text("Patient & Case Information",ml+6,y+8);
    doc.setFontSize(9.5); doc.setFont("helvetica","normal");
    const col1x = ml+6; const col2x = ml+cw/2+4;
    doc.setTextColor(51,65,85);
    doc.text(`Patient Name:`,col1x,y+16);
    doc.setFont("helvetica","bold"); doc.text(caseInfo?.patientName||"N/A",col1x+30,y+16);
    doc.setFont("helvetica","normal");
    doc.text(`Patient ID:`,col1x,y+23);
    doc.setFont("helvetica","bold"); doc.text(caseInfo?.patientId||"N/A",col1x+30,y+23);
    doc.setFont("helvetica","normal");
    doc.text(`Report Type:`,col2x,y+16);
    doc.setFont("helvetica","bold"); doc.setTextColor(124,58,237);
    doc.text(geneData?.report_type||"WES",col2x+28,y+16);
    doc.setFont("helvetica","normal"); doc.setTextColor(51,65,85);
    doc.text(`Date:`,col2x,y+23);
    doc.setFont("helvetica","bold"); doc.text(new Date().toLocaleDateString(),col2x+14,y+23);

    y += 42;

    // Checklist summary for non-WES
    if (isNonWES) {
      doc.setFillColor(15,23,42);
      doc.roundedRect(ml,y,cw,8,2,2,"F");
      doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
      doc.text("📋  Clinical Action Checklist",ml+5,y+5.5);
      y += 12;

      backendChecklist.forEach(cat => {
        doc.setFontSize(9.5); doc.setFont("helvetica","bold"); doc.setTextColor(76,29,149);
        doc.text(cat.title, ml+5, y);
        y += 6;
        (cat.items||[]).forEach(item => {
          const lines = doc.splitTextToSize(`• ${item}`, cw-10);
          doc.setFontSize(9); doc.setFont("helvetica","normal"); doc.setTextColor(51,65,85);
          doc.text(lines, ml+8, y);
          y += lines.length * 5 + 2;
          if (y > H-30) { doc.addPage(); y = 20; }
        });
        y += 4;
      });
    } else if (pp4Result?.pp4_result) {
      // PP4 scores for WES
      doc.setFillColor(15,23,42);
      doc.roundedRect(ml,y,cw,8,2,2,"F");
      doc.setFontSize(10); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255);
      doc.text("📊  PP4 Scoring Results",ml+5,y+5.5);
      y += 12;

      const bw = (cw-8)/3;
      const scoreBoxes = [
        { label:"Raw Score",     val:String(pp4Result.pp4_result.raw_score??"-"),  accent:false },
        { label:"Multiplier",    val:`×${pp4Result.pp4_result.multiplier??"-"}`,   accent:false },
        { label:"Final PP4",     val:String(animatedFinal),                        accent:true  },
      ];
      scoreBoxes.forEach((b,i) => {
        const bx = ml + i*(bw+4);
        if (b.accent) { doc.setFillColor(124,58,237); doc.setTextColor(255,255,255); }
        else          { doc.setFillColor(245,243,255); doc.setTextColor(15,23,42); }
        doc.roundedRect(bx,y,bw,22,3,3,"F");
        doc.setFontSize(18); doc.setFont("helvetica","bold");
        doc.text(b.val, bx+bw/2, y+13, { align:"center" });
        doc.setFontSize(7.5); doc.setFont("helvetica","normal");
        if (!b.accent) doc.setTextColor(100,116,139); else doc.setTextColor(204,251,241);
        doc.text(b.label.toUpperCase(), bx+bw/2, y+19, { align:"center" });
      });
      y += 28;

      // Clinical summary
      if (pp4Result.summaries?.doctor_summary) {
        y += 8;
        doc.setFillColor(248,250,252);
        const summaryText = pp4Result.summaries.doctor_summary;
        const lines = doc.splitTextToSize(summaryText, cw-10);
        const boxH = Math.max(lines.length*5+10, 20);
        doc.roundedRect(ml,y,cw,boxH,3,3,"F");
        doc.setDrawColor(226,232,240); doc.roundedRect(ml,y,cw,boxH,3,3,"D");
        doc.setFontSize(9.5); doc.setFont("helvetica","normal"); doc.setTextColor(51,65,85);
        doc.text(lines,ml+5,y+8);
        y += boxH+10;
      }
    }

    // Disclaimer
    if (y > H-40) { doc.addPage(); y = 20; }
    doc.setFillColor(255,251,235); doc.roundedRect(ml,y,cw,18,3,3,"F");
    doc.setDrawColor(253,230,138); doc.roundedRect(ml,y,cw,18,3,3,"D");
    doc.setFontSize(8.5); doc.setFont("helvetica","bold"); doc.setTextColor(146,64,14);
    doc.text("⚠  Clinical Disclaimer",ml+5,y+7);
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(161,98,7);
    const disc = doc.splitTextToSize("PP4 scores provide decision support only and do not replace clinical judgement. All findings must be verified by a qualified medical professional before any clinical decisions are made.", cw-10);
    doc.text(disc,ml+5,y+13);

    // Footer
    doc.setFillColor(15,23,42);
    doc.rect(0,H-16,W,16,"F");
    doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(148,163,184);
    doc.text("Prenatal AI — Confidential Medical Report",ml,H-7);
    doc.text(`Page 1  •  ${new Date().toLocaleDateString()}`,mr,H-7,{align:"right"});

    doc.save(`Report_${caseInfo?.patientId||"patient"}_${Date.now()}.pdf`);
  };

  /* ── WHATSAPP ── */
  const handleWA = () => {
    if (!phone) { alert("Enter WhatsApp number."); return; }
    const clean = phone.replace(/\D/g,"");
    if (clean.length < 10) { alert("Enter valid number with country code."); return; }
    const c = cases.find(c=>c._id===selectedCase);
    const msg = isNonWES
      ? `🏥 *Prenatal AI — ${geneData?.report_type} Report*\n\n👤 *Patient:* ${c?.patientName||"-"}\n🆔 *Case ID:* ${c?.patientId||"-"}\n📅 *Date:* ${new Date().toLocaleDateString()}\n\n📋 *Report Type:* ${geneData?.report_type}\n📝 *Summary:* ${geneData?.extracted?.result_summary||"-"}\n\n_Report generated by Prenatal AI. All findings must be verified by a qualified medical professional._`
      : `🏥 *Prenatal AI — PP4 Report*\n\n👤 *Patient:* ${c?.patientName||"-"}\n🆔 *Case ID:* ${c?.patientId||"-"}\n📅 *Date:* ${new Date().toLocaleDateString()}\n\n🧬 *Gene:* ${geneData?.gene||"-"}\n📊 *PP4 Score:* ${animatedFinal}\n⚠️ *Risk:* ${pp4Result?.summaries?.risk_level||"-"}\n\n📋 *Summary:*\n${pp4Result?.summaries?.doctor_summary||"-"}\n\n_Report generated by Prenatal AI._`;

    window.open(`https://wa.me/${clean}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const canStart = selectedCase && (file || audioBlob || submittedText);
  const MODES = [
    { id:"file",  icon:<UploadCloud size={14}/>, label:"Document" },
    { id:"voice", icon:<Mic size={14}/>,          label:"Voice" },
    { id:"text",  icon:<MessageSquare size={14}/>, label:"Text" },
  ];

  /* ── REPORT TYPE LABEL ── */
  const reportTypeLabel = {
    CMA:   "Chromosomal Microarray Analysis",
    SCAN:  "Ultrasound Scan Report",
    SERUM: "Maternal Serum Screening",
    WES:   "Whole Exome Sequencing"
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="g-root" style={{ display:"flex" }}>

        <div className="g-sidebar">
          <Sidebar collapsed={collapsed} toggle={() => setCollapsed(c=>!c)}/>
        </div>

        <div className="g-main" style={{
          marginLeft: collapsed ? "72px" : "240px",
          transition: "margin-left .3s cubic-bezier(.4,0,.2,1)",
          flex:1,
          ...(window.innerWidth <= 768 ? { marginLeft: 0 } : {})
        }}>
          <div className="g-topbar"><Topbar/></div>

          <div className="g-mob-top">
            <div className="g-mob-logo">
              <div className="g-mob-logo-ico"><Dna size={18}/></div>
              <div>
                <div className="g-mob-logo-name">Gene Analysis</div>
                <div className="g-mob-logo-sub">Prenatal AI</div>
              </div>
            </div>
            <div className="g-mob-avatar" onClick={() => navigate("/profile")}>
              <User size={16}/>
            </div>
          </div>

          <div className="g-body">

            <div className="g-disc">
              <AlertTriangle size={15} color="#d97706" style={{ flexShrink:0, marginTop:2 }}/>
              <div>
                <div className="g-disc-title">Clinical Disclaimer</div>
                <div className="g-disc-body">
                  PP4 scores provide decision support only and do not modify ACMG classifications.
                  All findings must be verified by a qualified medical professional before clinical decisions.
                </div>
              </div>
            </div>

            <StepTracker current={currentStep}/>

            {/* ── STEP 1: SELECT CASE ── */}
            <div className="g-card" style={{ marginBottom:18 }}>
              <div className="g-card-head">
                <div className="g-card-ico"><User size={16}/></div>
                <div>
                  <div className="g-card-title">Step 1 — Select Patient Case</div>
                  <div className="g-card-sub">Search and choose the patient you want to analyse</div>
                </div>
                {selectedCase && <CheckCircle size={18} color="var(--green)" style={{ marginLeft:"auto" }}/>}
              </div>
              <div className="g-card-body" style={{overflow:"visible"}}>
                <CaseSelect cases={cases} value={selectedCase} onChange={setSelectedCase}/>
              </div>
            </div>

            {/* ── STEP 2: INPUT ── */}
            <div className="g-card" style={{ marginBottom: analysisStarted ? 18 : 0 }}>
              <div className="g-card-head">
                <div className="g-card-ico"><UploadCloud size={16}/></div>
                <div>
                  <div className="g-card-title">Step 2 — Provide Genetic Report</div>
                  <div className="g-card-sub">Upload a document, record voice, or type findings</div>
                </div>
                {analysisStarted && <CheckCircle size={18} color="var(--green)" style={{ marginLeft:"auto" }}/>}
              </div>
              <div className="g-card-body">

                <div className="g-tabs">
                  {MODES.map(m => (
                    <button key={m.id}
                      className={`g-tab${uploadMode===m.id?" active":""}`}
                      onClick={() => setUploadMode(m.id)}>
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>

                {uploadMode==="file" && (
                  <>
                    {!file ? (
                      <div
                        className={`g-drop${dragActive?" drag":""}`}
                        onDragEnter={() => setDragActive(true)}
                        onDragLeave={() => setDragActive(false)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="g-drop-ico"><UploadCloud size={28}/></div>
                        <div className="g-drop-title">Drag & drop your genetic report here</div>
                        <div className="g-drop-sub">or click to browse — max 50MB</div>
                        <div className="g-drop-pills">
                          {["PDF","MP3","WAV","MP4","JPG","PNG","TXT"].map(t => (
                            <span key={t} className="g-pill">.{t.toLowerCase()}</span>
                          ))}
                        </div>
                        <input
                          ref={fileInputRef} type="file" hidden
                          accept=".pdf,.mp3,.wav,.mp4,.webm,.jpg,.jpeg,.png,.txt,application/pdf,audio/*,video/*,image/*,text/*"
                          onChange={e => handleFile(e.target.files[0])}
                        />
                      </div>
                    ) : (
                      <div className="g-file-prev">
                        <div className="g-file-prev-ico"><FileText size={20}/></div>
                        <div>
                          <div className="g-file-name">{file.name}</div>
                          <div className="g-file-size">{(file.size/1024).toFixed(1)} KB · {file.type||"document"}</div>
                        </div>
                        <button className="g-file-rm" onClick={() => { setFile(null); setAnalysisStarted(false); setPp4Calculated(false); setPp4Result(null); setIsNonWES(false); }}>
                          <X size={14}/>
                        </button>
                      </div>
                    )}
                  </>
                )}

                {uploadMode==="voice" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                    <div className="g-mic-zone">
                      <button className={`g-mic-btn${isRecording?" rec":""}`} onClick={handleMic}>
                        {isRecording ? <MicOff size={28}/> : <Mic size={28}/>}
                      </button>
                      <div className="g-mic-label">
                        {isRecording ? "Recording… tap to stop" : audioBlob ? "Recording captured ✓" : "Tap to start recording"}
                      </div>
                      <div className="g-mic-sub">
                        {isRecording ? "🔴 Live recording" : "Speak your clinical findings clearly"}
                      </div>
                    </div>
                    {audioBlob && (
                      <div className="g-audio-prev">
                        <div className="g-audio-top">
                          <Mic size={16} color="var(--teal)"/>
                          <div>
                            <div className="g-file-name">voice_recording.webm</div>
                            <div className="g-file-size">{(audioBlob.size/1024).toFixed(1)} KB</div>
                          </div>
                          <button className="g-audio-rm" onClick={() => setAudioBlob(null)}>
                            <X size={13}/>
                          </button>
                        </div>
                        <audio controls src={URL.createObjectURL(audioBlob)}/>
                      </div>
                    )}
                  </div>
                )}

                {uploadMode==="text" && (
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <textarea
                      className="g-textarea"
                      placeholder="Type clinical findings here… e.g. Gene: CHD7, Variant: c.2234G>A…"
                      value={voiceText}
                      onChange={e => { setVoiceText(e.target.value); setSubmittedText(""); }}
                      rows={5}
                    />
                    {voiceText.trim() && (
                      <div style={{ display:"flex", justifyContent:"flex-end" }}>
                        <button className="g-btn-primary" style={{ padding:"10px 20px", fontSize:13 }}
                          onClick={() => { setSubmittedText(voiceText.trim()); setVoiceText(""); }}>
                          <Send size={13}/> Submit Text
                        </button>
                      </div>
                    )}
                    {submittedText && (
                      <div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:11, fontWeight:800, color:"var(--teal)", textTransform:"uppercase", letterSpacing:".7px" }}>
                            ✓ Text Submitted
                          </span>
                          <button onClick={() => setSubmittedText("")}
                            style={{ background:"none", border:"none", color:"var(--red)", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
                            <X size={12}/> Clear
                          </button>
                        </div>
                        <div className="g-text-preview">{submittedText}</div>
                      </div>
                    )}
                  </div>
                )}

                <button className="g-start-btn" disabled={!canStart||loading} onClick={handleUpload}>
                  {loading
                    ? <><Loader size={18} className="g-spin"/> Analysing report…</>
                    : <><Zap size={18}/> Start Analysis</>
                  }
                </button>
              </div>
            </div>

            {/* ── STEP 3 & 4: ANALYSIS RESULTS ── */}
            {analysisStarted && (
              <div className="g-analysis">

                {/* Gene / Report Overview */}
                <div className="g-card">
                  <div className="g-card-head">
                    <div className="g-card-ico"><Dna size={16}/></div>
                    <div>
                      <div className="g-card-title">
                        {isNonWES ? "Step 3 — Report Overview" : "Step 3 — Gene Overview"}
                      </div>
                      <div className="g-card-sub">
                        {isNonWES
                          ? `${reportTypeLabel[geneData?.report_type] || geneData?.report_type} detected`
                          : "Detected genetic identifiers from your report"
                        }
                      </div>
                    </div>
                    <CheckCircle size={18} color="var(--green)" style={{ marginLeft:"auto" }}/>
                  </div>

                  {/* ✅ Non-WES report type banner */}
                  {isNonWES && (
                    <div className={`g-report-banner ${(geneData?.report_type||"").toLowerCase()}`}>
                      <Info size={16}/>
                      <div>
                        <strong>{reportTypeLabel[geneData?.report_type] || geneData?.report_type}</strong>
                        {" — "}
                        {geneData?.extracted?.result_summary || "Report processed successfully"}
                      </div>
                    </div>
                  )}

                  <div className="g-gene-grid">
                    <div className="g-gene-stat">
                      <div className="g-gene-val" style={{
                        fontSize: isNonWES ? "16px" : "20px",
                        wordBreak: "break-word"
                      }}>
                        {isNonWES
                          ? (geneData?.report_type || "—")
                          : (geneData?.gene || "—")
                        }
                      </div>
                      <div className="g-gene-lbl">
                        {isNonWES ? "Report Type" : "Gene Name"}
                      </div>
                    </div>

                    <div className="g-gene-stat">
                      <div className="g-gene-val" style={{fontSize:"12px", wordBreak:"break-all"}}>
                        {isNonWES
                          ? (geneData?.extracted?.cnv_result ||
                             geneData?.extracted?.scan_type  ||
                             geneData?.extracted?.screen_type || "—")
                          : (geneData?.variant || "—")
                        }
                      </div>
                      <div className="g-gene-lbl">
                        {isNonWES ? "Result" : "Variant"}
                      </div>
                    </div>

                    <div className="g-gene-stat">
                      <div className="g-gene-val">
                        {isNonWES
                          ? "N/A"
                          : geneData?.visibility_score
                            ? `${Math.round(geneData.visibility_score*100)}%`
                            : "—"
                        }
                      </div>
                      <div className="g-gene-lbl">Visibility Score</div>
                    </div>
                  </div>
                </div>

                {/* Targeted Checklist */}
                <div className="g-card">
                  <div className="g-card-head">
                    <div className="g-card-ico"><ClipboardList size={16}/></div>
                    <div>
                      <div className="g-card-title">
                        {isNonWES ? "Step 3 — Clinical Action Checklist" : "Step 3 — Targeted Checklist"}
                      </div>
                      <div className="g-card-sub">
                        {isNonWES
                          ? "AI-generated clinical actions based on report findings"
                          : "Answer all items to enable PP4 calculation"
                        }
                      </div>
                    </div>
                    {pp4Calculated && <CheckCircle size={18} color="var(--green)" style={{ marginLeft:"auto" }}/>}
                  </div>

                  <div className="g-checklist-body">
                    {/* ✅ Non-WES: Clinical Findings Assessment */}
                    {isNonWES && (
                      <div className="g-cat-wrap">
                        <div className="g-cat-head">
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span style={{ fontWeight:700, color:"var(--navy)" }}>📋 Clinical Findings Assessment</span>
                            <span className="g-cat-count">Required for Risk Score</span>
                          </div>
                        </div>
                        <div className="g-cat-body">
                          {geneData?.report_type === "CMA" && (
                            <>
                              <div className="g-chk-row">
                                <span className="g-chk-label">CNV Result</span>
                                <div className="g-chk-opts">
                                  {["Normal","Abnormal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="cnv_result" value={opt}
                                        checked={checklist.cnv_result===opt}
                                        onChange={() => setChecklist(prev => ({...prev, cnv_result:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Consanguinity</span>
                                <div className="g-chk-opts">
                                  {["Yes","No","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="consanguinity" value={opt}
                                        checked={checklist.consanguinity===opt}
                                        onChange={() => setChecklist(prev => ({...prev, consanguinity:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Microdeletions</span>
                                <div className="g-chk-opts">
                                  {["Present","Not Present","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="microdeletions" value={opt}
                                        checked={checklist.microdeletions===opt}
                                        onChange={() => setChecklist(prev => ({...prev, microdeletions:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">ROH (Regions of Homozygosity)</span>
                                <div className="g-chk-opts">
                                  {["Detected","Not Detected","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="roh" value={opt}
                                        checked={checklist.roh===opt}
                                        onChange={() => setChecklist(prev => ({...prev, roh:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Cardiac Findings</span>
                                <div className="g-chk-opts">
                                  {["Present","Not Present","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="cardiac_findings" value={opt}
                                        checked={checklist.cardiac_findings===opt}
                                        onChange={() => setChecklist(prev => ({...prev, cardiac_findings:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                          {geneData?.report_type === "SCAN" && (
                            <>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Anomalies Detected</span>
                                <div className="g-chk-opts">
                                  {["Present","Not Present","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="anomalies" value={opt}
                                        checked={checklist.anomalies===opt}
                                        onChange={() => setChecklist(prev => ({...prev, anomalies:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">NT Measurement</span>
                                <div className="g-chk-opts">
                                  {["Abnormal","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="nt" value={opt}
                                        checked={checklist.nt===opt}
                                        onChange={() => setChecklist(prev => ({...prev, nt:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Nasal Bone</span>
                                <div className="g-chk-opts">
                                  {["Absent","Hypoplastic","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="nasal_bone" value={opt}
                                        checked={checklist.nasal_bone===opt}
                                        onChange={() => setChecklist(prev => ({...prev, nasal_bone:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Doppler Assessment</span>
                                <div className="g-chk-opts">
                                  {["Abnormal","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="doppler" value={opt}
                                        checked={checklist.doppler===opt}
                                        onChange={() => setChecklist(prev => ({...prev, doppler:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Amniotic Fluid</span>
                                <div className="g-chk-opts">
                                  {["Reduced","Increased","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="liquor" value={opt}
                                        checked={checklist.liquor===opt}
                                        onChange={() => setChecklist(prev => ({...prev, liquor:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                          {geneData?.report_type === "SERUM" && (
                            <>
                              <div className="g-chk-row">
                                <span className="g-chk-label">NT Result</span>
                                <div className="g-chk-opts">
                                  {["Abnormal","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="nt_result" value={opt}
                                        checked={checklist.nt_result===opt}
                                        onChange={() => setChecklist(prev => ({...prev, nt_result:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Nasal Bone</span>
                                <div className="g-chk-opts">
                                  {["Absent","Hypoplastic","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="nasal_bone" value={opt}
                                        checked={checklist.nasal_bone===opt}
                                        onChange={() => setChecklist(prev => ({...prev, nasal_bone:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Ductus Venosus</span>
                                <div className="g-chk-opts">
                                  {["Abnormal","Normal","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="ductus_venosus" value={opt}
                                        checked={checklist.ductus_venosus===opt}
                                        onChange={() => setChecklist(prev => ({...prev, ductus_venosus:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                              <div className="g-chk-row">
                                <span className="g-chk-label">Tricuspid Regurgitation</span>
                                <div className="g-chk-opts">
                                  {["Present","Not Present","Unknown"].map(opt => (
                                    <label key={opt} className="g-radio-wrap">
                                      <input type="radio" name="tricuspid" value={opt}
                                        checked={checklist.tricuspid===opt}
                                        onChange={() => setChecklist(prev => ({...prev, tricuspid:opt}))}
                                      />
                                      <span className="g-radio-lbl">{opt}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Original Action Checklist */}
                    {backendChecklist.filter(c=>c.items?.length).map((cat,ci) => (
                      <div key={ci} className="g-cat-wrap">
                        <div className="g-cat-head" onClick={() => setOpenCategory(openCategory===ci?null:ci)}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <span>{cat.title}</span>
                            <span className="g-cat-count">{cat.items.length} items</span>
                          </div>
                          {openCategory===ci ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        </div>

                        {openCategory===ci && (
                          <div className="g-cat-body">
                            {/* ✅ Non-WES: display-only items (no radio buttons) */}
                            {isNonWES ? (
                              cat.items.map((item,ii) => (
                                <div key={ii} className="g-cl-item-display">
                                  <div className="g-cl-item-dot"/>
                                  <span className="g-cl-item-text">{item}</span>
                                </div>
                              ))
                            ) : (
                              /* WES: radio button items */
                              cat.items.map((item,ii) => (
                                <div key={ii} className="g-chk-row">
                                  <span className="g-chk-label">{item}</span>
                                  <div className="g-chk-opts">
                                    {["Present","Absent","N/A"].map(opt => (
                                      <label key={opt} className="g-radio-wrap">
                                        <input type="radio" name={item} value={opt}
                                          checked={checklist[item]===opt}
                                          onChange={() => setChecklist(prev => ({...prev,[item]:opt}))}
                                        />
                                        <span className="g-radio-lbl">{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="g-chk-footer">
                      {isNonWES ? (
                        /* ✅ Non-WES: show Calculate Clinical Risk Score button */
                        <>
                          <div className="g-chk-hint">
                            Clinical risk scoring based on extracted findings from {geneData?.report_type} report.
                          </div>
                          <button className="g-btn-primary" style={{ width:"100%" }}
                            onClick={handleCalculate} disabled={pp4Calculated}>
                            {pp4Calculated
                              ? <><CheckCircle size={16}/> Risk Score Calculated Successfully</>
                              : <><TrendingUp size={16}/> Calculate Clinical Risk Score</>
                            }
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="g-chk-hint">
                            Ensure all checklist items are answered across all categories before calculating the PP4 score.
                          </div>
                          <button className="g-btn-primary" style={{ width:"100%" }}
                            onClick={handleCalculate} disabled={pp4Calculated}>
                            {pp4Calculated
                              ? <><CheckCircle size={16}/> PP4 Calculated Successfully</>
                              : <><TrendingUp size={16}/> Calculate PP4 Score</>
                            }
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* PP4 Results — WES only */}
                {pp4Calculated && !isNonWES && (
                  <div className="g-card" style={{ animation:"g-pop .4s ease" }}>
                    <div className="g-card-head">
                      <div className="g-card-ico"><BarChart2 size={16}/></div>
                      <div>
                        <div className="g-card-title">Step 4 — PP4 Results</div>
                        <div className="g-card-sub">Pathogenicity probability scoring results</div>
                      </div>
                      <CheckCircle size={18} color="var(--green)" style={{ marginLeft:"auto" }}/>
                    </div>

                    <div className="g-results-grid">
                      <div className="g-result-box">
                        <div className="g-result-val">{pp4Result?.pp4_result?.raw_score??"-"}</div>
                        <div className="g-result-lbl">Raw Score</div>
                      </div>
                      <div className="g-result-box">
                        <div className="g-result-val">×{pp4Result?.pp4_result?.multiplier??"-"}</div>
                        <div className="g-result-lbl">Multiplier</div>
                      </div>
                      <div className="g-result-box highlight">
                        <div className="g-result-val big">{animatedFinal}</div>
                        <div className="g-result-lbl">Final PP4</div>
                      </div>
                    </div>

                    <div className="g-score-bar-wrap">
                      <div className="g-score-bar-label">
                        <span>0 — Low Risk</span>
                        <span>5 — Moderate</span>
                        <span>10 — High Risk</span>
                      </div>
                      <div className="g-score-bar-bg">
                        <div className="g-score-bar-fill" style={{ width:`${scoreBarWidth}%` }}/>
                      </div>
                    </div>

                    <div className="g-badges">
                      <span className={`g-badge ${getBadgeClass("state",pp4Result?.pp4_result?.state)}`}>
                        <Activity size={12}/>
                        {pp4Result?.pp4_result?.state?.replace(/_/g," ")||"-"}
                      </span>
                      <span className={`g-badge ${getBadgeClass("risk",pp4Result?.summaries?.risk_level)}`}>
                        {getRiskIcon(pp4Result?.summaries?.risk_level)}
                        {pp4Result?.summaries?.risk_level||"-"}
                      </span>
                    </div>

                    <div className="g-summary-box">
                      <div className="g-summary-head">
                        <Heart size={14} color="var(--teal-d)"/>
                        <div className="g-summary-title">Clinical Summary</div>
                      </div>
                      <div className="g-summary-text">
                        {pp4Result?.summaries?.doctor_summary||"No summary available."}
                      </div>
                    </div>

                    <div className="g-export-section">
                      <div className="g-export-title">Export & Share Report</div>
                      <button className="g-btn-export" onClick={handlePDF}>
                        <Download size={16}/> Download Professional PDF Report
                      </button>
                      {!showWAInput ? (
                        <button className="g-btn-wa" onClick={() => setShowWAInput(true)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Share Report via WhatsApp
                        </button>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:"var(--slate)" }}>
                            Enter patient's WhatsApp number (with country code):
                          </div>
                          <div className="g-phone-wrap">
                            <input
                              className="g-phone-input"
                              placeholder="e.g. 919876543210"
                              value={phone} onChange={e => setPhone(e.target.value)}
                            />
                            <button className="g-btn-send" onClick={handleWA}>
                              <Send size={14}/> Send
                            </button>
                          </div>
                          <div className="g-cancel-link" onClick={() => setShowWAInput(false)}>Cancel</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ✅ Clinical Risk Score Results — Non-WES */}
                {pp4Calculated && isNonWES && (
                  <div className="g-card" style={{ animation:"g-pop .4s ease" }}>
                    <div className="g-card-head">
                      <div className="g-card-ico"><BarChart2 size={16}/></div>
                      <div>
                        <div className="g-card-title">Step 4 — Clinical Risk Score</div>
                        <div className="g-card-sub">Clinical risk assessment based on {geneData?.report_type} findings</div>
                      </div>
                      <CheckCircle size={18} color="var(--green)" style={{ marginLeft:"auto" }}/>
                    </div>

                    <div className="g-results-grid">
                      <div className="g-result-box">
                        <div className="g-result-val">{pp4Result?.pp4_result?.raw_score??"-"}</div>
                        <div className="g-result-lbl">Raw Score</div>
                      </div>
                      <div className="g-result-box">
                        <div className="g-result-val">×{pp4Result?.pp4_result?.multiplier??1}</div>
                        <div className="g-result-lbl">Multiplier</div>
                      </div>
                      <div className="g-result-box highlight">
                        <div className="g-result-val big">{animatedFinal}</div>
                        <div className="g-result-lbl">Final Risk Score</div>
                      </div>
                    </div>

                    <div className="g-score-bar-wrap">
                      <div className="g-score-bar-label">
                        <span>0 — Low</span>
                        <span>5 — Moderate</span>
                        <span>10 — High</span>
                      </div>
                      <div className="g-score-bar-bg">
                        <div className="g-score-bar-fill" style={{ width:`${scoreBarWidth}%` }}/>
                      </div>
                    </div>

                    <div className="g-badges">
                      <span className={`g-badge ${getBadgeClass("state",pp4Result?.pp4_result?.score_type)}`}>
                        <Activity size={12}/>
                        {pp4Result?.pp4_result?.score_type?.replace(/_/g," ")||"Clinical Score"}
                      </span>
                      <span className={`g-badge ${getBadgeClass("risk",pp4Result?.summaries?.risk_level)}`}>
                        {getRiskIcon(pp4Result?.summaries?.risk_level)}
                        {pp4Result?.summaries?.risk_level||"-"}
                      </span>
                    </div>

                    <div className="g-summary-box">
                      <div className="g-summary-head">
                        <Heart size={14} color="var(--teal-d)"/>
                        <div className="g-summary-title">Clinical Summary</div>
                      </div>
                      <div className="g-summary-text">
                        {pp4Result?.summaries?.doctor_summary||"No summary available."}
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Non-WES Export Section */}
                {isNonWES && (
                  <div className="g-card" style={{ animation:"g-pop .4s ease" }}>
                    <div className="g-card-head">
                      <div className="g-card-ico"><Download size={16}/></div>
                      <div>
                        <div className="g-card-title">Export Report</div>
                        <div className="g-card-sub">Download or share the clinical action checklist</div>
                      </div>
                    </div>
                    <div className="g-export-section">
                      <button className="g-btn-export" onClick={handlePDF}>
                        <Download size={16}/> Download Clinical Report PDF
                      </button>
                      {!showWAInput ? (
                        <button className="g-btn-wa" onClick={() => setShowWAInput(true)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Share via WhatsApp
                        </button>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                          <div className="g-phone-wrap">
                            <input
                              className="g-phone-input"
                              placeholder="e.g. 919876543210"
                              value={phone} onChange={e => setPhone(e.target.value)}
                            />
                            <button className="g-btn-send" onClick={handleWA}>
                              <Send size={14}/> Send
                            </button>
                          </div>
                          <div className="g-cancel-link" onClick={() => setShowWAInput(false)}>Cancel</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          <MobileBottomBar/>
        </div>
      </div>

      {loading && (
        <div className="g-overlay">
          <div className="g-loader-card">
            <div className="g-loader-ring"/>
            <div className="g-loader-title">Analysing report…</div>
            <div className="g-loader-sub">Our AI is processing your document and detecting clinical markers</div>
            <div className="g-loader-dots">
              <div className="g-dot"/>
              <div className="g-dot"/>
              <div className="g-dot"/>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
