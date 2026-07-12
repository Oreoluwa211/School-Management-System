import { GraduationCap } from "lucide-react";
import { FaFacebookF, FaXTwitter, FaInstagram, FaYoutube } from "react-icons/fa6";

const quickLinks = ["About", "News", "Activities", "Anthem", "Contact"];
const portals = ["Student Portal", "Staff Portal", "Admin Dashboard", "E-Library", "Fee Payment"];

export default function Footer() {
  return (
    <footer className="bg-navy-deep pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center">
              <GraduationCap className="text-gold w-5 h-5" />
            </div>
            <p className="text-white font-serif font-semibold">Goodnews Private College</p>
          </div>
          <p className="text-white/40 text-sm leading-relaxed mb-1">Excellence · Faith · Integrity</p>
          <p className="text-white/40 text-sm leading-relaxed">
            Nurturing tomorrow's leaders through quality education rooted in strong values.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((l) => (
              <li key={l}>
                <a href="#" className="text-white/50 text-sm hover:text-gold transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Portals</h4>
          <ul className="space-y-2">
            {portals.map((l) => (
              <li key={l}>
                <a href="#" className="text-white/50 text-sm hover:text-gold transition-colors">{l}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-white/50 text-sm">
            <li>123 College Road, Ibadan, Oyo State</li>
            <li>+234 800 000 0000</li>
            <li>info@goodnewscollege.edu.ng</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-white/40 text-sm">© 2025 Goodnews Private College. All rights reserved.</p>
        <div className="flex gap-3">
          {[FaFacebookF, FaXTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
            <a key={i}
              href="#"
              className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-gold hover:border-gold hover:-translate-y-1 transition-all duration-200">
              <Icon size={16} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}