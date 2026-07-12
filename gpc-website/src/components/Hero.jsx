import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-br from-navy via-navy-light to-navy-deep overflow-hidden pt-24">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.07] animate-gridMove"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-12 items-center w-full py-16">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold tracking-widest uppercase mb-6">
            Admissions Open — 2025/2026 Session
          </span>

          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            Shaping Futures, <br />
            <span className="text-gold">Building Leaders</span>
          </h1>

          <p className="text-white/70 text-lg max-w-md mb-8 leading-relaxed">
            At Goodnews Private College, we nurture academic excellence,
            strong character, and faith — preparing every student for a
            future of purpose and impact.
          </p>

          <div className="flex flex-wrap gap-4">
            <a href="/apply"
              className="px-7 py-3.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-200">
              Apply for Admission
            </a>
            <a href="/about"
              className="px-7 py-3.5 rounded-full border border-white/30 text-white font-semibold hover:border-gold hover:text-gold transition-all duration-200">
              Discover Our School
            </a>
          </div>
        </motion.div>

        {/* Right image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="relative rounded-xl2 overflow-hidden shadow-card aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80"
              alt="GPC students"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl2 shadow-card px-6 py-4 animate-float">
            <p className="font-serif text-2xl font-bold text-navy">22+</p>
            <p className="text-xs text-navy/60 uppercase tracking-wide">Years of Excellence</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50"
      >
        <ChevronDown size={28} />
      </motion.div>
    </section>
  );
}