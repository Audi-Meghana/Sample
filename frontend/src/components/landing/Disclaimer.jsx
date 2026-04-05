import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 flex gap-4">
      
      {/* Icon */}
      <div className="mt-1">
        <AlertTriangle className="text-yellow-600" size={28} />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Clinical Decision Support Disclaimer
        </h3>

        <p className="text-sm text-yellow-800 leading-relaxed mb-2">
          Prenatal AI Copilot is a <strong>Clinical Decision Support (CDS)</strong> tool.
          It is designed to assist clinicians by organizing and presenting
          prenatal genetic and imaging information in a structured manner.
        </p>

        <p className="text-sm text-yellow-800 leading-relaxed mb-2">
          This system <strong>does not provide medical diagnosis</strong>,
          does not replace professional clinical judgment, and should not
          be used as the sole basis for medical decision-making.
        </p>

        <p className="text-sm text-yellow-800 leading-relaxed">
          All final interpretations, clinical decisions, and patient
          counseling remain the responsibility of the treating clinician.
        </p>
      </div>

    </div>
  );
}
