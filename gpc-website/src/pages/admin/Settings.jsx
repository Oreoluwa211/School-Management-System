import { useState } from "react";
import { Save, Key, Bell, Shield } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwError, setPwError] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPwError("New password must be at least 8 characters");
      return;
    }

    setPwLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPwSuccess(
        "Password changed successfully. Please log in again."
      );
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPwError(
        err.response?.data?.message || "Failed to change password"
      );
    } finally {
      setPwLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl2 border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200";
  const labelClass = "block text-sm font-medium text-navy/70 mb-1.5";

  return (
    <div className="space-y-8 max-w-2xl">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">
          Settings
        </h1>
        <p className="text-navy/50 text-sm mt-1">
          Manage your account and system preferences.
        </p>
      </FadeIn>

      {/* Account info */}
      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Shield size={18} className="text-gold" /> Account Information
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-navy/5">
              <span className="text-navy/50">Email</span>
              <span className="font-medium text-navy">{user?.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-navy/5">
              <span className="text-navy/50">Role</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold-dark capitalize">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-navy/50">System</span>
              <span className="font-medium text-navy">
                Goodnews Private College SMS
              </span>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Change password */}
      <FadeIn delay={0.08}>
        <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Key size={18} className="text-gold" /> Change Password
          </h2>

          {pwSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl2 px-4 py-3 text-sm text-green-700 mb-4">
              {pwSuccess}
            </div>
          )}
          {pwError && (
            <div className="bg-red-50 border border-red-200 rounded-xl2 px-4 py-3 text-sm text-red-600 mb-4">
              {pwError}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={labelClass}>Current Password</label>
              <input
                type="password"
                className={inputClass}
                value={passwords.currentPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    currentPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>New Password</label>
              <input
                type="password"
                className={inputClass}
                value={passwords.newPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    newPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className={labelClass}>Confirm New Password</label>
              <input
                type="password"
                className={inputClass}
                value={passwords.confirmPassword}
                onChange={(e) =>
                  setPasswords({
                    ...passwords,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>
            <button
              type="submit"
              disabled={pwLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 disabled:opacity-60 transition-all duration-200"
            >
              <Save size={16} />
              {pwLoading ? "Saving..." : "Update Password"}
            </button>
          </form>
        </div>
      </FadeIn>

      {/* System info */}
      <FadeIn delay={0.12}>
        <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
          <h2 className="font-serif text-lg font-bold text-navy mb-4 flex items-center gap-2">
            <Bell size={18} className="text-gold" /> System Information
          </h2>
          <div className="space-y-2 text-sm">
            {[
              ["School Name", "Goodnews Private College"],
              ["System Version", "1.0.0"],
              ["Database", "PostgreSQL (Supabase)"],
              ["Backend", "Node.js + Express + TypeScript"],
              ["Frontend", "React + Vite + Tailwind CSS"],
              ["Deployed", "Render (API) + Vercel (Frontend)"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b border-navy/5 last:border-0"
              >
                <span className="text-navy/50">{label}</span>
                <span className="font-medium text-navy text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}