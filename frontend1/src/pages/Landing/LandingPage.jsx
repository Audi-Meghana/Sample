 
 
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import Navbar from "../../components/landing/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Stethoscope, Scan, Dna, ShieldCheck, HeartPulse,
  FileText, ClipboardList, Shield, ArrowRight, X,
  Star, CheckCircle2,
} from "lucide-react";
import Login from "../Auth/Login";
import Signup from "../Auth/Signup";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --purple-deep:   hsl(250,25%,25%);
      --purple-mid:    hsl(250,60%,50%);
      --purple-light:  hsl(250,45%,92%);
      --purple-soft:   hsl(250,20%,94%);
      --purple-border: hsl(250,20%,90%);
      --purple-muted:  hsl(250,15%,50%);
      --bg-warm:       hsl(40,33%,98%);
      --white:         #ffffff;
    }

    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: var(--bg-warm); color: var(--purple-deep); overflow-x: hidden; }

    /* HERO - UPDATED TO FIX NAVBAR OVERLAP */
    .hero {
      position: relative;
      min-height: 100vh; /* Increased to account for padding */
      display: flex;
      align-items: center;
      overflow: hidden;
      margin-top: 0; 
      padding-top: 80px; /* OFFSET FOR THE FIXED NAVBAR */
    }

    .hero-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 25%;
      display: block;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        115deg,
        hsla(250,40%,16%,0.88) 0%,
        hsla(250,38%,20%,0.70) 40%,
        hsla(250,30%,25%,0.35) 75%,
        hsla(250,20%,30%,0.10) 100%
      );
    }

    .hero-glow {
      position: absolute; top: -180px; left: -180px;
      width: 680px; height: 580px; border-radius: 50%;
      background: radial-gradient(circle, hsla(250,60%,58%,0.16) 0%, transparent 68%);
      pointer-events: none;
    }

    .hero-inner {
      position: relative; z-index: 2;
      max-width: 1200px; margin: 0 auto; padding: 3rem;
      width: 100%;
      display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center;
    }

    .hero-tag {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.42rem 1.05rem; border-radius: 100px;
      background: hsla(250,45%,92%,0.14); border: 1px solid hsla(250,45%,92%,0.32);
      color: hsl(250,45%,92%); font-size: 0.69rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
      margin-bottom: 1.7rem; backdrop-filter: blur(8px);
      animation: fadeUp 0.7s ease both;
    }

    .hdot { width: 6px; height: 6px; border-radius: 50%; background: hsl(250,65%,78%); animation: blink 2s infinite; }
    @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.35} }
    
    .hero-h1 {
      font-family: 'Cormorant Garamond', serif;
      font-size: clamp(2.8rem, 4.2vw, 4.4rem);
      font-weight: 300; line-height: 1.09; color: #fff; letter-spacing: -0.02em;
      animation: fadeUp 0.7s 0.1s ease both;
    }
    .hero-h1 strong { font-weight: 700; }
    .hero-h1 em { font-style: italic; color: hsl(250,68%,82%); }
    
    .hero-sub { margin-top: 1.5rem; font-size: 0.98rem; color: hsla(250,20%,96%,0.75); line-height: 1.8; max-width: 490px; animation: fadeUp 0.7s 0.2s ease both; }
    
    .hero-actions { margin-top: 2.5rem; display: flex; gap: 1rem; animation: fadeUp 0.7s 0.3s ease both; }
    
    .btn-hp {
      display: flex; align-items: center; gap: 0.55rem;
      padding: 0.95rem 1.9rem; border-radius: 100px;
      background: linear-gradient(135deg, hsl(250,60%,65%), hsl(250,60%,47%));
      color: #fff; font-size: 0.88rem; font-weight: 600;
      cursor: pointer; border: none; transition: all 0.3s;
      box-shadow: 0 8px 26px hsla(250,60%,50%,0.55);
    }
    .btn-hp:hover { transform: translateY(-2px); box-shadow: 0 14px 36px hsla(250,60%,50%,0.65); }
    
    .btn-hg {
      padding: 0.95rem 1.9rem; border-radius: 100px;
      background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
      color: #fff; font-size: 0.88rem; font-weight: 500;
      cursor: pointer; border: 1.5px solid rgba(255,255,255,0.32); transition: all 0.3s;
    }
    .btn-hg:hover { background: rgba(255,255,255,0.18); border-color: rgba(255,255,255,0.55); }

    .hero-trust { margin-top: 3rem; display: flex; align-items: center; gap: 1rem; animation: fadeUp 0.7s 0.4s ease both; }
    .h-avatars { display: flex; }
    .h-avatars img { width: 35px; height: 35px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.55); margin-left: -9px; object-fit: cover; }
    .h-avatars img:first-child { margin-left: 0; }
    .h-trust-txt { font-size: 0.79rem; color: rgba(255,255,255,0.68); line-height: 1.5; }
    .h-trust-txt strong { color: #fff; }
    .h-stars { display: flex; gap: 2px; margin-bottom: 2px; }

    .hero-card {
      background: rgba(255,255,255,0.09); backdrop-filter: blur(22px);
      border: 1px solid rgba(255,255,255,0.18); border-radius: 1.75rem; padding: 1.4rem;
      animation: fadeUp 0.7s 0.35s ease both;
    }
    .hc-img { border-radius: 1.2rem; overflow: hidden; height: 210px; }
    .hc-img img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; margin-top: 0.9rem; }
    .hc-stat { background: rgba(255,255,255,0.11); border: 1px solid rgba(255,255,255,0.14); border-radius: 0.875rem; padding: 0.85rem; text-align: center; }
    .hc-num { font-family: 'Cormorant Garamond', serif; font-size: 1.55rem; font-weight: 700; color: #fff; line-height: 1; }
    .hc-lbl { font-size: 0.65rem; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.2rem; }

    /* STRIP */
    .strip { background: var(--white); padding: 1.75rem 3rem; border-bottom: 1px solid var(--purple-border); }
    .strip-inner { max-width: 1100px; margin: 0 auto; }
    .strip-card { background: var(--white); border-radius: 1.5rem; border: 1px solid var(--purple-border); box-shadow: 0 4px 24px hsla(250,20%,50%,0.07); display: flex; flex-wrap: wrap; justify-content: space-around; align-items: center; gap: 1rem; padding: 1.5rem 2rem; }
    .strip-item { display: flex; align-items: center; gap: 0.75rem; }
    .strip-icon { background: var(--purple-light); width: 44px; height: 44px; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; color: var(--purple-mid); }
    .strip-label { font-size: 0.85rem; font-weight: 600; color: var(--purple-deep); }

    /* SECTIONS */
    .sec { padding: 7rem 3rem; }
    .sec-inner { max-width: 1200px; margin: 0 auto; }
    .eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--purple-mid); margin-bottom: 0.9rem; }
    .sec-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(2rem,3.5vw,3rem); font-weight: 400; line-height: 1.15; color: var(--purple-deep); letter-spacing: -0.02em; }
    .sec-title em { font-style: italic; color: var(--purple-mid); }
    .sec-body { color: var(--purple-muted); line-height: 1.8; font-size: 0.96rem; }

    /* ABOUT */
    .about { background: var(--bg-warm); }
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: center; }
    .about-imgs { position: relative; padding-bottom: 3rem; }
    .about-main { width: 82%; border-radius: 2rem; overflow: hidden; box-shadow: 0 28px 72px hsla(250,25%,25%,0.16); }
    .about-main img { width: 100%; height: 400px; object-fit: cover; display: block; }
    .about-float { position: absolute; bottom: 0; right: 0; width: 50%; border-radius: 1.5rem; overflow: hidden; border: 4px solid var(--white); box-shadow: 0 16px 48px hsla(250,25%,25%,0.18); }
    .about-float img { width: 100%; height: 200px; object-fit: cover; display: block; }
    .about-badge { position: absolute; top: 1.5rem; right: 1rem; background: linear-gradient(135deg, hsl(250,60%,62%), hsl(250,60%,46%)); color: #fff; padding: 0.9rem 1.1rem; border-radius: 1rem; text-align: center; box-shadow: 0 8px 24px hsla(250,60%,50%,0.4); }
    .about-badge-num { font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 700; line-height: 1; }
    .about-badge-txt { font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.85; margin-top: 0.15rem; }
    .about-checks { margin-top: 2rem; display: flex; flex-direction: column; gap: 0.75rem; }
    .about-check { display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 500; color: var(--purple-deep); }

    /* GALLERY */
    .gallery { background: var(--purple-deep); padding: 4rem 0; }
    .gallery-track { display: flex; gap: 1.25rem; padding: 0 3rem; overflow-x: auto; scrollbar-width: none; }
    .gallery-track::-webkit-scrollbar { display: none; }
    .gallery-item { flex-shrink: 0; width: 300px; height: 210px; border-radius: 1.5rem; overflow: hidden; position: relative; }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s; }
    .gallery-item:hover img { transform: scale(1.06); }
    .gallery-lbl { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.85rem 1rem; background: linear-gradient(transparent, rgba(0,0,0,0.68)); color: rgba(255,255,255,0.9); font-size: 0.75rem; font-weight: 500; }

    /* CAPABILITIES */
    .caps { background: var(--white); }
    .caps-hdr { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; flex-wrap: wrap; gap: 1rem; }
    .caps-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
    .cap-card { background: var(--purple-soft); border: 1px solid var(--purple-border); border-radius: 1.75rem; padding: 2.5rem; transition: all 0.3s; }
    .cap-card:hover { transform: translateY(-6px); box-shadow: 0 24px 64px hsla(250,25%,25%,0.1); background: var(--white); }
    .cap-icon { background: var(--purple-light); width: 48px; height: 48px; border-radius: 0.875rem; display: flex; align-items: center; justify-content: center; color: var(--purple-mid); margin-bottom: 1.5rem; }
    .cap-card h3 { font-family: 'Cormorant Garamond', serif; font-size: 1.3rem; font-weight: 600; color: var(--purple-deep); margin-bottom: 0.75rem; }
    .cap-card p { font-size: 0.87rem; color: var(--purple-muted); line-height: 1.75; }

    /* SAFETY */
    .safety { background: var(--bg-warm); }
    .safety-grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 6rem; align-items: center; }
    .safety-img { border-radius: 2rem; overflow: hidden; box-shadow: 0 28px 72px hsla(250,25%,25%,0.14); }
    .safety-img img { width: 100%; height: 500px; object-fit: cover; display: block; }
    .safety-row { display: flex; gap: 1.25rem; align-items: flex-start; padding: 1.75rem 0; border-bottom: 1px solid var(--purple-border); }
    .safety-row:last-child { border-bottom: none; }
    .safety-icon { flex-shrink: 0; width: 44px; height: 44px; border-radius: 0.875rem; background: var(--purple-light); display: flex; align-items: center; justify-content: center; color: var(--purple-mid); transition: all 0.3s; }
    .safety-row:hover .safety-icon { background: var(--purple-mid); color: #fff; }
    .safety-row h4 { font-size: 0.97rem; font-weight: 600; color: var(--purple-deep); margin-bottom: 0.35rem; }
    .safety-row p { font-size: 0.85rem; color: var(--purple-muted); line-height: 1.7; }

    /* TESTIMONIALS */
    .tests { background: var(--white); padding: 7rem 3rem; }
    .tests-inner { max-width: 1200px; margin: 0 auto; }
    .tests-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 4rem; }
    .test-card { background: var(--purple-soft); border: 1px solid var(--purple-border); border-radius: 1.5rem; padding: 2rem; transition: all 0.3s; }
    .test-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px hsla(250,25%,25%,0.09); background: var(--white); }
    .test-stars { display: flex; gap: 3px; margin-bottom: 1rem; }
    .test-quote { font-family: 'Cormorant Garamond', serif; font-size: 1.05rem; font-style: italic; color: var(--purple-deep); line-height: 1.7; margin-bottom: 1.5rem; }
    .test-author { display: flex; align-items: center; gap: 0.75rem; }
    .test-author img { width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--purple-light); }
    .test-name { font-size: 0.87rem; font-weight: 600; color: var(--purple-deep); }
    .test-role { font-size: 0.76rem; color: var(--purple-muted); margin-top: 0.1rem; }

    /* CTA */
    .cta { background: linear-gradient(135deg, hsl(250,35%,20%) 0%, hsl(250,50%,28%) 100%); padding: 8rem 3rem; text-align: center; position: relative; overflow: hidden; }
    .cta::before { content:''; position:absolute; top:-250px; left:50%; transform:translateX(-50%); width:700px; height:700px; border-radius:50%; background:radial-gradient(circle, hsla(250,60%,60%,0.18) 0%, transparent 70%); pointer-events:none; }
    .cta h2 { font-family: 'Cormorant Garamond', serif; font-size: clamp(2.4rem,4.5vw,3.8rem); font-weight: 300; line-height: 1.15; color: #fff; max-width: 700px; margin: 0 auto 1.25rem; }
    .cta h2 em { font-style: italic; color: hsl(250,68%,82%); }
    .cta p { color: rgba(255,255,255,0.52); font-size: 0.97rem; max-width: 460px; margin: 0 auto 3rem; line-height: 1.75; }
    .cta-btns { display: flex; gap: 1rem; justify-content: center; }
    .btn-cta { display:flex; align-items:center; gap:0.6rem; padding:1.1rem 2.4rem; border-radius:100px; background:linear-gradient(135deg, hsl(250,60%,65%), hsl(250,60%,47%)); color:#fff; font-size:0.95rem; font-weight:600; cursor:pointer; border:none; transition:all 0.3s; box-shadow:0 8px 28px hsla(250,60%,50%,0.55); }
    .btn-cta:hover { transform:translateY(-2px); box-shadow:0 14px 40px hsla(250,60%,50%,0.65); }
    .btn-cta-g { padding:1.1rem 2.4rem; border-radius:100px; background:transparent; color:rgba(255,255,255,0.72); font-size:0.95rem; font-weight:500; cursor:pointer; border:1.5px solid rgba(255,255,255,0.25); transition:all 0.3s; }
    .btn-cta-g:hover { border-color:rgba(255,255,255,0.55); color:#fff; }

    /* DISCLAIMER */
    .disc { background: var(--purple-light); padding: 2.5rem 3rem; }
    .disc-inner { max-width: 1200px; margin: 0 auto; display: flex; gap: 1.25rem; align-items: flex-start; }
    .disc-icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 0.75rem; background: var(--purple-soft); display: flex; align-items: center; justify-content: center; color: var(--purple-mid); }
    .disc-text { font-size: 0.81rem; color: var(--purple-muted); line-height: 1.72; }
    .disc-text strong { color: var(--purple-deep); }

    /* FOOTER */
    .footer { background: var(--purple-deep); color: rgba(255,255,255,0.5); padding: 4rem 3rem 2rem; }
    .footer-inner { max-width: 1200px; margin: 0 auto; }
    .footer-top { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 4rem; margin-bottom: 3rem; }
    .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 700; color: #fff; margin-bottom: 0.75rem; }
    .footer-logo span { color: hsl(250,68%,80%); }
    .footer-desc { font-size: 0.83rem; line-height: 1.7; max-width: 260px; }
    .footer-col h5 { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 1.2rem; }
    .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.65rem; }
    .footer-col ul a { font-size: 0.84rem; color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.2s; }
    .footer-col ul a:hover { color: #fff; }
    .footer-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.5rem; display: flex; justify-content: space-between; font-size: 0.77rem; flex-wrap: wrap; gap: 0.5rem; }

    @keyframes fadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }

    @media(max-width:960px){
      .hero-inner,.about-grid,.safety-grid,.caps-grid,.tests-grid,.footer-top { grid-template-columns:1fr; }
      .hero-inner { padding:4rem 1.5rem 3rem; }
      .gallery-track { padding:0 1.5rem; }
      .cta,.tests { padding-left:1.5rem; padding-right:1.5rem; }
    }
  `}</style>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  const openLogin  = () => setModal("login");
  const openSignup = () => setModal("signup");
  const closeModal = () => setModal(null);

  const I = {
    hero:      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1800&q=80",
    heroCard:  "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80",
    aboutA:    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80",
    aboutB:    "https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80&w=800",
    safety:    "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?auto=format&fit=crop&w=1000&q=80",
    d1:        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=120&q=80",
    d2:        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=120&q=80",
    d3:        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=120&q=80",
    g1:        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80",
    g2:        "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=700&q=80",
    g3:        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800",
    g4:        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&q=80&w=800",
    g5:        "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=700&q=80",
  };

  return (
    <>
      <GlobalStyles />
      <Navbar onLogin={openLogin} onSignup={openSignup} />

      <Login
        isOpen={modal === "login"}
        onClose={closeModal}
        onSignup={() => setModal("signup")}
        onLoginSuccess={() => {
          closeModal();
          navigate("/doctor-dashboard");
        }}
      />

      <Signup
        isOpen={modal === "signup"}
        onClose={closeModal}
        onLogin={() => setModal("login")}
      />
      
      <section className="hero">
        <img className="hero-bg" src={I.hero} alt="Prenatal care" />
        <div className="hero-overlay" />
        <div className="hero-glow" />

        <div className="hero-inner">
          <div>
            <div className="hero-tag"><span className="hdot" /> Clinical Decision Support Platform</div>
            <h1 className="hero-h1">
              <strong>Prenatal Care,</strong><br />
              <em>Elevated</em> by<br />AI Intelligence
            </h1>
            <p className="hero-sub">
              A structured, explainable, and audit-safe platform supporting clinicians in correlating prenatal genetic findings with ultrasound and fetal echocardiography.
            </p>
            <div className="hero-actions">
              <button className="btn-hp" onClick={openSignup}>Get Started <ArrowRight size={15} /></button>
              <button className="btn-hg" onClick={openLogin}>Login</button>
            </div>
            <div className="hero-trust">
              <div className="h-avatars">
                <img src={I.d1} alt="" /><img src={I.d2} alt="" /><img src={I.d3} alt="" />
              </div>
              <div className="h-trust-txt">
                <div className="h-stars">{[...Array(5)].map((_,i)=><Star key={i} size={11} fill="hsl(250,68%,80%)" color="hsl(250,68%,80%)" />)}</div>
                <div><strong>2,400+ clinicians</strong> trust this platform</div>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hc-img"><img src={I.heroCard} alt="Ultrasound" /></div>
            <div className="hc-grid">
              {[["98%","Satisfaction"],["150K+","Cases"],["Zero","Auto Dx"],["100%","Audit Safe"]].map(([n,l])=>(
                <div className="hc-stat" key={l}>
                  <div className="hc-num">{n}</div>
                  <div className="hc-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="strip">
        <div className="strip-inner">
          <div className="strip-card">
            {[{I:Stethoscope,l:"Clinician-Led"},{I:Scan,l:"Prenatal Imaging"},{I:Dna,l:"Genetic Correlation"},{I:ShieldCheck,l:"Audit-Safe"},{I:HeartPulse,l:"Fetal Care"}].map(({I:Icon,l})=>(
              <div className="strip-item" key={l}>
                <div className="strip-icon"><Icon size={20} /></div>
                <span className="strip-label">{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="sec about" id="about">
        <div className="sec-inner">
          <div className="about-grid">
            <div className="about-imgs">
              <div className="about-main"><img src={I.aboutA} alt="Prenatal ultrasound" /></div>
              <div className="about-float"><img src={I.aboutB} alt="Pregnant mother" /></div>
              <div className="about-badge">
                <div className="about-badge-num">12+</div>
                <div className="about-badge-txt">Years Research</div>
              </div>
            </div>
            <div>
              <p className="eyebrow">About the Platform</p>
              <h2 className="sec-title" style={{marginBottom:"1.75rem"}}>Built for Prenatal &amp; <em>Fetal Medicine</em></h2>
              <div className="sec-body">
                <p style={{marginBottom:"1.1rem"}}>Prenatal AI Copilot is purpose-built for fetal medicine specialists, maternal-fetal medicine physicians, and clinical geneticists working in high-stakes prenatal contexts.</p>
                <p style={{marginBottom:"1.1rem"}}>The platform structures genetic findings, imaging observations, and gestational context into a single explainable workflow — bridging complex data and clinical insight.</p>
                <p>No diagnosis is made by the system. Final decisions remain entirely with the clinician.</p>
              </div>
              <div className="about-checks">
                {["Clinician-controlled at every step","Transparent rule-based reasoning","Aligned with prenatal ACMG principles"].map(t=>(
                  <div className="about-check" key={t}><CheckCircle2 size={18} color="hsl(250,60%,50%)" />{t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="gallery">
        <div className="gallery-track">
          {[{s:I.g1,l:"Fetal Echocardiography"},{s:I.g2,l:"Maternal Care"},{s:I.g3,l:"Prenatal Genetics"},{s:I.g4,l:"Clinical Consultation"},{s:I.g5,l:"Ultrasound Imaging"}].map(({s,l})=>(
            <div className="gallery-item" key={l}>
              <img src={s} alt={l} />
              <div className="gallery-lbl">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="sec caps" id="capabilities">
        <div className="sec-inner">
          <div className="caps-hdr">
            <div><p className="eyebrow">What We Offer</p><h2 className="sec-title">Platform <em>Capabilities</em></h2></div>
            <button className="btn-outline" onClick={openSignup}>View All Features →</button>
          </div>
          <div className="caps-grid">
            {[
              {I:ClipboardList, t:"Case-Centric Workflow",         d:"Create structured prenatal cases combining genetic results, imaging findings, and gestational context in one unified view."},
              {I:FileText,      t:"Targeted Imaging Guidance",      d:"Guide ultrasound and fetal echocardiography review using gene-specific prenatal visibility models tuned to gestational age."},
              {I:Shield,         t:"Explainable Clinical Reasoning",d:"Transparent rule-based reasoning aligned with prenatal-aware ACMG principles. Every output is fully traceable."},
              {I:Dna,           t:"Genetic Correlation Engine",    d:"Correlate chromosomal, monogenic, and copy number variant findings with relevant structural anomaly patterns."},
              {I:HeartPulse,    t:"Fetal Echo Integration",        d:"Structured support for fetal cardiac anomaly assessment tied directly to genetic risk stratification workflows."},
              {I:ShieldCheck,   t:"Full Audit & Traceability",      d:"Every decision point, recommendation, and clinician override is logged for retrospective review and compliance."},
            ].map(({I:Icon,t,d})=>(
              <div className="cap-card" key={t}>
                <div className="cap-icon"><Icon size={20} /></div>
                <h3>{t}</h3><p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec safety" id="safety">
        <div className="sec-inner">
          <div className="safety-grid">
            <div className="safety-img"><img src={I.safety} alt="Doctor with patient" /></div>
            <div>
              <p className="eyebrow">Safety First</p>
              <h2 className="sec-title" style={{marginBottom:"1rem"}}>Clinical Safety <em>Framework</em></h2>
              <p className="sec-body" style={{marginBottom:"2rem"}}>Designed as a Clinical Decision Support system with explicit safeguards for clinician control, transparency, and auditability at every step.</p>
              {[
                {I:ShieldCheck,   t:"No Autonomous Diagnosis",     d:"The system never generates diagnoses or treatment decisions. It surfaces structured information for the clinician to interpret."},
                {I:FileText,      t:"Explainable Rule-Based Logic", d:"All reasoning is transparent and traceable, aligned with prenatal ACMG logic. No black-box outputs."},
                {I:ClipboardList, t:"Full Audit & Traceability",    d:"Every recommendation, override, and decision point is logged in an immutable audit trail."},
                {I:Stethoscope,   t:"Clinician Always in Control",  d:"The platform is a support tool. Clinicians retain complete authority over every clinical decision."},
              ].map(({I:Icon,t,d})=>(
                <div className="safety-row" key={t}>
                  <div className="safety-icon"><Icon size={20} /></div>
                  <div><h4>{t}</h4><p>{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tests">
        <div className="tests-inner">
          <p className="eyebrow">What Clinicians Say</p>
          <h2 className="sec-title">Trusted by <em>Specialists</em></h2>
          <div className="tests-grid">
            {[
              {q:"This platform has transformed how our team correlates genetic findings with imaging.",n:"Dr. Priya Sharma",r:"Maternal-Fetal Medicine Specialist",a:I.d2},
              {q:"Finally a tool that keeps the clinician in control. The reasoning layer is exactly what we needed.",n:"Dr. Michael Chen",r:"Clinical Geneticist",a:I.d1},
              {q:"The fetal echo integration has genuinely improved our diagnostic confidence.",n:"Dr. Aisha Patel",r:"Fetal Medicine Consultant",a:I.d3},
            ].map(({q,n,r,a})=>(
              <div className="test-card" key={n}>
                <div className="test-stars">{[...Array(5)].map((_,i)=><Star key={i} size={13} fill="hsl(250,60%,60%)" color="hsl(250,60%,60%)" />)}</div>
                <p className="test-quote">"{q}"</p>
                <div className="test-author">
                  <img src={a} alt={n} />
                  <div><div className="test-name">{n}</div><div className="test-role">{r}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <p className="eyebrow" style={{color:"hsl(250,68%,82%)"}}>Ready to Begin?</p>
        <h2>The Future of <em>Prenatal Care</em><br />Starts Here</h2>
        <p>Join thousands of clinicians using structured AI support to deliver better prenatal outcomes.</p>
        <div className="cta-btns">
          <button className="btn-cta" onClick={openSignup}>Get Started Free <ArrowRight size={16} /></button>
          <button className="btn-cta-g" onClick={openLogin}>Sign In</button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-logo">Prenatal <span>AI</span> Copilot</div>
              <p className="footer-desc">A structured, explainable clinical decision support platform for fetal medicine specialists.</p>
            </div>
            <div className="footer-col">
              <h5>Platform</h5>
              <ul><li><a href="#">Capabilities</a></li><li><a href="#">Safety</a></li></ul>
            </div>
            <div className="footer-col">
              <h5>Company</h5>
              <ul><li><a href="#">About</a></li><li><a href="#">Privacy</a></li></ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 Prenatal AI Copilot.</span>
            <span>For clinical professionals only.</span>
          </div>
        </div>
      </footer>
    </>
  );
}