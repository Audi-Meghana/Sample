import { useNavigate, useLocation } from "react-router-dom";
import { Briefcase, Home, Dna, History, MessageCircle } from "lucide-react";

/* ═══════════════════════════════════════════════════
   MOBILE BOTTOM BAR — shared across all doctor pages
   Usage: <MobileBottomBar />
   NOTE: Profile is accessible via the avatar icon in the top mobile banner.
═══════════════════════════════════════════════════ */

const NAV_ITEMS = [
  { label: "Home",          icon: Home,      path: "/dashboard"     },
  { label: "Cases",         icon: Briefcase, path: "/cases"         },
  { label: "Gene Analysis", icon: Dna,       path: "/gene-analysis" },
  { label: "History",       icon: History,   path: "/history"       },
];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800;900&display=swap');

@keyframes mbb-spinRing  { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
@keyframes mbb-spinInner { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
@keyframes mbb-fabPop    { 0%{transform:scale(.8);opacity:0} 100%{transform:scale(1);opacity:1} }
@keyframes mbb-dotPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }

/* ── BOTTOM NAV ── */
.mbb-nav {
  display: none;
  position: fixed; bottom: 0; left: 0; right: 0;
  height: 64px;
  background: #fff;
  border-top: 1px solid #ebe7f8;
  box-shadow: 0 -4px 20px rgba(109,90,205,.08);
  z-index: 100;
  padding: 0 4px;
  align-items: center;
  justify-content: space-around;
  font-family: 'Figtree', sans-serif;
}
.mbb-item {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  padding: 6px 10px; border-radius: 12px; cursor: pointer;
  transition: background .18s; flex: 1; min-width: 0;
  background: transparent; border: none;
  font-family: 'Figtree', sans-serif;
  position: relative;
}
.mbb-item:hover { background: #f6f4fe; }
.mbb-item.active { background: #eef2ff; }
.mbb-icon  { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
.mbb-label { font-size: 9.5px; font-weight: 600; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
.mbb-item.active .mbb-label { color: #6d5acd; font-weight: 700; }

/* active indicator dot */
.mbb-item.active::after {
  content: '';
  position: absolute; bottom: 2px;
  width: 4px; height: 4px; border-radius: 50%;
  background: #6d5acd;
}

/* ── FLOATING AI FAB ── */
.mbb-fab {
  display: none;
  position: fixed; bottom: 76px; right: 16px; z-index: 150;
  flex-direction: column; align-items: flex-end; gap: 6px;
  animation: mbb-fabPop .4s cubic-bezier(.34,1.56,.64,1) both;
  background: none; border: none; padding: 0;
  cursor: pointer; font-family: 'Figtree', sans-serif;
}
.mbb-fab-row {
  display: flex; align-items: center; gap: 8px;
  pointer-events: none;
}
.mbb-fab-label {
  background: #1e1b3a; color: #fff;
  font-size: 11px; font-weight: 800;
  font-family: 'Figtree', sans-serif;
  padding: 5px 12px; border-radius: 20px;
  white-space: nowrap;
  box-shadow: 0 3px 12px rgba(0,0,0,.22);
  letter-spacing: .3px;
}
.mbb-fab-ring {
  width: 54px; height: 54px; border-radius: 50%;
  background: conic-gradient(
    #6d5acd 0deg, #8b7ee8 90deg,
    #c084fc 180deg, #f472b6 270deg,
    #6d5acd 360deg
  );
  padding: 2.5px;
  animation: mbb-spinRing 3s linear infinite;
  box-shadow: 0 6px 26px rgba(109,90,205,.45);
  transition: transform .2s, box-shadow .2s;
  position: relative; flex-shrink: 0;
}
.mbb-fab:hover .mbb-fab-ring {
  transform: scale(1.1);
  box-shadow: 0 10px 34px rgba(109,90,205,.6);
}
.mbb-fab-inner {
  width: 100%; height: 100%; border-radius: 50%;
  background: linear-gradient(135deg, #6d5acd, #8b7ee8 55%, #a78bfa);
  display: flex; align-items: center; justify-content: center; color: #fff;
  animation: mbb-spinInner 3s linear infinite;
}
.mbb-fab-dot {
  position: absolute; top: 0; right: 0;
  width: 14px; height: 14px; border-radius: 50%;
  background: #f43f5e; border: 2.5px solid #fff;
  z-index: 2;
  animation: mbb-dotPulse 1.8s ease-in-out infinite;
}

/* ── SHOW ON MOBILE ONLY ── */
@media (max-width: 768px) {
  .mbb-nav { display: flex !important; }
  .mbb-fab { display: flex !important; }
}
`;

export default function MobileBottomBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <style>{CSS}</style>

      {/* ── Bottom Navigation — 4 items only, Profile is in top avatar ── */}
      <nav className="mbb-nav">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path === "/dashboard" &&
              (location.pathname === "/" || location.pathname === "/dashboard"));
          return (
            <button
              key={item.path}
              className={`mbb-item${isActive ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <div className="mbb-icon">
                <Icon
                  size={isActive ? 22 : 20}
                  strokeWidth={isActive ? 2.2 : 1.8}
                  color={isActive ? "#6d5acd" : "#9ca3af"}
                />
              </div>
              <span className="mbb-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Floating AI Button ── */}
      <button
        className="mbb-fab"
        type="button"
        onClick={() => navigate("/chat-bot")}
        aria-label="Open AI Copilot"
      >
        <div className="mbb-fab-row">
          <div className="mbb-fab-label">Ask AI</div>
          <div className="mbb-fab-ring">
            <div className="mbb-fab-inner">
              <MessageCircle size={21} strokeWidth={2.2} />
            </div>
            <span className="mbb-fab-dot" />
          </div>
        </div>
      </button>
    </>
  );
}
