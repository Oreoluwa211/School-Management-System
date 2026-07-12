import { useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import FadeIn from "../FadeIn";

export default function SuccessScreen({ reference }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const steps = [
    { icon: "🔍", label: "Review", desc: "Our admissions team reviews your application (3–5 days)" },
    { icon: "📧", label: "Decision Email", desc: "You'll receive an email with our decision" },
    { icon: "💳", label: "Pay Fees", desc: "Complete payment via the link sent to your email" },
    { icon: "🔑", label: "Receive Login", desc: "Get your student portal login details" },
  ];

  return (
    <FadeIn className="text-center py-10 px-4 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 animate-float">
        <CheckCircle2 size={32} className="text-green-600" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-navy mb-2">Application Submitted!</h2>
      <p className="text-navy/50 mb-6">
        Thank you for applying to Goodnews Private College. Save your reference number to track your application.
      </p>

      <div className="inline-flex items-center gap-3 bg-white border border-gold/30 rounded-full px-6 py-3 mb-10 shadow-card">
        <span className="font-serif text-xl font-bold text-navy tracking-wide">{reference}</span>
        <button onClick={copy} className="text-gold-dark hover:text-gold transition-colors">
          <Copy size={18} />
        </button>
        {copied && <span className="text-xs text-green-600">Copied!</span>}
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-10 text-left">
        {steps.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.08}>
            <div className="bg-white rounded-xl2 shadow-card p-4 border border-navy/5 hover:-translate-y-1 transition-transform duration-300 h-full">
              <span className="text-2xl">{s.icon}</span>
              <h4 className="font-serif font-semibold text-navy text-sm mt-2">{s.label}</h4>
              <p className="text-xs text-navy/50 mt-1 leading-relaxed">{s.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>

      <a
        href="/"
        className="inline-block px-7 py-3 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-200"
      >
        Return to Homepage
      </a>
    </FadeIn>
  );
}