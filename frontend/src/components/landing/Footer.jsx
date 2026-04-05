export default function Footer() {
  return (
    <footer className="bg-[hsl(250,20%,94%)] border-t border-[hsl(250,20%,90%)] mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* ================= TOP GRID ================= */}
        <div className="grid md:grid-cols-4 gap-12 text-sm">

          {/* BRAND */}
          <div>
            <h3 className="text-[hsl(250,25%,25%)] font-semibold text-base mb-4">
              Prenatal AI Copilot
            </h3>
            <p className="text-[hsl(250,15%,50%)] leading-relaxed">
              A Clinical Decision Support platform designed to support
              structured, explainable prenatal genetic and imaging
              correlation in high-stakes clinical settings.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-[hsl(250,25%,25%)] font-semibold mb-4">
              Company
            </h4>
            <ul className="space-y-3 text-[hsl(250,15%,50%)]">
              {["About", "Blogs", "Careers", "Contact"].map((item) => (
                <li
                  key={item}
                  className="hover:text-[hsl(250,60%,70%)] transition cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="text-[hsl(250,25%,25%)] font-semibold mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-[hsl(250,15%,50%)]">
              {[
                "Patient Dashboard",
                "Secure Case Review",
                "Report Upload",
                "Clinical Summaries",
              ].map((item) => (
                <li
                  key={item}
                  className="hover:text-[hsl(250,60%,70%)] transition cursor-pointer"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* COMPLIANCE */}
          <div>
            <h4 className="text-[hsl(250,25%,25%)] font-semibold mb-4">
              Compliance & Safety
            </h4>
            <p className="text-[hsl(250,15%,50%)] leading-relaxed text-sm">
              This system is a Clinical Decision Support Tool.
              It does not provide diagnosis or treatment recommendations.
              Final clinical decisions remain the responsibility
              of the treating clinician.
            </p>
          </div>

        </div>

        {/* ================= DIVIDER ================= */}
        <div className="mt-14 border-t border-[hsl(250,20%,90%)]" />

        {/* ================= BOTTOM BAR ================= */}
        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[hsl(250,15%,50%)]">

          <p>
            © {new Date().getFullYear()} Prenatal AI Copilot. All rights reserved.
          </p>

          <div className="flex gap-6">
            <span className="hover:text-[hsl(250,60%,70%)] transition cursor-pointer">
              Safety
            </span>
            <span className="hover:text-[hsl(250,60%,70%)] transition cursor-pointer">
              Auditability
            </span>
            <span className="hover:text-[hsl(250,60%,70%)] transition cursor-pointer">
              Transparency
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
