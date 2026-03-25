import { useState } from "react";
import Navbar from "../../components/landing/Navbar";
import Footer from "../../components/landing/Footer";
import Disclaimer from "../../components/landing/Disclaimer";
import Login from "../Auth/Login";
import Signup from "../Auth/Signup";

import {
  Stethoscope,
  Scan,
  Dna,
  ShieldCheck,
  HeartPulse,
  FileText,
  ClipboardList,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  return (
    <>
      <Navbar
        onLogin={() => setShowLogin(true)}
        onSignup={() => setShowSignup(true)}
      />

      {/* =====================================================
          HERO SECTION
      ===================================================== */}
      <section className="relative h-[72vh] max-h-[800px] overflow-hidden">
        {/* Background */}
        <img
          src="https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?auto=format&fit=crop&w=2400&q=80"
          alt="Prenatal imaging"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(250,25%,25%)]/90 via-[hsl(250,25%,25%)]/70 to-[hsl(250,25%,25%)]/40" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full grid lg:grid-cols-2 items-start">
          <div className="pt-24 lg:pt-28 animate-fadeIn">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-[hsl(250,45%,92%)] text-[hsl(250,60%,50%)] text-xs font-medium tracking-wide">
              CLINICAL DECISION SUPPORT PLATFORM
            </span>

            <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-tight max-w-xl">
              Prenatal AI Copilot
            </h1>

            <p className="mt-5 text-base md:text-lg text-[hsl(250,20%,94%)] max-w-xl leading-relaxed">
              A structured, explainable, and audit-safe platform supporting
              clinicians in correlating prenatal genetic findings with
              ultrasound and fetal echocardiography.
            </p>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setShowSignup(true)}
                className="bg-gradient-to-r from-[hsl(250,60%,70%)] to-[hsl(250,60%,50%)]
                text-white px-7 py-3.5 rounded-xl text-sm font-semibold shadow-md
                hover:opacity-90 transition"
              >
                Get Started
              </button>

              <button
                onClick={() => setShowLogin(true)}
                className="border border-white/50 text-white px-7 py-3.5 rounded-xl
                text-sm hover:bg-white/10 transition"
              >
                Login
              </button>
            </div>
          </div>

          {/* Right visual */}
          <div className="hidden lg:flex justify-end pt-32 animate-slideUp">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/20 w-[360px]">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1600&q=80"
                alt="Ultrasound screen"
                className="rounded-2xl"
              />
              <p className="mt-3 text-[11px] text-[hsl(250,20%,94%)]">
                Structured imaging correlation • Audit-safe outputs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CLINICAL ICON STRIP
      ===================================================== */}
      <section className="bg-[hsl(40,33%,98%)] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-md border border-[hsl(250,20%,90%)]
            flex flex-wrap md:flex-nowrap justify-between items-center gap-6 px-8 py-6">

            {[
              { icon: Stethoscope, label: "Clinician-Led" },
              { icon: Scan, label: "Prenatal Imaging" },
              { icon: Dna, label: "Genetic Correlation" },
              { icon: ShieldCheck, label: "Audit-Safe" },
              { icon: HeartPulse, label: "Fetal Care" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-[hsl(250,25%,25%)]">
                <div className="bg-[hsl(250,45%,92%)] p-3 rounded-xl">
                  <Icon className="text-[hsl(250,60%,50%)]" size={24} />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ABOUT SECTION
      ===================================================== */}
      <section className="bg-[hsl(40,33%,98%)] py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-slideUp">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(250,25%,25%)] mb-6">
              Built for Prenatal & Fetal Medicine
            </h2>

            <p className="text-[hsl(250,15%,50%)] leading-relaxed mb-6">
              Prenatal AI Copilot is purpose-built for fetal medicine specialists,
              maternal-fetal medicine physicians, and clinical geneticists working
              in high-stakes prenatal contexts.
            </p>

            <p className="text-[hsl(250,15%,50%)] leading-relaxed mb-6">
              The platform structures genetic findings, imaging observations, and
              gestational context into a single explainable workflow.
            </p>

            <p className="text-[hsl(250,15%,50%)] leading-relaxed">
              No diagnosis is made by the system. Final decisions remain with
              the clinician.
            </p>
          </div>

          <div className="relative animate-slideUp">
            <img
              src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=1600&q=80"
              alt="Clinical consultation"
              className="rounded-3xl shadow-xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl
              shadow-lg border border-[hsl(250,20%,90%)]">
              <p className="text-sm font-medium text-[hsl(250,25%,25%)]">
                Structured • Explainable • Safe
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          PLATFORM CAPABILITIES
      ===================================================== */}
      <section className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center
            text-[hsl(250,25%,25%)] mb-20">
            Platform Capabilities
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: ClipboardList,
                title: "Case-Centric Workflow",
                desc:
                  "Create structured prenatal cases combining genetic results, imaging findings, and gestational context.",
              },
              {
                icon: FileText,
                title: "Targeted Imaging Guidance",
                desc:
                  "Guide ultrasound and fetal echocardiography review using gene-specific prenatal visibility models.",
              },
              {
                icon: Shield,
                title: "Explainable Clinical Reasoning",
                desc:
                  "Transparent rule-based reasoning aligned with prenatal-aware ACMG principles.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[hsl(250,20%,94%)] border border-[hsl(250,20%,90%)]
                rounded-3xl p-10 hover:shadow-xl transition animate-slideUp"
              >
                <div className="bg-[hsl(250,45%,92%)] w-12 h-12 rounded-xl
                  flex items-center justify-center mb-6">
                  <Icon className="text-[hsl(250,60%,50%)]" />
                </div>

                <h3 className="text-xl font-semibold text-[hsl(250,25%,25%)] mb-4">
                  {title}
                </h3>

                <p className="text-sm text-[hsl(250,15%,50%)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CLINICAL SAFETY FRAMEWORK
      ===================================================== */}
      <section className="bg-[hsl(40,33%,98%)] py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(250,25%,25%)] mb-6">
              Clinical Safety Framework
            </h2>
            <p className="text-[hsl(250,15%,50%)] leading-relaxed">
              Prenatal AI Copilot is designed as a Clinical Decision Support
              system with explicit safeguards for clinician control,
              transparency, and auditability.
            </p>
          </div>

          <div className="space-y-14">
            {[
              {
                icon: ShieldCheck,
                title: "No Autonomous Diagnosis",
                desc:
                  "The system does not generate diagnoses or treatment decisions.",
              },
              {
                icon: FileText,
                title: "Explainable Rule-Based Logic",
                desc:
                  "All reasoning is transparent and aligned with prenatal ACMG logic.",
              },
              {
                icon: ClipboardList,
                title: "Full Audit & Traceability",
                desc:
                  "Every decision point is logged for retrospective review.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title}>
                <div className="grid md:grid-cols-3 gap-10 items-start">
                  <div className="flex items-center gap-4">
                    <div className="bg-[hsl(250,45%,92%)] p-3 rounded-xl">
                      <Icon className="text-[hsl(250,60%,50%)]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[hsl(250,25%,25%)]">
                      {title}
                    </h3>
                  </div>
                  <p className="md:col-span-2 text-[hsl(250,15%,50%)] leading-relaxed">
                    {desc}
                  </p>
                </div>
                <div className="mt-10 border-t border-[hsl(250,20%,90%)]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          DISCLAIMER
      ===================================================== */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Disclaimer />
        </div>
      </section>

      {/* ================= AUTH MODALS ================= */}
                 <Login
  isOpen={showLogin}
  onClose={() => setShowLogin(false)}
  onSignup={() => {
    setShowLogin(false);
    setShowSignup(true);
  }}

/>

<Signup
  isOpen={showSignup}
  onClose={() => setShowSignup(false)}
  onLogin={() => {
    setShowSignup(false);
    setShowLogin(true);
  }}
/>



      <Footer />
    </>
  );
}
