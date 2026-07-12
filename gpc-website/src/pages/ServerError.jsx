import { motion } from "framer-motion";
import { ServerCrash } from "lucide-react";

export default function ServerError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy via-navy-light to-navy-deep px-4">
      <div
        className="absolute inset-0 opacity-[0.06] animate-gridMove"
        style={{
          backgroundImage:
            "linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10"
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <ServerCrash className="text-amber-400 w-10 h-10" />
        </div>
        <h1 className="font-serif text-8xl font-bold text-amber-400 mb-2">500</h1>
        <h2 className="font-serif text-2xl font-bold text-white mb-3">Server Error</h2>
        <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
          Something went wrong on our end. Please try again in a moment.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}