import { useState, useEffect } from "react";
import { Megaphone, Pin } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";

const categoryEmojis = {
  general: "📢", academic: "📚", event: "🎉",
  fees: "💰", urgent: "🚨", birthday: "🎂", meeting: "📅",
};

const categoryColors = {
  general: "bg-navy/5 text-navy/60",
  academic: "bg-blue-50 text-blue-700",
  event: "bg-purple-50 text-purple-700",
  fees: "bg-green-50 text-green-700",
  urgent: "bg-red-50 text-red-600",
  birthday: "bg-pink-50 text-pink-700",
  meeting: "bg-amber-50 text-amber-700",
};

export default function MyNotices() {
  const [notices, setNotices] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student-portal/notices")
      .then(({ data }) => setNotices(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pinned = notices.filter(
    (n) => n.pin_until && new Date(n.pin_until) > new Date()
  );
  const regular = notices.filter(
    (n) => !n.pin_until || new Date(n.pin_until) <= new Date()
  );

  const NoticeCard = ({ notice }) => {
    const isPinned = notice.pin_until && new Date(notice.pin_until) > new Date();
    const isExpanded = expanded === notice.id;

    return (
      <div
        className={`bg-white rounded-xl2 shadow-card border transition-all duration-300 cursor-pointer ${
          isPinned ? "border-gold/30" : "border-navy/5"
        } hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(10,22,40,0.2)]`}
        onClick={() => setExpanded(isExpanded ? null : notice.id)}
      >
        <div className="p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{categoryEmojis[notice.category] || "📢"}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${categoryColors[notice.category]}`}>
                  {notice.category}
                </span>
                {isPinned && (
                  <span className="flex items-center gap-1 text-[10px] text-gold-dark font-semibold">
                    <Pin size={10} /> Pinned
                  </span>
                )}
              </div>
              <h3 className="font-serif font-semibold text-navy leading-snug">{notice.title}</h3>
              <p className="text-navy/40 text-xs mt-1">
                {new Date(notice.created_at).toLocaleDateString()}
              </p>
              <p className={`text-navy/60 text-sm mt-2 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                {notice.content}
              </p>
              {!isExpanded && notice.content.length > 120 && (
                <p className="text-gold-dark text-xs font-medium mt-1">Read more →</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Notices</h1>
        <p className="text-navy/50 text-sm mt-1">School announcements and updates for students.</p>
      </FadeIn>

      {loading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <FadeIn key={i}>
            <div className="bg-white rounded-xl2 shadow-card p-5 animate-pulse border border-navy/5">
              <div className="h-5 bg-navy/5 rounded w-2/3 mb-3" />
              <div className="h-4 bg-navy/5 rounded w-full mb-2" />
              <div className="h-4 bg-navy/5 rounded w-1/2" />
            </div>
          </FadeIn>
        ))
      ) : notices.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5">
            <Megaphone size={32} className="mx-auto mb-3 text-navy/20" />
            <p className="text-navy/40 text-sm">No notices at the moment.</p>
          </div>
        </FadeIn>
      ) : (
        <>
          {pinned.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gold-dark uppercase tracking-widest flex items-center gap-1">
                <Pin size={12} /> Pinned
              </p>
              {pinned.map((n, i) => (
                <FadeIn key={n.id} delay={i * 0.04}>
                  <NoticeCard notice={n} />
                </FadeIn>
              ))}
            </div>
          )}
          {regular.length > 0 && (
            <div className="space-y-3">
              {pinned.length > 0 && (
                <p className="text-xs font-semibold text-navy/40 uppercase tracking-widest">All Notices</p>
              )}
              {regular.map((n, i) => (
                <FadeIn key={n.id} delay={i * 0.04}>
                  <NoticeCard notice={n} />
                </FadeIn>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}