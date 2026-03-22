import { Link } from "react-router-dom";

export default function Navbar({ onLogin, onSignup }) {
  return (
    <header className="w-full sticky top-0 z-50 bg-[hsl(40,33%,98%)] border-b border-[hsl(250,20%,90%)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* ================= BRAND ================= */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[hsl(250,45%,92%)] flex items-center justify-center">
            <span className="text-[hsl(250,60%,50%)] font-bold text-sm">
              AI
            </span>
          </div>

          <span className="text-[hsl(250,25%,25%)] font-semibold text-base">
            Prenatal AI Copilot
          </span>
        </div>

        {/* ================= NAV LINKS ================= */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-[hsl(250,15%,50%)]">
          {/* <Link to="/" className="hover:text-[hsl(250,25%,25%)] transition">
            Home
          </Link>

          <Link to="/about" className="hover:text-[hsl(250,25%,25%)] transition">
            About
          </Link>

          <Link to="/blogs" className="hover:text-[hsl(250,25%,25%)] transition">
            Blogs
          </Link>

          <Link to="/careers" className="hover:text-[hsl(250,25%,25%)] transition">
            Careers
          </Link> */}
        </nav>

        {/* ================= ACTIONS ================= */}
        <div className="flex items-center gap-4">

          {/* Login → POPUP */}
          <button
            onClick={onLogin}
            className="text-sm font-medium text-[hsl(250,25%,25%)]
                       hover:text-[hsl(250,60%,70%)] transition"
          >
            Login
          </button>

          {/* Signup → POPUP */}
          <button
            onClick={onSignup}
            className="text-sm font-semibold text-white px-5 py-2 rounded-xl
                       bg-gradient-to-r from-[hsl(250,60%,70%)]
                       to-[hsl(250,60%,50%)]
                       hover:opacity-90 transition shadow-sm"
          >
            Get Started
          </button>
        </div>

      </div>
    </header>
  );
}
