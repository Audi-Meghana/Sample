import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";

export default function Navbar({ onLogin, onSignup }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 z-[100] w-full transition-all duration-300 border-b ${
        scrolled 
          ? "h-[48px] bg-white/90 backdrop-blur-md border-[hsl(250,20%,90%)] shadow-sm" 
          : "h-[56px] bg-white border-[hsl(250,20%,94%)]"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
        
        {/* LOGO */}
        <div 
          className="flex items-center cursor-pointer"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <div className="font-['Cormorant_Garamond'] text-xl font-bold text-[hsl(250,25%,25%)] tracking-tight">
            Prenatal <span className="text-[hsl(250,60%,50%)] italic">AI</span>
            <span className="text-[hsl(250,15%,50%)] font-light ml-1 text-sm hidden sm:inline">Copilot</span>
          </div>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6">
          {["about", "capabilities", "safety"].map((item) => (
            <button
              key={item}
              onClick={() => scrollTo(item)}
              className="text-[11px] font-bold uppercase tracking-[0.1em] text-[hsl(250,25%,25%)]/60 hover:text-[hsl(250,60%,50%)] transition-colors"
            >
              {item === "capabilities" ? "Features" : item}
            </button>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={onLogin}
            className="hidden sm:block text-[12px] font-bold uppercase tracking-wider text-[hsl(250,25%,25%)] hover:text-[hsl(250,60%,50%)] px-2"
          >
            Login
          </button>

          <button
            onClick={onSignup}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white 
            bg-gradient-to-br from-[hsl(250,60%,65%)] to-[hsl(250,60%,47%)]
            shadow-md hover:shadow-lg transition-all"
          >
            Join <ArrowRight size={12} />
          </button>

          {/* MOBILE TOGGLE */}
          <button 
            className="md:hidden p-1 text-[hsl(250,25%,25%)]" 
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-[hsl(250,20%,90%)] p-5 md:hidden flex flex-col gap-4 shadow-xl">
          <button onClick={() => scrollTo("about")} className="text-sm font-semibold text-[hsl(250,25%,25%)]">About</button>
          <button onClick={() => scrollTo("capabilities")} className="text-sm font-semibold text-[hsl(250,25%,25%)]">Features</button>
          <button onClick={() => scrollTo("safety")} className="text-sm font-semibold text-[hsl(250,25%,25%)]">Safety</button>
          <div className="pt-2 flex flex-col gap-2">
            <button onClick={onLogin} className="w-full py-2 text-sm font-bold text-[hsl(250,60%,50%)] border border-[hsl(250,60%,50%)] rounded-lg">Login</button>
            <button onClick={onSignup} className="w-full py-2 bg-[hsl(250,60%,50%)] text-white rounded-lg text-sm font-bold">Get Started</button>
          </div>
        </div>
      )}
    </header>
  );
}