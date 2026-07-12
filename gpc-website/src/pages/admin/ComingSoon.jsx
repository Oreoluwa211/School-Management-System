import { Construction } from "lucide-react";
import FadeIn from "../../components/FadeIn";

export default function ComingSoon({ title }) {
  return (
    <FadeIn className="flex flex-col items-center justify-center text-center py-24">
      <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <Construction className="text-gold-dark" size={28} />
      </div>
      <h1 className="font-serif text-2xl font-bold text-navy mb-2">{title}</h1>
      <p className="text-navy/50 max-w-sm">This section is coming in an upcoming phase. Stay tuned!</p>
    </FadeIn>
  );
}