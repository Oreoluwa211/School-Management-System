import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, FileCheck2, Users, GraduationCap as StaffIcon,
  BookOpen, Megaphone, Wallet, Settings, GraduationCap,
} from "lucide-react";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/applications", label: "Applications", icon: FileCheck2 },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/staff", label: "Staff", icon: StaffIcon },
  { to: "/admin/results", label: "Results", icon: BookOpen },
  { to: "/admin/notices", label: "Notices", icon: Megaphone },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-navy z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center">
            <GraduationCap className="text-gold w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-serif font-semibold text-sm leading-tight">Goodnews Private College</p>
            <p className="text-gold text-[10px] tracking-widest uppercase">Admin Panel</p>
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
      </aside>
    </>
  );
}