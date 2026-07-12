import FadeIn from "./FadeIn";

export default function CTABanner() {
  return (
    <section className="relative py-20 bg-gradient-to-r from-navy via-navy-light to-navy overflow-hidden">
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-gold/10 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <FadeIn>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2">
            Begin Your Journey at <span className="text-gold">Goodnews Private College</span>
          </h2>
          <p className="text-white/60 max-w-lg">
            Admissions for the 2025/2026 session are now open. Secure your child's place today.
          </p>
        </FadeIn>
        <FadeIn delay={0.1} className="flex gap-4 shrink-0">
          <a href="/apply"
            className="px-7 py-3.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-200">
            Start Application →
          </a>
          <a href="#"
            className="px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:border-gold hover:text-gold transition-all duration-200">
            Download Prospectus
          </a>
        </FadeIn>
      </div>
    </section>
  );
}