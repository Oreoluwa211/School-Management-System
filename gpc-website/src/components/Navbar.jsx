import { useState, useEffect } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "About", href: "/about" },
  { name: "News", href: "/news" },
  { name: "Activities", href: "/activities" },
  { name: "Anthem", href: "/anthem" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-navy/95 backdrop-blur-md shadow-card py-2" : "bg-navy/80 py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center group-hover:rotate-6 transition-transform duration-300">
            <GraduationCap className="text-gold w-6 h-6" />
          </div>
          <div className="leading-tight">
            <p className="text-white font-serif font-semibold text-lg tracking-wide">
              Goodnews Private College
            </p>
            <p className="text-gold text-xs tracking-[0.2em] uppercase">
              Excellence · Faith · Integrity
            </p>
          </div>
        </a>

        {/* Center links */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a key={link.name}
              href={link.href}
              className="relative text-white/80 text-sm font-medium hover:text-gold transition-colors duration-200 group">
              {link.name}
              <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-gold transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <a href="/staff/login" className="px-4 py-2 rounded-full text-sm font-medium text-white/90 border border-white/20 hover:border-gold hover:text-gold transition-all duration-200">
            Staff Login
          </a>
          <a href="/student/login" className="px-4 py-2 rounded-full text-sm font-medium text-white/90 border border-white/20 hover:border-gold hover:text-gold transition-all duration-200">
            Student Login
          </a>
          <a href="/apply" className="px-5 py-2 rounded-full text-sm font-semibold bg-gold text-navy shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-200">
            Apply Now
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-navy-light overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a key={link.name}
                  href={link.href}
                  className="text-white/80 hover:text-gold transition-colors text-base"
                  onClick={() => setOpen(false)}>
                  {link.name}
                </a>
              ))}
              <div className="h-px bg-white/10 my-2" />
              <a href="/staff/login" className="text-white/80 hover:text-gold transition-colors">
                Staff Login
              </a>
              <a href="/student/login" className="text-white/80 hover:text-gold transition-colors">
                Student Login
              </a>
              <a href="/apply" className="text-center px-5 py-3 rounded-full font-semibold bg-gold text-navy shadow-gold hover:bg-gold-light transition-all">
                Apply Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}