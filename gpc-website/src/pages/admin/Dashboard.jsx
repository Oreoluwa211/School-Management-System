import { useState, useEffect } from "react";
import { TrendingUp, Clock, Users, GraduationCap, FileCheck2, Wallet } from "lucide-react";
import FadeIn from "../../components/FadeIn";
import Counter from "../../components/Counter";
import api from "../../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/stats/dashboard"),
      api.get("/admissions", { params: { limit: 5, page: 1 } }),
    ])
      .then(([statsRes, appsRes]) => {
        setStats(statsRes.data);
        setRecentApplications(appsRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Active Students", value: stats.totalStudents, icon: Users, color: "bg-blue-50 text-blue-600" },
        { label: "Total Staff", value: stats.totalStaff, icon: GraduationCap, color: "bg-purple-50 text-purple-600" },
        { label: "Pending Applications", value: stats.pendingApplications, icon: FileCheck2, color: "bg-amber-50 text-amber-600" },
        { label: "Fees Collected (₦)", value: stats.feesCollected, icon: Wallet, color: "bg-green-50 text-green-600", isCurrency: true },
      ]
    : [];

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    review: "bg-purple-100 text-purple-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    fee_paid: "bg-blue-100 text-blue-700",
    enrolled: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Dashboard Overview</h1>
        <p className="text-navy/50 text-sm mt-1">Welcome back — here's what's happening at GPC today.</p>
      </FadeIn>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 animate-pulse">
                  <div className="w-11 h-11 bg-navy/5 rounded-xl2 mb-4" />
                  <div className="h-7 bg-navy/5 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-navy/5 rounded w-2/3" />
                </div>
              </FadeIn>
            ))
          : statCards.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.08}>
                <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(10,22,40,0.25)] transition-all duration-300">
                  <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center mb-4 ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <p className="text-2xl font-serif font-bold text-navy flex items-baseline gap-0.5">
                    {stat.isCurrency && "₦"}
                    <Counter target={stat.value} className="text-2xl font-serif font-bold text-navy" />
                  </p>
                  <p className="text-navy/50 text-sm mt-1">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <FadeIn className="lg:col-span-2">
          <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg font-bold text-navy">Recent Applications</h2>
              <a href="/admin/applications" className="text-sm text-gold-dark hover:text-gold font-medium transition-colors">
                View all →
              </a>
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-navy/5 flex items-center justify-between animate-pulse">
                  <div>
                    <div className="h-4 bg-navy/5 rounded w-32 mb-1" />
                    <div className="h-3 bg-navy/5 rounded w-20" />
                  </div>
                  <div className="h-6 bg-navy/5 rounded-full w-20" />
                </div>
              ))
            ) : recentApplications.length === 0 ? (
              <p className="text-navy/40 text-sm text-center py-8">No applications yet.</p>
            ) : (
              recentApplications.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-3 border-b border-navy/5 last:border-0">
                  <div>
                    <p className="font-medium text-navy text-sm">{a.first_name} {a.last_name}</p>
                    <p className="text-navy/40 text-xs">{a.class_applying_for} · {new Date(a.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[a.status] || "bg-navy/10 text-navy/50"}`}>
                    {a.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-navy rounded-xl2 shadow-card p-6 h-full">
            <h2 className="font-serif text-lg font-bold text-white mb-5 flex items-center gap-2">
              <TrendingUp size={18} className="text-gold" /> This Term
            </h2>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Current Session</span>
                  <span className="text-white font-medium">{stats?.currentSession || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Current Term</span>
                  <span className="text-white font-medium capitalize">{stats?.currentTerm?.replace("_", " ").toLowerCase() || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Result Deadline</span>
                  <span className="text-gold font-medium flex items-center gap-1">
                    <Clock size={14} />
                    {stats?.resultDeadline
                      ? new Date(stats.resultDeadline).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}