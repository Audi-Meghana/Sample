import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import API from "../../services/api";

const STYLE_ID = "cdm-style-v2";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');

@keyframes cdm-backdrop { from { opacity: 0; } to { opacity: 1; } }
@keyframes cdm-slide    { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }

/* ── OVERLAY ── */
#cdm-root {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Figtree', sans-serif;
  animation: cdm-backdrop 0.2s ease;
}

#cdm-root::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(6, 4, 20, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* ── MODAL SHELL ── */
#cdm-modal {
  position: relative;
  z-index: 1;
  width: min(660px, calc(100vw - 32px));
  height: min(780px, calc(100vh - 40px));
  background: #ffffff;
  border-radius: 22px;
  border: 1px solid #e2ddf6;
  box-shadow:
    0 0 0 1px rgba(124,111,205,0.08),
    0 24px 60px rgba(0,0,0,0.28),
    0 8px 24px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: cdm-slide 0.3s cubic-bezier(0.16,1,0.3,1);
}

/* ── HEADER ── */
#cdm-header {
  flex: 0 0 auto;
  padding: 22px 22px 16px;
  background: #fff;
  border-bottom: 1.5px solid #f0ecfa;
  position: relative;
}

#cdm-top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
  background: linear-gradient(90deg, #6d5acd, #9b8ee8, #d4cef8, #9b8ee8, #6d5acd);
  border-radius: 22px 22px 0 0;
}

#cdm-header-inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

#cdm-header-left { flex: 1; min-width: 0; }

.cdm-eyebrow {
  font-size: 10px;
  font-weight: 800;
  color: #a89ee0;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  display: block;
  margin-bottom: 4px;
}

.cdm-patient-id {
  font-size: 26px;
  font-weight: 900;
  color: #0c0a1e;
  letter-spacing: -0.5px;
  line-height: 1;
  display: block;
  margin-bottom: 12px;
}

.cdm-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.cdm-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 700;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #374151;
  white-space: nowrap;
}

.cdm-chip-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #9ca3af;
  flex-shrink: 0;
}

.chip-uploaded  { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
.chip-uploaded  .cdm-chip-dot { background: #3b82f6; }
.chip-review    { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.chip-review    .cdm-chip-dot { background: #f97316; }
.chip-completed { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
.chip-completed .cdm-chip-dot { background: #22c55e; }

/* ── HEADER ACTIONS ── */
.cdm-action-btn {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 1.5px solid #ebe8f5;
  background: #f8f7fc;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.cdm-action-btn:hover        { background: #ede9fb; border-color: #c4baf0; color: #6d5acd; }
.cdm-action-btn.active       { background: #eef2ff; border-color: #a5b4fc; color: #4338ca; }
.cdm-action-btn.btn-download:hover { background: #f0fdf4; border-color: #86efac; color: #15803d; }
.cdm-action-btn.btn-close:hover    { background: #fef2f2; border-color: #fca5a5; color: #dc2626; }

/* ── SCROLLABLE BODY ── */
#cdm-body {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 22px 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

#cdm-body::-webkit-scrollbar { width: 5px; }
#cdm-body::-webkit-scrollbar-track { background: transparent; }
#cdm-body::-webkit-scrollbar-thumb { background: #d5d0ee; border-radius: 99px; }
#cdm-body::-webkit-scrollbar-thumb:hover { background: #a89ee0; }

/* ── FOOTER ── */
#cdm-footer {
  flex: 0 0 auto;
  padding: 14px 22px;
  border-top: 1.5px solid #f0ecfa;
  background: #faf9fe;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

/* ── EDIT BANNER ── */
.cdm-edit-banner {
  background: linear-gradient(135deg, #eef2ff, #f0edfb);
  border: 1.5px solid #c7d2fe;
  border-radius: 12px;
  padding: 11px 15px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12.5px;
  font-weight: 700;
  color: #3730a3;
  flex-shrink: 0;
}

/* ── SECTION CARD ── */
.cdm-card {
  border: 1.5px solid #ebe8f4;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 2px 8px rgba(109,90,205,0.06);
  flex-shrink: 0;
}

.cdm-card-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px 16px;
  background: linear-gradient(135deg, #faf9fe, #f4f2fc);
  border-bottom: 1.5px solid #ebe8f4;
}

.cdm-card-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: #ede9fb;
  border: 1px solid #dcd8f5;
  color: #7c6fcd;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.cdm-card-title   { font-size: 13px; font-weight: 800; color: #111827; }
.cdm-card-subtitle { font-size: 11px; color: #a0a8b8; font-weight: 500; margin-top: 1px; }

/* ── FIELD GRID ── */
.cdm-field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.cdm-field {
  padding: 15px 16px;
  border-bottom: 1px solid #f3f0fa;
  box-sizing: border-box;
}

.cdm-field:nth-child(odd)          { border-right: 1px solid #f3f0fa; }
.cdm-field:nth-last-child(1),
.cdm-field:nth-last-child(2)       { border-bottom: none; }

.cdm-field-label {
  font-size: 10px;
  font-weight: 800;
  color: #b4aed0;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  margin-bottom: 7px;
  display: block;
}

.cdm-field-value {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  line-height: 1.4;
}

.cdm-field-value.is-id    { color: #5b50c4; }
.cdm-field-value.is-empty { color: #d1d5db; font-weight: 400; }

/* ── BADGE ── */
.cdm-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}
.cdm-badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.badge-uploaded  { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.badge-uploaded  .cdm-badge-dot { background: #3b82f6; }
.badge-review    { background: #fff7ed; color: #c2410c; border: 1px solid #fed7aa; }
.badge-review    .cdm-badge-dot { background: #f97316; }
.badge-completed { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.badge-completed .cdm-badge-dot { background: #22c55e; }
.badge-default   { background: #f9fafb; color: #6b7280; border: 1px solid #e5e7eb; }
.badge-default   .cdm-badge-dot { background: #9ca3af; }

/* ── EDIT INPUTS ── */
.cdm-input, .cdm-select {
  width: 100%;
  height: 36px;
  padding: 0 11px;
  border: 1.5px solid #c7d2fe;
  border-radius: 9px;
  font-size: 13.5px;
  font-weight: 600;
  color: #111827;
  font-family: 'Figtree', sans-serif;
  background: #f8f8ff;
  outline: none;
  transition: all 0.15s;
  box-sizing: border-box;
}
.cdm-input:focus, .cdm-select:focus {
  border-color: #6366f1;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
}
.cdm-select { cursor: pointer; }

/* ── PP4 GRID ── */
.cdm-pp4-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 15px 16px;
}

.cdm-pp4-card {
  background: #faf9fe;
  border: 1px solid #e8e4f4;
  border-left: 3px solid #a89ee0;
  border-radius: 11px;
  padding: 13px 14px;
}

.cdm-pp4-label {
  font-size: 10px;
  font-weight: 800;
  color: #b4aed0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 6px;
  display: block;
}

.cdm-pp4-value {
  font-size: 17px;
  font-weight: 900;
  color: #111827;
}

/* ── SUMMARY ── */
.cdm-summary {
  padding: 15px 16px;
  font-size: 13.5px;
  color: #4b5563;
  line-height: 1.85;
}

.cdm-summary p { margin: 0 0 10px; }
.cdm-summary p:last-child { margin-bottom: 0; }

/* ── TIMELINE ── */
.cdm-timeline { display: grid; grid-template-columns: 1fr 1fr; }

.cdm-timeline-item {
  padding: 15px 16px;
  border-right: 1px solid #f3f0fa;
}
.cdm-timeline-item:last-child { border-right: none; }

.cdm-timeline-label {
  font-size: 10px;
  font-weight: 800;
  color: #b4aed0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 5px;
  display: block;
}

.cdm-timeline-value { font-size: 13px; font-weight: 600; color: #374151; }

/* ── REPORT FILE ROW ── */
.cdm-report-row {
  margin: 0 16px 15px;
  padding: 11px 14px;
  background: #faf9fe;
  border: 1px solid #ebe8f4;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.cdm-report-name { font-size: 13px; font-weight: 600; color: #111827; }
.cdm-report-type {
  padding: 3px 9px;
  border-radius: 7px;
  background: #ede9fb;
  border: 1px solid #dcd8f5;
  font-size: 10px;
  font-weight: 800;
  color: #7c6fcd;
}

/* ── FOOTER BUTTONS ── */
.btn-secondary {
  padding: 9px 22px;
  border-radius: 11px;
  border: 1.5px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: all 0.15s;
}
.btn-secondary:hover { background: #f5f5f7; border-color: #d1d5db; }

.btn-primary {
  padding: 9px 22px;
  border-radius: 11px;
  border: none;
  background: linear-gradient(135deg, #6d5acd, #8b7ee8);
  color: #fff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Figtree', sans-serif;
  transition: all 0.15s;
  box-shadow: 0 3px 12px rgba(109,90,205,0.3);
  display: flex;
  align-items: center;
  gap: 7px;
}
.btn-primary:hover    { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(109,90,205,0.38); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

/* ── RESPONSIVE ── */
@media (max-width: 560px) {
  #cdm-modal {
    width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    border: none;
  }
  .cdm-field-grid  { grid-template-columns: 1fr; }
  .cdm-field:nth-child(odd) { border-right: none; }
  .cdm-field:nth-last-child(2) { border-bottom: 1px solid #f3f0fa; }
  .cdm-timeline    { grid-template-columns: 1fr; }
  .cdm-timeline-item { border-right: none; border-bottom: 1px solid #f3f0fa; }
  .cdm-timeline-item:last-child { border-bottom: none; }
  .cdm-pp4-grid    { grid-template-columns: 1fr; }
}
`;

function injectCSS() {
  if (!document.getElementById(STYLE_ID)) {
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }
}

/* ── helpers ── */
const statusChipClass  = s => ({ Uploaded: "chip-uploaded", "Under Review": "chip-review", Completed: "chip-completed" }[s] || "");
const statusBadgeClass = s => ({ Uploaded: "badge-uploaded", "Under Review": "badge-review", Completed: "badge-completed" }[s] || "badge-default");
const isYes = v => v === true || v === "Yes";
const Em    = () => <span style={{color:"#d1d5db",fontWeight:400}}>—</span>;

export default function CaseDetailsModal({ caseData, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form, setForm] = useState({
    patientName:      caseData?.patientName      ?? "",
    gestationalAge:   caseData?.gestationalAge   ?? "",
    modeOfConception: caseData?.modeOfConception ?? "Natural",
    consanguinity:    isYes(caseData?.consanguinity) ? "Yes" : "No",
    status:           caseData?.status           ?? "Uploaded",
  });

  useEffect(() => {
    injectCSS();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!caseData) return null;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
  setSaving(true);
  try {
    const payload = {
      patientName:      form.patientName,
      gestationalAge:   form.gestationalAge,
      modeOfConception: form.modeOfConception,
      consanguinity:    form.consanguinity,   // send "Yes"/"No" string directly
      status:           form.status,
    };
    await API.put(`/cases/${caseData._id}`, payload);
    setEditing(false);
    onUpdated?.({ ...caseData, ...payload });
  } catch (e) {
    console.error(e);
    alert(e.response?.data?.message || "Save failed. Please try again.");
  } finally {
    setSaving(false);
  }
};
  const handleDownload = () => {
    const lines = [
      "════════════════════════════════════",
      "     PRENATAL AI — CASE REPORT",
      "════════════════════════════════════", "",
      "PATIENT INFORMATION",
      "────────────────────────────────────",
      `Patient ID         : ${caseData.patientId        || "—"}`,
      `Patient Name       : ${caseData.patientName      || "—"}`,
      `Status             : ${caseData.status           || "—"}`,
      `Gestational Age    : ${caseData.gestationalAge ? caseData.gestationalAge + " weeks" : "—"}`,
      `Mode of Conception : ${caseData.modeOfConception || "—"}`,
      `Consanguinity      : ${isYes(caseData.consanguinity) ? "Yes" : "No"}`, "",
    ];
    if (caseData.pp4) lines.push(
      "PP4 SCORE", "────────────────────────────────────",
      `Raw Score   : ${caseData.pp4.rawScore   ?? "—"}`,
      `Final Score : ${caseData.pp4.finalScore ?? "—"}`,
      `Risk Level  : ${caseData.pp4.riskLevel  ?? "—"}`,
      `Calculated  : ${caseData.pp4.calculatedAt ? new Date(caseData.pp4.calculatedAt).toLocaleString() : "—"}`, ""
    );
    if (caseData.summary) lines.push("CLINICAL SUMMARY", "────────────────────────────────────", caseData.summary, "");
    lines.push(
      "TIMELINE", "────────────────────────────────────",
      `Created      : ${caseData.createdAt ? new Date(caseData.createdAt).toLocaleString() : "—"}`,
      `Last Updated : ${caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleString() : "—"}`,
      "", "════════════════════════════════════",
      `Prenatal AI Copilot · ${new Date().toLocaleString()}`
    );
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" })),
      download: `Case_${caseData.patientId || "report"}.txt`,
    });
    a.click();
  };

  const fmtSummary = t =>
    t.split(/(?=Gene:|Final PP4 Score:|Risk Category:|Interpretation:|Recommended Action:)/g)
     .map((s, i) => <p key={i}>{s.trim()}</p>);

  const liveStatus = editing ? form.status        : caseData.status;
  const liveAge    = editing ? form.gestationalAge : caseData.gestationalAge;
  const liveName   = editing ? form.patientName    : caseData.patientName;

  return createPortal(
    <div id="cdm-root" onClick={onClose}>
      <div id="cdm-modal" onClick={e => e.stopPropagation()}>

        {/* ══ HEADER ══ */}
        <div id="cdm-header">
          <div id="cdm-top-bar" />
          <div id="cdm-header-inner">
            <div id="cdm-header-left">
              <span className="cdm-eyebrow">Case Details</span>
              <span className="cdm-patient-id">{caseData.patientId || "—"}</span>
              <div className="cdm-chips">
                <span className={`cdm-chip ${statusChipClass(liveStatus)}`}>
                  <span className="cdm-chip-dot" />{liveStatus || "Draft"}
                </span>
                {liveAge && (
                  <span className="cdm-chip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3" strokeLinecap="round"/></svg>
                    {liveAge} wks
                  </span>
                )}
                {liveName && (
                  <span className="cdm-chip">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {liveName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display:"flex", gap:"7px", alignItems:"center", flexShrink:0 }}>
              <button
                className={`cdm-action-btn${editing ? " active" : ""}`}
                onClick={() => setEditing(v => !v)}
                title={editing ? "Cancel edit" : "Edit case"}
              >
                {editing
                  ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
              </button>
              <button className="cdm-action-btn btn-download" onClick={handleDownload} title="Download report">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
              <button className="cdm-action-btn btn-close" onClick={onClose} title="Close">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* ══ SCROLLABLE BODY ══ */}
        <div id="cdm-body">

          {editing && (
            <div className="cdm-edit-banner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Edit mode — update fields then click Save Changes
            </div>
          )}

          {/* ── Patient Information ── */}
          <div className="cdm-card">
            <div className="cdm-card-header">
              <div className="cdm-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div className="cdm-card-title">Patient Information</div>
                <div className="cdm-card-subtitle">Core case details</div>
              </div>
            </div>

            <div className="cdm-field-grid">
              <div className="cdm-field">
                <span className="cdm-field-label">Patient ID</span>
                <div className="cdm-field-value is-id">{caseData.patientId || "—"}</div>
              </div>
              <div className="cdm-field">
                <span className="cdm-field-label">Patient Name</span>
                {editing
                  ? <input className="cdm-input" value={form.patientName} onChange={e => set("patientName", e.target.value)} placeholder="Full name" />
                  : <div className="cdm-field-value">{caseData.patientName || <Em />}</div>}
              </div>
              <div className="cdm-field">
                <span className="cdm-field-label">Status</span>
                {editing
                  ? <select className="cdm-select" value={form.status} onChange={e => set("status", e.target.value)}>
                      <option>Uploaded</option>
                      <option>Under Review</option>
                      <option>Completed</option>
                    </select>
                  : <div className="cdm-field-value">
                      <span className={`cdm-badge ${statusBadgeClass(caseData.status)}`}>
                        <span className="cdm-badge-dot" />{caseData.status || "Draft"}
                      </span>
                    </div>}
              </div>
              <div className="cdm-field">
                <span className="cdm-field-label">Gestational Age</span>
                {editing
                  ? <input className="cdm-input" type="number" min="1" max="45" value={form.gestationalAge} onChange={e => set("gestationalAge", e.target.value)} placeholder="e.g. 20" />
                  : <div className="cdm-field-value">
                      {caseData.gestationalAge
                        ? <>{caseData.gestationalAge} <span style={{color:"#9ca3af",fontWeight:500,fontSize:"12px"}}>weeks</span></>
                        : <Em />}
                    </div>}
              </div>
              <div className="cdm-field">
                <span className="cdm-field-label">Mode of Conception</span>
                {editing
                  ? <select className="cdm-select" value={form.modeOfConception} onChange={e => set("modeOfConception", e.target.value)}>
                      <option>Natural</option><option>IVF</option><option>ICSI</option><option>IUI</option>
                    </select>
                  : <div className="cdm-field-value">{caseData.modeOfConception || <Em />}</div>}
              </div>
              <div className="cdm-field">
                <span className="cdm-field-label">Consanguinity</span>
                {editing
                  ? <select className="cdm-select" value={form.consanguinity} onChange={e => set("consanguinity", e.target.value)}>
                      <option>No</option><option>Yes</option>
                    </select>
                  : <div className="cdm-field-value">
                      {caseData.consanguinity != null ? (isYes(caseData.consanguinity) ? "Yes" : "No") : <Em />}
                    </div>}
              </div>
            </div>

            {caseData.reportFile && (
              <div className="cdm-report-row">
                <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                  <div style={{ width:"28px",height:"28px",borderRadius:"8px",background:"#ede9fb",border:"1px solid #dcd8f5",display:"flex",alignItems:"center",justifyContent:"center",color:"#7c6fcd",flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <span className="cdm-report-name">{caseData.reportFile}</span>
                </div>
                {caseData.reportFileType && (
                  <span className="cdm-report-type">{caseData.reportFileType.split("/")[1]?.toUpperCase()}</span>
                )}
              </div>
            )}
          </div>

          {/* ── PP4 Score ── */}
          {caseData.pp4 && (
            <div className="cdm-card">
              <div className="cdm-card-header">
                <div className="cdm-card-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div>
                  <div className="cdm-card-title">PP4 Score Details</div>
                  <div className="cdm-card-subtitle">Genetic risk analysis</div>
                </div>
              </div>
              <div className="cdm-pp4-grid">
                {[
                  ["Raw Score",   caseData.pp4.rawScore],
                  ["Final Score", caseData.pp4.finalScore],
                  ["Risk Level",  caseData.pp4.riskLevel],
                  ["Calculated",  caseData.pp4.calculatedAt ? new Date(caseData.pp4.calculatedAt).toLocaleString() : null],
                ].map(([label, val]) => (
                  <div key={label} className="cdm-pp4-card">
                    <span className="cdm-pp4-label">{label}</span>
                    <div className="cdm-pp4-value">{val ?? "—"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Clinical Summary ── */}
          {caseData.summary && (
            <div className="cdm-card">
              <div className="cdm-card-header">
                <div className="cdm-card-icon">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div>
                  <div className="cdm-card-title">Clinical Summary</div>
                  <div className="cdm-card-subtitle">AI-generated analysis</div>
                </div>
              </div>
              <div className="cdm-summary">{fmtSummary(caseData.summary)}</div>
            </div>
          )}

          {/* ── Timeline ── */}
          <div className="cdm-card">
            <div className="cdm-card-header">
              <div className="cdm-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <div className="cdm-card-title">Timeline</div>
                <div className="cdm-card-subtitle">Case activity log</div>
              </div>
            </div>
            <div className="cdm-timeline">
              <div className="cdm-timeline-item">
                <span className="cdm-timeline-label">Created</span>
                <div className="cdm-timeline-value">{caseData.createdAt ? new Date(caseData.createdAt).toLocaleString() : "—"}</div>
              </div>
              <div className="cdm-timeline-item">
                <span className="cdm-timeline-label">Last Updated</span>
                <div className="cdm-timeline-value">{caseData.updatedAt ? new Date(caseData.updatedAt).toLocaleString() : "—"}</div>
              </div>
            </div>
          </div>

        </div>{/* ══ end SCROLLABLE BODY ══ */}

        {/* ══ FOOTER ══ */}
        <div id="cdm-footer">
          {editing ? (
            <>
              <button className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving
                  ? "Saving…"
                  : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>Save Changes</>}
              </button>
            </>
          ) : (
            <button className="btn-secondary" onClick={onClose}>Close</button>
          )}
        </div>

      </div>
    </div>,
    document.body
  );
}
