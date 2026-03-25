import { useState } from "react";
import {
  LayoutDashboard,
  FolderOpen,
  Dna,
  FileText,
  MessageSquare,
  History,
  ChevronLeft,
  ChevronRight,
  Bot,
  Stethoscope,
  LogOut
} from "lucide-react";

import { useNavigate, NavLink } from "react-router-dom";

/* ============================================================
   ALL SIDEBAR CSS — inlined as <style> so no external file needed
   ============================================================ */
const sidebarStyles = `
  .sidebar {
    width: 250px;
    height: 100vh;
    background: linear-gradient(180deg, var(--primary), var(--accent-foreground));
    color: white;
    padding: 22px;
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: width 0.3s ease, padding 0.3s ease;
  }

  .sidebar a {
    text-decoration: none !important;
    color: inherit;
  }

  .sidebar-nav svg,
  .sidebar-header svg,
  .sidebar-logout svg {
    width: 20px !important;
    height: 20px !important;
    min-width: 20px;
    min-height: 20px;
  }

  .sidebar.collapsed .sidebar-nav svg,
  .sidebar.collapsed .sidebar-header svg,
  .sidebar.collapsed .sidebar-logout svg {
    width: 23px !important;
    height: 23px !important;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    overflow: hidden;
  }

  .sidebar.collapsed {
    width: 72px;
    padding: 16px 10px;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .sidebar-header.collapsed {
    justify-content: center;
  }

  .brand-icon {
    width: 38px;
    height: 38px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: transform 0.25s ease;
  }

  .sidebar-header:hover .brand-icon {
    transform: scale(1.05);
  }

  .brand-text h2 {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.2;
  }

  .brand-text span {
    font-size: 12px;
    opacity: 0.85;
  }

  .sidebar-divider {
    height: 1px;
    width: 100%;
    background: rgba(255, 255, 255, 0.25);
    margin-bottom: 20px;
  }

  .sidebar.collapsed .sidebar-divider {
    width: 40px;
    margin: 16px auto;
  }

  .sidebar-nav {
    margin-top: 12px;
  }

  .sidebar-nav a {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 14px;
    border-radius: 14px;
    margin-bottom: 8px;
    cursor: pointer;
    opacity: 0.9;
    position: relative;
    text-decoration: none;
    transition: background 0.25s ease, transform 0.2s ease;
    color: white;
  }

  .sidebar-nav a:hover {
    transform: translateX(4px);
  }

  .sidebar-nav a.active,
  .sidebar-nav a:hover {
    background: rgba(255, 255, 255, 0.22);
    opacity: 1;
  }

  .sidebar-nav a,
  .sidebar-nav a:visited,
  .sidebar-nav a:active,
  .sidebar-nav a:hover {
    text-decoration: none !important;
    color: white;
  }

  .sidebar-nav a.active::before {
    content: "";
    position: absolute;
    left: -8px;
    width: 4px;
    height: 60%;
    background: white;
    border-radius: 4px;
  }

  .sidebar.collapsed .sidebar-nav a {
    justify-content: center;
    padding: 12px;
  }

  .sidebar.collapsed .sidebar-nav a.active::before {
    left: -4px;
  }

  .sidebar-nav svg {
    width: 20px;
    height: 20px;
  }

  .sidebar-logout {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.25);
    cursor: pointer;
    opacity: 0.9;
    transition: background 0.25s ease, transform 0.2s ease;
  }

  .sidebar-logout:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
    opacity: 1;
  }

  .sidebar.collapsed .sidebar-logout {
    justify-content: center;
    padding: 12px;
  }

  .collapse-btn {
    position: absolute;
    top: 120px;
    right: 0;
    transform: translateX(50%);
    width: 36px;
    height: 36px;
    background: white;
    border-radius: 50%;
    border: 2px solid #ede9fe;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.25);
    cursor: pointer;
    z-index: 9999;
  }

  .main {
    margin-left: 250px;
    min-height: 100vh;
    overflow-y: auto;
    background: #f5f6fa;
    position: relative;
  }

  .sidebar.collapsed + .main {
    margin-left: 72px;
  }

  @media (max-width: 768px) {
    .main {
      margin-left: 60px;
      width: calc(100% - 60px);
    }

    .dashboard {
      padding: 20px;
    }

    .sidebar {
      width: 60px !important;
      padding: 16px 8px !important;
    }

    .sidebar .brand-text,
    .sidebar .sidebar-nav span,
    .sidebar .sidebar-logout span {
      display: none !important;
    }

    .sidebar-nav a,
    .sidebar-logout {
      justify-content: center !important;
    }

    .collapse-btn {
      display: none !important;
    }
  }

  @media (max-width: 480px) {
    .sidebar {
      width: 60px;
    }

    .main {
      margin-left: 60px;
      width: calc(100% - 60px);
    }
  }
`;

export default function Sidebar({ collapsed, toggle }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (!confirmLogout) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <>
      {/* ── Injected styles (replaces the .css import) ── */}
      <style>{sidebarStyles}</style>

      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>

        {/* ── Header ── */}
        <div className={`sidebar-header ${collapsed ? "collapsed" : ""}`}>

          {/* Brand icon — Tailwind: size, shape, bg, center, hover scale */}
          <div className="brand-icon flex items-center justify-center w-10 h-10 rounded-xl transition-transform duration-200 hover:scale-105"
               style={{ background: "rgba(255,255,255,0.25)" }}>
            <Stethoscope size={20} />
          </div>

          {/* Brand text — only when expanded */}
          {!collapsed && (
            <div className="brand-text flex flex-col">
              <h2 className="text-base font-semibold leading-tight m-0">Prenatal AI</h2>
              <span className="text-xs opacity-80">Copilot</span>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        <div className="sidebar-divider" />

        {/* ── Nav links ── */}
        <nav className="sidebar-nav mt-3">

          <NavLink to="/dashboard" end className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl mb-2 text-white no-underline transition-all duration-200 opacity-90 hover:opacity-100 relative
             ${isActive ? "active" : ""}`
          }>
            <LayoutDashboard />
            {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
          </NavLink>

          <NavLink to="/cases" className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl mb-2 text-white no-underline transition-all duration-200 opacity-90 hover:opacity-100 relative
             ${isActive ? "active" : ""}`
          }>
            <FolderOpen />
            {!collapsed && <span className="text-sm font-medium">Cases</span>}
          </NavLink>

          <NavLink to="/gene-analysis" className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl mb-2 text-white no-underline transition-all duration-200 opacity-90 hover:opacity-100 relative
             ${isActive ? "active" : ""}`
          }>
            <Dna />
            {!collapsed && <span className="text-sm font-medium">Gene Analysis</span>}
          </NavLink>

          <NavLink to="/history" className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl mb-2 text-white no-underline transition-all duration-200 opacity-90 hover:opacity-100 relative
             ${isActive ? "active" : ""}`
          }>
            <History />
            {!collapsed && <span className="text-sm font-medium">History</span>}
          </NavLink>

          <NavLink to="/chat-bot" className={({ isActive }) =>
            `flex items-center gap-3.5 px-3.5 py-3 rounded-2xl mb-2 text-white no-underline transition-all duration-200 opacity-90 hover:opacity-100 relative
             ${isActive ? "active" : ""}`
          }>
            <Bot />
            {!collapsed && <span className="text-sm font-medium">Copilot</span>}
          </NavLink>

        </nav>

        {/* ── Logout ── */}
        <div
          className={`sidebar-logout flex items-center gap-3 px-3.5 py-3 rounded-2xl cursor-pointer opacity-90
                      hover:opacity-100 transition-all duration-200 mt-auto
                      ${collapsed ? "justify-center" : ""}`}
          onClick={handleLogout}
        >
          <LogOut size={22} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </div>

        {/* ── Collapse toggle button ── */}
        <button
          className="collapse-btn absolute flex items-center justify-center w-9 h-9 rounded-full border-2 bg-white cursor-pointer transition-shadow duration-200 hover:shadow-lg"
          style={{
            top: "120px",
            right: 0,
            transform: "translateX(50%)",
            borderColor: "#ede9fe",
            boxShadow: "0 6px 16px rgba(124,58,237,0.25)",
            zIndex: 9999,
            color: "#7c3aed"
          }}
          onClick={toggle}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

      </aside>
    </>
  );
}