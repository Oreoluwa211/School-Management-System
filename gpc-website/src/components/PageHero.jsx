import { motion } from "framer-motion";

export default function PageHero({ title, subtitle }) {
  return (
    <section className="relative pt-36 pb-20 bg-gradient-to-br from-navy via-navy-light to-navy-deep overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] animate-gridMove"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute -top-24 right-0 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-4xl mx-auto px-4 md:px-8 text-center"
      >
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-3">{title}</h1>
        {subtitle && <p className="text-white/60 text-lg max-w-xl mx-auto">{subtitle}</p>}
      </motion.div>
    </section>
  );
}