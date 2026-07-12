import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileText, ClipboardList,
  Bell, BookOpen, Wallet, GraduationCap,
} from "lucide-react";

const navItems = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/results", label: "My Results", icon: FileText },
  { to: "/student/attendance", label: "Attendance", icon: ClipboardList },
  { to: "/student/notices", label: "Notices", icon: Bell },
  { to: "/student/library", label: "E-Library", icon: BookOpen },
  { to: "/student/fees", label: "Fee History", icon: Wallet },
];

export default function StudentSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-navy z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center">
            <GraduationCap className="text-gold w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-serif font-semibold text-sm leading-tight">Goodnews Private College</p>
            <p className="text-gold text-[10px] tracking-widest uppercase">Student Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-gold text-navy shadow-gold"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <a href="/" className="text-white/40 text-xs hover:text-white/70 transition-colors">
            ← Back to main site
          </a>
        </div>
      </aside>
    </>
  );
}