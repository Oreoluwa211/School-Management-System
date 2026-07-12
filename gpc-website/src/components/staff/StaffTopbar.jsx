import { Menu, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StaffTopbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-navy/5 px-4 md:px-8 h-16 flex items-center justify-between">
      <button onClick={onMenuClick} className="lg:hidden text-navy">
        <Menu size={24} />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-navy/70">
          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
            <User size={16} className="text-gold-dark" />
          </div>
          <span className="hidden sm:inline font-medium">{user?.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium text-navy/60 border border-navy/10 hover:border-red-300 hover:text-red-500 transition-all duration-200"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}