import { useState, useEffect } from "react";
import { Users, BookOpen, Clock, Bell, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import Counter from "../../components/Counter";

const categoryEmojis = {
  general: "📢", academic: "📚", event: "🎉",
  fees: "💰", urgent: "🚨", birthday: "🎂", meeting: "📅",
};

export default function StaffDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/staff-portal/dashboard")
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = data ? [
    {
      label: "Students in My Class",
      value: data.classStudentCount,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      link: "/staff/attendance",
    },
    {
      label: "Draft Lesson Notes",
      value: data.pendingLessonNotes,
      icon: BookOpen,
      color: "bg-purple-50 text-purple-600",
      link: "/staff/lesson-notes",
    },
    {
      label: "Subject Assignments",
      value: data.staff?.subject_assignments?.length || 0,
      icon: TrendingUp,
      color: "bg-gold/10 text-gold-dark",
      link: "/staff/results",
    },
  ] : [];

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">
          Welcome, {data?.staff?.first_name || "Staff"} 👋
        </h1>
        <p className="text-navy/50 text-sm mt-1">
          {data?.staff?.designation} · {data?.staff?.department}
          {data?.staff?.class && ` · Class Teacher — ${data.staff.class.name} ${data.staff.class.arm}`}
        </p>
      </FadeIn>

      <div className="grid sm:grid-cols-3 gap-5">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
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
                <Link to={stat.link} className="block group">
                  <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-15px_rgba(10,22,40,0.25)] transition-all duration-300">
                    <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center mb-4 ${stat.color}`}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-2xl font-serif font-bold text-navy">
                      <Counter target={stat.value} className="text-2xl font-serif font-bold text-navy" />
                    </p>
                    <p className="text-navy/50 text-sm mt-1">{stat.label}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Term info */}
        <FadeIn>
          <div className="bg-navy rounded-xl2 shadow-card p-6 h-full">
            <h2 className="font-serif text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Clock size={18} className="text-gold" /> Current Term
            </h2>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-white/10 rounded w-1/2" />
                    <div className="h-4 bg-white/10 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Session</span>
                  <span className="text-white font-medium">{data?.currentSession}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Term</span>
                  <span className="text-white font-medium capitalize">
                    {data?.currentTerm?.replace("_", " ").toLowerCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Result Deadline</span>
                  <span className="text-gold font-medium">
                    {data?.resultDeadline
                      ? new Date(data.resultDeadline).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Subject assignments */}
        <FadeIn delay={0.05}>
          <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6 h-full">
            <h2 className="font-serif text-lg font-bold text-navy mb-4">My Subjects</h2>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 bg-navy/5 rounded-xl2" />
                ))}
              </div>
            ) : data?.staff?.subject_assignments?.length === 0 ? (
              <p className="text-navy/40 text-sm">No subjects assigned yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data?.staff?.subject_assignments?.map((a) => (
                  <span key={a.id} className="px-3 py-1.5 rounded-xl2 bg-gold/10 text-gold-dark text-xs font-medium">
                    {a.subject.name}
                    <span className="text-gold-dark/60 ml-1">
                      · {a.class.name} {a.class.arm}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Recent notices */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6 h-full">
            <h2 className="font-serif text-lg font-bold text-navy mb-4 flex items-center gap-2">
              <Bell size={18} className="text-gold" /> Notices
            </h2>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-navy/5 rounded-xl2" />
                ))}
              </div>
            ) : data?.notices?.length === 0 ? (
              <p className="text-navy/40 text-sm">No notices.</p>
            ) : (
              <div className="space-y-3">
                {data?.notices?.map((n) => (
                  <div key={n.id} className="flex items-start gap-2 py-2 border-b border-navy/5 last:border-0">
                    <span className="text-base">{categoryEmojis[n.category] || "📢"}</span>
                    <div>
                      <p className="text-navy text-sm font-medium leading-snug">{n.title}</p>
                      <p className="text-navy/40 text-xs">{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}