import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ClipboardList, Bell, TrendingUp, Clock } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import Counter from "../../components/Counter";

const categoryEmojis = {
  general: "📢", academic: "📚", event: "🎉",
  fees: "💰", urgent: "🚨", birthday: "🎂", meeting: "📅",
};

function gradeColor(grade) {
  if (grade === "A") return "text-green-600";
  if (grade === "B") return "text-blue-600";
  if (grade === "C") return "text-navy";
  if (grade === "D") return "text-amber-600";
  return "text-red-500";
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student-portal/dashboard")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">
          Welcome, {data?.student?.first_name || "Student"} 👋
        </h1>
        <p className="text-navy/50 text-sm mt-1">
          {data?.student?.class
            ? `${data.student.class.name} ${data.student.class.arm} · ${data.currentSession}`
            : "Loading your profile..."}
        </p>
      </FadeIn>

      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          {
            label: "Attendance Rate",
            value: data?.attendance?.percent || 0,
            suffix: "%",
            icon: ClipboardList,
            color: "bg-green-50 text-green-600",
            link: "/student/attendance",
          },
          {
            label: "Subjects This Term",
            value: data?.recentResults?.length || 0,
            icon: FileText,
            color: "bg-blue-50 text-blue-600",
            link: "/student/results",
          },
          {
            label: "New Notices",
            value: data?.notices?.length || 0,
            icon: Bell,
            color: "bg-gold/10 text-gold-dark",
            link: "/student/notices",
          },
        ].map((stat, i) => (
          <FadeIn key={stat.label} delay={i * 0.08}>
            <Link to={stat.link} className="block group">
              <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-15px_rgba(10,22,40,0.25)] transition-all duration-300">
                <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center mb-4 ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                {loading ? (
                  <div className="h-7 bg-navy/5 rounded w-1/2 mb-2 animate-pulse" />
                ) : (
                  <p className="text-2xl font-serif font-bold text-navy">
                    <Counter target={stat.value} className="text-2xl font-serif font-bold text-navy" />
                    {stat.suffix}
                  </p>
                )}
                <p className="text-navy/50 text-sm mt-1">{stat.label}</p>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent results */}
        <FadeIn className="lg:col-span-2">
          <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6 h-full">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg font-bold text-navy">Recent Results</h2>
              <Link to="/student/results" className="text-sm text-gold-dark hover:text-gold font-medium transition-colors">
                View all →
              </Link>
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="py-3 border-b border-navy/5 flex justify-between animate-pulse">
                  <div className="h-4 bg-navy/5 rounded w-1/3" />
                  <div className="h-4 bg-navy/5 rounded w-16" />
                </div>
              ))
            ) : data?.recentResults?.length === 0 ? (
              <p className="text-navy/40 text-sm text-center py-8">No results yet this term.</p>
            ) : (
              data?.recentResults?.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-3 border-b border-navy/5 last:border-0">
                  <div>
                    <p className="font-medium text-navy text-sm">{r.subject.name}</p>
                    <p className="text-navy/40 text-xs">CA: {Number(r.ca_score)} · Exam: {Number(r.exam_score)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-navy">{Number(r.total_score)}</p>
                    <p className={`text-xs font-bold ${gradeColor(r.grade)}`}>{r.grade}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </FadeIn>

        {/* Term info + attendance */}
        <div className="space-y-5">
          <FadeIn delay={0.05}>
            <div className="bg-navy rounded-xl2 shadow-card p-6">
              <h2 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-gold" /> This Term
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
                <div className="space-y-3 text-sm">
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

          <FadeIn delay={0.1}>
            <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
              <h2 className="font-serif text-base font-bold text-navy mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-gold" /> Attendance
              </h2>
              {loading ? (
                <div className="h-2 bg-navy/5 rounded-full animate-pulse" />
              ) : (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-navy/60">{data?.attendance?.present} present of {data?.attendance?.total} days</span>
                    <span className="font-bold text-navy">{data?.attendance?.percent}%</span>
                  </div>
                  <div className="w-full bg-navy/5 rounded-full h-2.5">
                    <div
                      className="bg-gold h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${data?.attendance?.percent || 0}%` }}
                    />
                  </div>
                  {data?.attendance?.percent < 75 && (
                    <p className="text-xs text-red-500 mt-2">⚠ Below 75% — attendance is low</p>
                  )}
                </>
              )}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Notices */}
      {!loading && data?.notices?.length > 0 && (
        <FadeIn>
          <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-lg font-bold text-navy">Latest Notices</h2>
              <Link to="/student/notices" className="text-sm text-gold-dark hover:text-gold font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.notices.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl2 bg-[#faf8f3] border border-navy/5">
                  <span className="text-xl">{categoryEmojis[n.category] || "📢"}</span>
                  <div>
                    <p className="text-sm font-medium text-navy leading-snug">{n.title}</p>
                    <p className="text-xs text-navy/40 mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}