import { useState, useEffect, useRef } from "react";
import Sidebar from "../../components/doctor/Sidebar";
import Topbar from "../../components/doctor/Topbar";
import MobileBottomBar from "../../components/doctor/MobileBottomBar";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

import {
  User, Mail, Phone, Building2, Camera, Save, X,
  Pencil, Stethoscope, GraduationCap, MapPin, Globe,
  Calendar, Award, Shield, Clock, ChevronRight, CheckCircle,
  ChevronLeft, Edit3, LogOut,
} from "lucide-react";

// Helper function to get base URL for uploads
const getBaseUrl = () => {
  const apiBase = import.meta.env.VITE_API_BASE_URL || (process.env.NODE_ENV === 'production'
    ? "https://parental-ai-backend.onrender.com/api"
    : "http://localhost:3000/api");
  return apiBase.replace('/api', '');
};

/* ─── Inject CSS once ─── */
const STYLE_ID = "profile-styles-v3";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Instrument+Serif:ital@0;1&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');

@keyframes fadeUp    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
@keyframes toastIn   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulseRing { 0%,100%{box-shadow:0 0 0 0 rgba(109,90,205,.45)} 70%{box-shadow:0 0 0 9px rgba(109,90,205,0)} }

/* ── ROOT LAYOUT ── */
.pf-root { display:flex; min-height:100vh; background:#f3f1fa; font-family:'DM Sans',sans-serif; }

.pf-sidebar-slot { flex:0 0 256px; width:256px; transition:width .25s,flex-basis .25s; position:relative; z-index:50; }
.pf-sidebar-slot.collapsed { flex-basis:80px; width:80px; }

.pf-main { flex:1 1 0%; min-width:0; display:flex; flex-direction:column; overflow:hidden; }

.pf-body { flex:1 1 auto; overflow-y:auto; padding:28px 30px 60px; animation:fadeUp .45s ease; }

/* ══ HERO BANNER ══ */
.pf-hero {
  position:relative; border-radius:24px;
  background:linear-gradient(130deg,#3b2a8e 0%,#6d5acd 50%,#9f87f5 100%);
  padding:32px 36px 30px; box-shadow:0 18px 48px rgba(109,90,205,.32);
  overflow:hidden; margin-bottom:20px;
}
.pf-hero-dots { position:absolute; inset:0; background-image:radial-gradient(rgba(255,255,255,.11) 1.5px,transparent 1.5px); background-size:20px 20px; pointer-events:none; }
.pf-hero-glow { position:absolute; top:-60px; right:-60px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,.12) 0%,transparent 70%); pointer-events:none; }

.pf-edit-btn {
  position:absolute; top:20px; right:22px;
  display:inline-flex; align-items:center; gap:7px;
  padding:8px 18px; border-radius:11px;
  background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.32);
  color:#fff; font-size:13px; font-weight:600; cursor:pointer;
  backdrop-filter:blur(8px); transition:all .18s; font-family:'DM Sans',sans-serif; z-index:2;
}
.pf-edit-btn:hover { background:rgba(255,255,255,.28); transform:translateY(-1px); }

.pf-hero-inner { position:relative; z-index:1; display:flex; align-items:center; gap:26px; }
.pf-avatar-wrap { position:relative; flex-shrink:0; }
.pf-avatar-ring { width:100px; height:100px; border-radius:50%; padding:3px; background:linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,.2)); box-shadow:0 6px 24px rgba(0,0,0,.26),0 0 0 3px rgba(255,255,255,.18); }
.pf-avatar-inner { width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg,#8b7ee8,#5b4fc4); display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:700; color:#fff; overflow:hidden; font-family:'Instrument Serif',serif; }
.pf-avatar-inner img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.pf-cam-btn { position:absolute; bottom:2px; right:2px; width:28px; height:28px; border-radius:50%; background:#fff; border:2px solid #e0d9f8; display:flex; align-items:center; justify-content:center; color:#6d5acd; cursor:pointer; box-shadow:0 3px 10px rgba(0,0,0,.18); transition:all .15s; animation:pulseRing 2.2s infinite; }
.pf-cam-btn:hover { transform:scale(1.1); }
.pf-hero-text { flex:1; min-width:0; }
.pf-hero-name { font-family:'Instrument Serif',serif; font-size:28px; color:#fff; line-height:1.1; margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pf-hero-spec { font-size:13px; color:rgba(255,255,255,.78); font-weight:500; margin-bottom:13px; }
.pf-chips { display:flex; gap:7px; flex-wrap:wrap; }
.pf-chip { display:inline-flex; align-items:center; gap:5px; padding:4px 11px; border-radius:999px; background:rgba(255,255,255,.13); border:1px solid rgba(255,255,255,.22); font-size:11.5px; font-weight:600; color:rgba(255,255,255,.92); backdrop-filter:blur(6px); white-space:nowrap; }

/* ══ STATS ROW ══ */
.pf-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
.pf-stat { background:#fff; border-radius:18px; padding:16px 18px; border:1.5px solid #ece8f6; box-shadow:0 2px 10px rgba(109,90,205,.06); display:flex; align-items:center; gap:13px; animation:fadeUp .45s ease backwards; }
.pf-stat-ico { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ico-purple{background:#ede9fb;color:#6d5acd;} .ico-blue{background:#dbeafe;color:#2563eb;} .ico-green{background:#d1fae5;color:#059669;} .ico-amber{background:#fef3c7;color:#d97706;}
.pf-stat-lbl { font-size:10px; font-weight:700; color:#b0aac6; text-transform:uppercase; letter-spacing:.8px; margin-bottom:3px; }
.pf-stat-val { font-size:13px; font-weight:700; color:#111827; }

/* ══ CARDS GRID ══ */
.pf-grid { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
.pf-card { background:#fff; border-radius:20px; border:1.5px solid #ece8f6; box-shadow:0 2px 14px rgba(109,90,205,.06); overflow:hidden; animation:fadeUp .45s ease backwards; }
.pf-card.full { grid-column:1/-1; }
.pf-card-head { display:flex; align-items:center; gap:11px; padding:15px 20px; background:linear-gradient(135deg,#faf9fe,#f3f1fc); border-bottom:1.5px solid #ece8f6; }
.pf-card-ico { width:32px; height:32px; border-radius:9px; background:#ede9fb; border:1px solid #dcd8f5; color:#6d5acd; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.pf-card-title { font-size:13px; font-weight:800; color:#111827; }
.pf-card-sub   { font-size:11px; color:#a0a8b8; font-weight:500; margin-top:1px; }
.pf-fields { padding:18px 20px; display:flex; flex-direction:column; gap:14px; }
.pf-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.pf-field { display:flex; flex-direction:column; gap:6px; }
.pf-field.full { grid-column:1/-1; }
.pf-label { font-size:10.5px; font-weight:700; color:#b4aed0; text-transform:uppercase; letter-spacing:.85px; display:flex; align-items:center; gap:5px; }
.pf-input,.pf-select,.pf-textarea { font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:500; color:#111827; border:1.5px solid #e6e2f5; border-radius:11px; background:#faf9fe; outline:none; transition:all .15s; }
.pf-input,.pf-select { height:40px; padding:0 13px; }
.pf-textarea { padding:11px 13px; resize:vertical; min-height:86px; }
.pf-input:focus,.pf-select:focus,.pf-textarea:focus { border-color:#6d5acd; background:#fff; box-shadow:0 0 0 3px rgba(109,90,205,.1); }
.pf-input:disabled,.pf-select:disabled,.pf-textarea:disabled { background:#f3f1fa; color:#6b7280; cursor:default; border-color:#edeaf7; }
.pf-select { cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236d5acd' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 13px center; background-color:#faf9fe; }
.pf-select:disabled { background-color:#f3f1fa; }
.pf-display { height:40px; padding:0 13px; border:1.5px solid #edeaf7; border-radius:11px; background:#f3f1fa; display:flex; align-items:center; gap:8px; font-size:13.5px; font-weight:600; color:#374151; }
.pf-verified { display:inline-flex; align-items:center; gap:4px; padding:2px 9px; border-radius:999px; background:#d1fae5; color:#065f46; border:1px solid #6ee7b7; font-size:10.5px; font-weight:700; margin-left:6px; }
.pf-tags { display:flex; flex-wrap:wrap; gap:7px; margin-top:2px; }
.pf-tag { display:inline-flex; align-items:center; padding:5px 14px; border-radius:999px; font-size:12px; font-weight:600; background:#ede9fb; color:#6d5acd; border:1.5px solid #dcd8f5; cursor:pointer; transition:all .15s; user-select:none; }
.pf-tag.on { background:#6d5acd; color:#fff; border-color:#6d5acd; }
.pf-tag:hover { transform:translateY(-1px); box-shadow:0 3px 8px rgba(109,90,205,.22); }
.pf-tag.disabled { cursor:default; opacity:.7; }
.pf-tag.disabled:hover { transform:none; box-shadow:none; }
.pf-actions { display:flex; justify-content:flex-end; gap:10px; padding:15px 20px; border-top:1.5px solid #ece8f6; background:#faf9fe; }
.pf-btn-cancel { display:flex; align-items:center; gap:6px; padding:9px 20px; border-radius:11px; border:1.5px solid #dcd8f5; background:#fff; color:#6d5acd; font-size:13px; font-weight:600; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all .15s; }
.pf-btn-cancel:hover { background:#f0edfb; }
.pf-btn-save { display:flex; align-items:center; gap:6px; padding:9px 22px; border-radius:11px; border:none; background:linear-gradient(135deg,#6d5acd,#8b7ee8); color:#fff; font-size:13px; font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif; box-shadow:0 4px 14px rgba(109,90,205,.3); transition:all .15s; }
.pf-btn-save:hover { transform:translateY(-1px); box-shadow:0 7px 20px rgba(109,90,205,.4); }
.pf-toast { position:fixed; bottom:28px; right:28px; display:flex; align-items:center; gap:10px; padding:12px 20px; background:#fff; border:1.5px solid #bbf7d0; border-radius:14px; box-shadow:0 8px 28px rgba(0,0,0,.13); font-size:13.5px; font-weight:600; color:#065f46; z-index:99999; animation:toastIn .3s ease; }

/* ═══════════════════════════════════
   MOBILE ONLY — hidden on desktop
═══════════════════════════════════ */
.pf-mob-header  { display:none; }
.pf-mob-editbar { display:none; }
.pf-mob-logout  { display:none; }

@media (max-width:768px) {
  /* hide desktop chrome */
  .pf-sidebar-slot { display:none; }
  .pf-topbar-wrap  { display:none !important; }
  .pf-hero         { display:none !important; }
  .pf-stats        { display:none !important; }

  /* body padding for bottom nav */
  .pf-body { padding:14px 14px 90px !important; }

  /* ── MOBILE HEADER ── */
  .pf-mob-header {
    display:block;
    background:linear-gradient(135deg,#3b2a8e 0%,#6d5acd 55%,#9f87f5 100%);
    position:relative; overflow:hidden; flex-shrink:0;
  }
  .pf-mob-header::before { content:''; position:absolute; width:180px; height:180px; border-radius:50%; background:rgba(255,255,255,.07); top:-70px; right:-30px; pointer-events:none; }
  .pf-mob-header::after  { content:''; position:absolute; width:90px;  height:90px;  border-radius:50%; background:rgba(255,255,255,.05); bottom:-20px; left:-10px; pointer-events:none; }

  .pf-mob-toprow { display:flex; align-items:center; justify-content:space-between; padding:14px 16px 0; position:relative; z-index:2; }
  .pf-mob-iconbtn { width:36px; height:36px; border-radius:10px; background:rgba(255,255,255,.18); border:1.5px solid rgba(255,255,255,.28); display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; outline:none; transition:background .18s; font-family:'Figtree',sans-serif; }
  .pf-mob-iconbtn:hover { background:rgba(255,255,255,.28); }
  .pf-mob-pagetitle { font-size:16px; font-weight:800; color:#fff; font-family:'Figtree',sans-serif; letter-spacing:-.2px; }

  .pf-mob-avatarsec { display:flex; flex-direction:column; align-items:center; padding:18px 16px 0; position:relative; z-index:2; }
  .pf-mob-avatar-ring { width:80px; height:80px; border-radius:50%; padding:3px; background:linear-gradient(135deg,rgba(255,255,255,.6),rgba(255,255,255,.2)); box-shadow:0 6px 22px rgba(0,0,0,.24),0 0 0 3px rgba(255,255,255,.18); position:relative; cursor:pointer; }
  .pf-mob-avatar-inner { width:100%; height:100%; border-radius:50%; background:linear-gradient(135deg,#8b7ee8,#5b4fc4); display:flex; align-items:center; justify-content:center; font-size:26px; font-weight:700; color:#fff; overflow:hidden; font-family:'Instrument Serif',serif; }
  .pf-mob-avatar-inner img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
  .pf-mob-cam { position:absolute; bottom:1px; right:1px; width:24px; height:24px; border-radius:50%; background:#fff; border:2px solid #e0d9f8; display:flex; align-items:center; justify-content:center; color:#6d5acd; box-shadow:0 2px 8px rgba(0,0,0,.16); }
  .pf-mob-name { font-size:19px; font-weight:900; color:#fff; margin-top:10px; letter-spacing:-.3px; font-family:'Figtree',sans-serif; text-align:center; }
  .pf-mob-spec { font-size:12px; color:rgba(255,255,255,.72); font-weight:500; margin-top:2px; text-align:center; font-family:'Figtree',sans-serif; }

  .pf-mob-chips { display:flex; gap:6px; flex-wrap:wrap; justify-content:center; padding:10px 16px 0; position:relative; z-index:2; }
  .pf-mob-chip  { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:999px; background:rgba(255,255,255,.14); border:1px solid rgba(255,255,255,.22); font-size:10.5px; font-weight:600; color:rgba(255,255,255,.9); font-family:'Figtree',sans-serif; }

  .pf-mob-wave { width:100%; height:22px; background:#f3f1fa; border-radius:22px 22px 0 0; margin-top:18px; position:relative; z-index:1; }

  /* ── MOBILE EDIT BAR ── */
  .pf-mob-editbar {
    display:flex; gap:8px; margin-bottom:12px;
  }
  .pf-mob-editbar-btn { flex:1; display:flex; align-items:center; justify-content:center; gap:6px; padding:11px; border-radius:12px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Figtree',sans-serif; transition:all .18s; }
  .pf-mob-editbar-btn.edit   { background:#6d5acd; color:#fff; border:none; box-shadow:0 4px 14px rgba(109,90,205,.28); }
  .pf-mob-editbar-btn.save   { background:linear-gradient(135deg,#6d5acd,#8b7ee8); color:#fff; border:none; box-shadow:0 4px 14px rgba(109,90,205,.28); }
  .pf-mob-editbar-btn.cancel { background:#fff; color:#6b7280; border:1.5px solid #e5e7eb; }

  /* ── MOBILE LOGOUT ── */
  .pf-mob-logout { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:13px; border-radius:14px; background:#fff5f5; color:#dc2626; border:1.5px solid #fecaca; font-size:13px; font-weight:700; cursor:pointer; font-family:'Figtree',sans-serif; transition:all .2s; margin-top:4px; }
  .pf-mob-logout:hover { background:#dc2626; color:#fff; border-color:#dc2626; }

  /* single column cards */
  .pf-grid  { grid-template-columns:1fr; gap:12px; }
  .pf-card.full { grid-column:1; }
  .pf-row   { grid-template-columns:1fr; }
  .pf-field.full { grid-column:1; }
  .pf-actions { flex-direction:column-reverse; padding:13px 14px; }
  .pf-btn-cancel,.pf-btn-save { justify-content:center; width:100%; padding:11px; }
  .pf-toast { bottom:80px; right:14px; left:14px; }
}

@media (max-width:420px) {
  .pf-mob-name { font-size:17px; }
  .pf-mob-spec { font-size:11px; }
}
`;

function injectCSS() {
  if (!document.getElementById(STYLE_ID)) {
    const el = document.createElement("style");
    el.id = STYLE_ID; el.textContent = CSS;
    document.head.appendChild(el);
  }
}

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SPECIALTIES = [
  "Obstetrics & Gynecology","Fetal Medicine","Maternal-Fetal Medicine",
  "Reproductive Endocrinology","Pediatrics","Radiology","Genetics","Other"
];
const EXPERIENCE_OPTS = ["< 1 year","1–3 years","3–5 years","5–10 years","10–15 years","15+ years"];

export default function Profile() {
  const [collapsed,    setCollapsed]    = useState(window.innerWidth <= 768);
  const [isEditing,    setIsEditing]    = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [toast,        setToast]        = useState(false);
  const fileRef  = useRef();
  const navigate = useNavigate();

  const user     = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorId = user?.id;

  const [form, setForm] = useState({
    fullName:"", specialty:"", email:"", phone:"",
    institution:"", qualification:"", experience:"",
    licenseNo:"", city:"", country:"", languages:"",
    website:"", bio:"", availability:[], consultFee:"",
  });

  useEffect(() => {
    injectCSS();
    const onResize = () => setCollapsed(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    if (doctorId) fetchProfile();
    return () => window.removeEventListener("resize", onResize);
  }, [doctorId]);

  const fetchProfile = async () => {
    try {
      const { data } = await API.get(`/doctor-profile/${doctorId}`);
      const d = data?.profile ?? data;
      setForm({
        fullName:      d.fullName      || "",
        specialty:     d.specialty     || "",
        email:         d.doctorId?.email || "",
        phone:         d.phone         || "",
        institution:   d.institution   || "",
        qualification: d.qualification || "",
        experience:    d.experience    || "",
        licenseNo:     d.licenseNo     || "",
        city:          d.city          || "",
        country:       d.country       || "",
        languages:     d.languages     || "",
        website:       d.website       || "",
        bio:           d.bio           || "",
        availability:  Array.isArray(d.availability) ? d.availability : [],
        consultFee:    d.consultFee    ?? "",
      });
      if (d.profileImage)
        setPreviewImage(`${getBaseUrl()}/uploads/${d.profileImage}`);
    } catch(err) { console.error("FETCH PROFILE ERROR:", err); }
  };

  const handleChange      = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleImageChange = e => {
    const file = e.target.files[0]; if (!file) return;
    setProfileImage(file); setPreviewImage(URL.createObjectURL(file));
  };
  const toggleDay = day => {
    if (!isEditing) return;
    setForm(f => ({
      ...f,
      availability: f.availability.includes(day)
        ? f.availability.filter(d => d !== day)
        : [...f.availability, day],
    }));
  };

  const handleSave = async () => {
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "email") return;
        fd.append(k, Array.isArray(v) ? JSON.stringify(v) : v);
      });
      if (profileImage) fd.append("profileImage", profileImage);

      const { data } = await API.put(`/doctor-profile/${doctorId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const saved = data?.profile ?? data;

      setForm(f => ({
        ...f,
        fullName:      saved.fullName      ?? f.fullName,
        specialty:     saved.specialty     ?? f.specialty,
        phone:         saved.phone         ?? f.phone,
        institution:   saved.institution   ?? f.institution,
        qualification: saved.qualification ?? f.qualification,
        experience:    saved.experience    ?? f.experience,
        licenseNo:     saved.licenseNo     ?? f.licenseNo,
        city:          saved.city          ?? f.city,
        country:       saved.country       ?? f.country,
        languages:     saved.languages     ?? f.languages,
        website:       saved.website       ?? f.website,
        bio:           saved.bio           ?? f.bio,
        availability:  Array.isArray(saved.availability) ? saved.availability : f.availability,
        consultFee:    saved.consultFee    ?? f.consultFee,
      }));
      if (saved.profileImage)
        setPreviewImage(`${getBaseUrl()}/uploads/${saved.profileImage}`);

      setProfileImage(null); setIsEditing(false);
      setToast(true); setTimeout(() => setToast(false), 3000);
      window.dispatchEvent(new CustomEvent("doctor-profile-updated", {
        detail: { fullName: saved.fullName || form.fullName }
      }));
    } catch(err) { console.error("SAVE ERROR:", err); }
  };

  const cancel       = () => { setIsEditing(false); fetchProfile(); };
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const initials = form.fullName
    ? form.fullName.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase()
    : "DR";

  return (
    <div className="pf-root">

      {/* ── SIDEBAR SLOT ── */}
      <div className={`pf-sidebar-slot${collapsed ? " collapsed" : ""}`}>
        <Sidebar collapsed={collapsed} toggle={() => setCollapsed(c => !c)}/>
      </div>

      {/* ── MAIN COLUMN ── */}
      <div className="pf-main">

        {/* Desktop topbar */}
        <div className="pf-topbar-wrap"><Topbar/></div>

        {/* ════════════════════════════════
            MOBILE HEADER
        ════════════════════════════════ */}
        <div className="pf-mob-header">
          <div className="pf-mob-toprow">
            <button className="pf-mob-iconbtn" onClick={() => navigate(-1)}>
              <ChevronLeft size={18}/>
            </button>
            <span className="pf-mob-pagetitle">My Profile</span>
            <button className="pf-mob-iconbtn" onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
              {isEditing ? <Save size={16}/> : <Edit3 size={16}/>}
            </button>
          </div>

          <div className="pf-mob-avatarsec">
            <div className="pf-mob-avatar-ring" onClick={() => isEditing && fileRef.current?.click()}>
              <div className="pf-mob-avatar-inner">
                {previewImage ? <img src={previewImage} alt="avatar"/> : initials}
              </div>
              {isEditing && <div className="pf-mob-cam"><Camera size={11}/></div>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageChange}/>
            <div className="pf-mob-name">{form.fullName ? `Dr. ${form.fullName}` : "Doctor"}</div>
            <div className="pf-mob-spec">{form.specialty || "Prenatal AI Copilot"}</div>
          </div>

          <div className="pf-mob-chips">
            {form.institution && <span className="pf-mob-chip"><Building2 size={9}/>{form.institution}</span>}
            {form.city        && <span className="pf-mob-chip"><MapPin size={9}/>{form.city}</span>}
            {form.experience  && <span className="pf-mob-chip"><Award size={9}/>{form.experience}</span>}
            {form.licenseNo   && <span className="pf-mob-chip"><Shield size={9}/>Licensed</span>}
          </div>

          <div className="pf-mob-wave"/>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="pf-body">

          {/* DESKTOP HERO */}
          <div className="pf-hero">
            <div className="pf-hero-dots"/> <div className="pf-hero-glow"/>
            {!isEditing && (
              <button className="pf-edit-btn" onClick={() => setIsEditing(true)}>
                <Pencil size={13}/> Edit Profile
              </button>
            )}
            <div className="pf-hero-inner">
              <div className="pf-avatar-wrap">
                <div className="pf-avatar-ring">
                  <div className="pf-avatar-inner">
                    {previewImage ? <img src={previewImage} alt="avatar"/> : initials}
                  </div>
                </div>
                {isEditing && (
                  <div className="pf-cam-btn" onClick={() => fileRef.current?.click()}>
                    <Camera size={12}/>
                    <input ref={fileRef} type="file" hidden accept="image/*" onChange={handleImageChange}/>
                  </div>
                )}
              </div>
              <div className="pf-hero-text">
                <div className="pf-hero-name">Dr. {form.fullName || "Your Name"}</div>
                <div className="pf-hero-spec">{form.specialty || "Medical Specialist"}</div>
                <div className="pf-chips">
                  {form.institution && <span className="pf-chip"><Building2 size={10}/>{form.institution}</span>}
                  {form.city        && <span className="pf-chip"><MapPin size={10}/>{form.city}{form.country ? ", "+form.country : ""}</span>}
                  {form.experience  && <span className="pf-chip"><Award size={10}/>{form.experience}</span>}
                  {form.licenseNo   && <span className="pf-chip"><Shield size={10}/>Licensed</span>}
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP STATS */}
          <div className="pf-stats">
            {[
              { ico:<Stethoscope size={19}/>, cls:"ico-purple", lbl:"Specialty",  val:form.specialty   || "—" },
              { ico:<Award size={19}/>,       cls:"ico-blue",   lbl:"Experience", val:form.experience  || "—" },
              { ico:<Shield size={19}/>,      cls:"ico-green",  lbl:"License",    val:form.licenseNo   ? "Verified" : "Pending" },
              { ico:<Clock size={19}/>,       cls:"ico-amber",  lbl:"Available",  val:form.availability?.length ? form.availability.slice(0,3).join(", ") : "—" },
            ].map((s,i) => (
              <div className="pf-stat" key={i} style={{animationDelay:`${i*0.06}s`}}>
                <div className={`pf-stat-ico ${s.cls}`}>{s.ico}</div>
                <div><div className="pf-stat-lbl">{s.lbl}</div><div className="pf-stat-val">{s.val}</div></div>
              </div>
            ))}
          </div>

          {/* MOBILE EDIT BAR */}
          <div className="pf-mob-editbar">
            {isEditing ? (<>
              <button className="pf-mob-editbar-btn cancel" onClick={cancel}><X size={14}/> Cancel</button>
              <button className="pf-mob-editbar-btn save"   onClick={handleSave}><Save size={14}/> Save Changes</button>
            </>) : (
              <button className="pf-mob-editbar-btn edit" onClick={() => setIsEditing(true)}><Edit3 size={14}/> Edit Profile</button>
            )}
          </div>

          {/* CARDS GRID */}
          <div className="pf-grid">

            {/* Personal Info */}
            <div className="pf-card" style={{animationDelay:"0.08s"}}>
              <div className="pf-card-head">
                <div className="pf-card-ico"><User size={14}/></div>
                <div><div className="pf-card-title">Personal Information</div><div className="pf-card-sub">Core identity details</div></div>
              </div>
              <div className="pf-fields">
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="pf-label"><User size={10}/>Full Name</label>
                    <input className="pf-input" name="fullName" value={form.fullName} onChange={handleChange} disabled={!isEditing} placeholder="Dr. Full Name"/>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label"><Phone size={10}/>Phone</label>
                    <input className="pf-input" name="phone" value={form.phone} onChange={handleChange} disabled={!isEditing} placeholder="+91 00000 00000"/>
                  </div>
                </div>
                <div className="pf-field full">
                  <label className="pf-label"><Mail size={10}/>Email Address</label>
                  <div className="pf-display">{form.email || "—"}<span className="pf-verified"><CheckCircle size={9}/>Verified</span></div>
                </div>
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="pf-label"><Globe size={10}/>Website</label>
                    <input className="pf-input" name="website" value={form.website} onChange={handleChange} disabled={!isEditing} placeholder="https://..."/>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label"><Globe size={10}/>Languages</label>
                    <input className="pf-input" name="languages" value={form.languages} onChange={handleChange} disabled={!isEditing} placeholder="English, Hindi…"/>
                  </div>
                </div>
              </div>
              {isEditing && (
                <div className="pf-actions">
                  <button className="pf-btn-cancel" onClick={cancel}><X size={13}/>Cancel</button>
                  <button className="pf-btn-save"   onClick={handleSave}><Save size={13}/>Save Changes</button>
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div className="pf-card" style={{animationDelay:"0.13s"}}>
              <div className="pf-card-head">
                <div className="pf-card-ico"><GraduationCap size={14}/></div>
                <div><div className="pf-card-title">Professional Details</div><div className="pf-card-sub">Credentials & experience</div></div>
              </div>
              <div className="pf-fields">
                <div className="pf-field">
                  <label className="pf-label"><Building2 size={10}/>Institution / Hospital</label>
                  <input className="pf-input" name="institution" value={form.institution} onChange={handleChange} disabled={!isEditing} placeholder="Hospital or Clinic"/>
                </div>
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="pf-label"><GraduationCap size={10}/>Qualification</label>
                    <input className="pf-input" name="qualification" value={form.qualification} onChange={handleChange} disabled={!isEditing} placeholder="MBBS, MD, DM…"/>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label"><Stethoscope size={10}/>Specialty</label>
                    {isEditing
                      ? <select className="pf-select" name="specialty" value={form.specialty} onChange={handleChange}><option value="">Select</option>{SPECIALTIES.map(s=><option key={s}>{s}</option>)}</select>
                      : <div className="pf-display">{form.specialty || "—"}</div>}
                  </div>
                </div>
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="pf-label"><Calendar size={10}/>Experience</label>
                    {isEditing
                      ? <select className="pf-select" name="experience" value={form.experience} onChange={handleChange}><option value="">Select</option>{EXPERIENCE_OPTS.map(o=><option key={o}>{o}</option>)}</select>
                      : <div className="pf-display">{form.experience || "—"}</div>}
                  </div>
                  <div className="pf-field">
                    <label className="pf-label"><Shield size={10}/>License No.</label>
                    <input className="pf-input" name="licenseNo" value={form.licenseNo} onChange={handleChange} disabled={!isEditing} placeholder="MCI / State license"/>
                  </div>
                </div>
                <div className="pf-row">
                  <div className="pf-field">
                    <label className="pf-label">Consult Fee (₹)</label>
                    <input className="pf-input" name="consultFee" type="number" value={form.consultFee} onChange={handleChange} disabled={!isEditing} placeholder="e.g. 500"/>
                  </div>
                  <div className="pf-field">
                    <label className="pf-label"><MapPin size={10}/>City</label>
                    <input className="pf-input" name="city" value={form.city} onChange={handleChange} disabled={!isEditing} placeholder="e.g. Mumbai"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="pf-card" style={{animationDelay:"0.18s"}}>
              <div className="pf-card-head">
                <div className="pf-card-ico"><Clock size={14}/></div>
                <div><div className="pf-card-title">Availability</div><div className="pf-card-sub">Working days</div></div>
              </div>
              <div className="pf-fields">
                <div className="pf-field">
                  <label className="pf-label">Select Days</label>
                  <div className="pf-tags">
                    {DAYS.map(d => (
                      <span key={d} className={`pf-tag${form.availability?.includes(d)?" on":""}${!isEditing?" disabled":""}`} onClick={() => toggleDay(d)}>{d}</span>
                    ))}
                  </div>
                </div>
                <div className="pf-field">
                  <label className="pf-label"><Globe size={10}/>Country</label>
                  <input className="pf-input" name="country" value={form.country} onChange={handleChange} disabled={!isEditing} placeholder="e.g. India"/>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="pf-card" style={{animationDelay:"0.22s"}}>
              <div className="pf-card-head">
                <div className="pf-card-ico"><ChevronRight size={14}/></div>
                <div><div className="pf-card-title">About / Bio</div><div className="pf-card-sub">Professional summary</div></div>
              </div>
              <div className="pf-fields">
                <div className="pf-field">
                  <label className="pf-label">Bio</label>
                  <textarea className="pf-textarea" name="bio" value={form.bio} onChange={handleChange} disabled={!isEditing} rows={4} placeholder="Your background, areas of focus, and approach to patient care…"/>
                </div>
              </div>
            </div>

          </div>{/* end pf-grid */}

          {/* MOBILE LOGOUT */}
          <button className="pf-mob-logout" onClick={handleLogout}>
            <LogOut size={16}/> Sign Out
          </button>

        </div>{/* end pf-body */}
      </div>{/* end pf-main */}

      <MobileBottomBar/>

      {toast && (
        <div className="pf-toast">
          <CheckCircle size={16} color="#059669"/> Profile updated successfully!
        </div>
      )}
    </div>
  );
}
