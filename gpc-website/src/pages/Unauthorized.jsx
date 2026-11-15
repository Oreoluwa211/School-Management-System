import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldOff } from "lucide-react";

export default function Unauthorized() {
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
        <img src="/logo.png" alt="GPC" className="w-20 h-20 object-contain mx-auto mb-6 opacity-80" />
        <h1 className="font-serif text-8xl font-bold text-red-400 mb-2">403</h1>
        <h2 className="font-serif text-2xl font-bold text-white mb-3">Access Denied</h2>
        <p className="text-white/50 text-sm mb-8 max-w-sm mx-auto">
          You don't have permission to access this page. Please log in with the correct account.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="px-6 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200">
            Go to Login
          </Link>
          <Link to="/" className="px-6 py-2.5 rounded-full border border-white/20 text-white font-semibold hover:border-gold hover:text-gold transition-all duration-200">
            Go Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}