import { Check } from "lucide-react";

const steps = ["Student Info", "Parent / Guardian", "Documents", "Review & Submit"];

export default function Stepper({ current }) {
  return (
    <div className="flex items-center justify-between mb-10">
      {steps.map((step, i) => {
        const isCompleted = i < current;
        const isActive = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-gold text-navy"
                    : isActive
                    ? "bg-navy text-white ring-4 ring-gold/30"
                    : "bg-navy/10 text-navy/40"
                }`}
              >
                {isCompleted ? <Check size={18} /> : i + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center max-w-[80px] hidden sm:block ${
                  isActive ? "text-navy" : "text-navy/40"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-[2px] mx-2 mb-5 sm:mb-6 rounded-full overflow-hidden bg-navy/10">
                <div
                  className={`h-full bg-gold transition-all duration-500 ${
                    isCompleted ? "w-full" : "w-0"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}