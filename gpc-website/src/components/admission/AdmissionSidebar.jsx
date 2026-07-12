import { FileCheck, Phone, Mail, MessageCircle } from "lucide-react";

const requiredDocs = [
  "Passport Photograph",
  "Birth Certificate",
  "Medical Fitness Report",
  "Last Academic Report",
];

const timeline = [
  { icon: "📝", label: "Submit Application" },
  { icon: "🔍", label: "Application Review (3–5 days)" },
  { icon: "📧", label: "Decision Email" },
  { icon: "💳", label: "Pay Admission Fees" },
  { icon: "🔑", label: "Receive Login Details" },
  { icon: "🎓", label: "Resumption" },
];

export default function AdmissionSidebar() {
  return (
    <div className="space-y-6">
      {/* Required documents */}
      <div className="bg-white rounded-xl2 shadow-card p-6 border border-navy/5">
        <h3 className="font-serif font-semibold text-navy mb-4 flex items-center gap-2">
          <FileCheck size={18} className="text-gold" /> Required Documents
        </h3>
        <ul className="space-y-2">
          {requiredDocs.map((doc) => (
            <li key={doc} className="text-sm text-navy/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
              {doc}
            </li>
          ))}
        </ul>
      </div>

      {/* Process timeline */}
      <div className="bg-white rounded-xl2 shadow-card p-6 border border-navy/5">
        <h3 className="font-serif font-semibold text-navy mb-4">Admission Process</h3>
        <ol className="space-y-3">
          {timeline.map((step, i) => (
            <li key={step.label} className="flex items-start gap-3">
              <span className="text-lg shrink-0">{step.icon}</span>
              <span className="text-sm text-navy/60 leading-snug">{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Contact box */}
      <div className="bg-navy rounded-xl2 shadow-card p-6">
        <h3 className="font-serif font-semibold text-white mb-4">Need Help?</h3>
        <div className="space-y-3 text-sm">
          <a href="tel:+2348000000000" className="flex items-center gap-3 text-white/70 hover:text-gold transition-colors">
            <Phone size={16} className="text-gold shrink-0" /> +234 800 000 0000
          </a>
          <a href="mailto:admissions@goodnewscollege.edu.ng" className="flex items-center gap-3 text-white/70 hover:text-gold transition-colors">
            <Mail size={16} className="text-gold shrink-0" /> admissions@goodnewscollege.edu.ng
          </a>
          <a href="https://wa.me/2348000000000" className="flex items-center gap-3 text-white/70 hover:text-gold transition-colors">
            <MessageCircle size={16} className="text-gold shrink-0" /> Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}