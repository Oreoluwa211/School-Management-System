import { useState, useEffect, useCallback } from "react";
import { Plus, Megaphone, Trash2, Pin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";

const categoryEmojis = {
  general: "📢", academic: "📚", event: "🎉",
  fees: "💰", urgent: "🚨", birthday: "🎂", meeting: "📅",
};

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "general", label: "📢 General" },
  { value: "academic", label: "📚 Academic" },
  { value: "event", label: "🎉 Event" },
  { value: "fees", label: "💰 Fees" },
  { value: "urgent", label: "🚨 Urgent" },
  { value: "birthday", label: "🎂 Birthday" },
  { value: "meeting", label: "📅 Meeting" },
];

const audienceOptions = [
  { value: "", label: "All Audiences" },
  { value: "all", label: "Everyone" },
  { value: "students", label: "Students Only" },
  { value: "staff", label: "Staff Only" },
  { value: "class", label: "Specific Class" },
];

export default function Notices() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [category, setCategory] = useState("");
  const [audience, setAudience] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { setPage(1); }, [category, audience]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/notices", {
        params: {
          category: category || undefined,
          audience: audience || undefined,
          page, limit: 20,
        },
      });
      setData(data.data);
      setPagination(data.pagination);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, audience, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchData();
    } catch {
      alert("Failed to remove notice");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Notices</h1>
          <p className="text-navy/50 text-sm mt-1">Post announcements for students, staff, or specific classes.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200"
        >
          <Plus size={16} /> New Notice
        </button>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4 grid sm:grid-cols-2 gap-3">
          <CustomSelect value={category} onChange={setCategory} options={categoryOptions} placeholder="All Categories" />
          <CustomSelect value={audience} onChange={setAudience} options={audienceOptions} placeholder="All Audiences" />
        </div>
      </FadeIn>

      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <FadeIn key={i}>
              <div className="bg-white rounded-xl2 shadow-card p-5 animate-pulse">
                <div className="h-5 bg-navy/5 rounded w-2/3 mb-3" />
                <div className="h-4 bg-navy/5 rounded w-full mb-2" />
                <div className="h-4 bg-navy/5 rounded w-1/2" />
              </div>
            </FadeIn>
          ))
        ) : data.length === 0 ? (
          <FadeIn>
            <div className="text-center py-20 bg-white rounded-xl2 shadow-card">
              <Megaphone size={32} className="mx-auto mb-3 text-navy/20" />
              <p className="text-navy/40 text-sm">No notices yet. Create one above.</p>
            </div>
          </FadeIn>
        ) : (
          data.map((notice, i) => (
            <FadeIn key={notice.id} delay={i * 0.04}>
              <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(10,22,40,0.2)] transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-lg">{categoryEmojis[notice.category] || "📢"}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/10 text-gold-dark capitalize">
                        {notice.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy/5 text-navy/50 capitalize">
                        {notice.audience === "class" && notice.class
                          ? `${notice.class.name} ${notice.class.arm}`
                          : notice.audience}
                      </span>
                      {notice.pin_until && new Date(notice.pin_until) > new Date() && (
                        <span className="flex items-center gap-1 text-xs text-gold-dark">
                          <Pin size={12} /> Pinned
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-semibold text-navy mb-1">{notice.title}</h3>
                    <p className="text-navy/60 text-sm leading-relaxed line-clamp-2">{notice.content}</p>
                    <p className="text-navy/40 text-xs mt-2">
                      {new Date(notice.created_at).toLocaleDateString()} · by {notice.creator?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="p-2 rounded-full text-navy/30 hover:bg-red-50 hover:text-red-500 transition-all duration-200 shrink-0"
                    title="Remove notice"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))
        )}
      </div>

      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-5 py-2 rounded-full border border-navy/15 text-sm text-navy/60 hover:border-gold disabled:opacity-30 transition-all duration-200">
            Previous
          </button>
          <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="px-5 py-2 rounded-full border border-navy/15 text-sm text-navy/60 hover:border-gold disabled:opacity-30 transition-all duration-200">
            Next
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateNoticeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function CreateNoticeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "", content: "", category: "general", audience: "all", classId: "", pinUntil: "",
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (form.audience === "class") {
      api.get("/classes").then(({ data }) => {
        setClasses(data.map((c) => ({ value: c.id, label: `${c.name} ${c.arm}` })));
      }).catch(() => {});
    }
  }, [form.audience]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/notices", form);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create notice");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl2 border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200";
  const labelClass = "block text-sm font-medium text-navy/70 mb-1.5";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl2 shadow-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-serif text-xl font-bold text-navy mb-5">Create New Notice</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Content *</label>
            <textarea
              className={inputClass + " min-h-[120px] resize-none"}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Category *</label>
              <CustomSelect
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={[
                  { value: "general", label: "📢 General" },
                  { value: "academic", label: "📚 Academic" },
                  { value: "event", label: "🎉 Event" },
                  { value: "fees", label: "💰 Fees" },
                  { value: "urgent", label: "🚨 Urgent" },
                  { value: "birthday", label: "🎂 Birthday" },
                  { value: "meeting", label: "📅 Meeting" },
                ]}
                placeholder="Select category"
              />
            </div>
            <div>
              <label className={labelClass}>Audience *</label>
              <CustomSelect
                value={form.audience}
                onChange={(v) => setForm({ ...form, audience: v, classId: "" })}
                options={[
                  { value: "all", label: "Everyone" },
                  { value: "students", label: "Students Only" },
                  { value: "staff", label: "Staff Only" },
                  { value: "class", label: "Specific Class" },
                ]}
                placeholder="Select audience"
              />
            </div>
          </div>
          {form.audience === "class" && (
            <div>
              <label className={labelClass}>Class *</label>
              <CustomSelect value={form.classId} onChange={(v) => setForm({ ...form, classId: v })} options={classes} placeholder="Select class" />
            </div>
          )}
          <div>
            <label className={labelClass}>Pin Until (optional)</label>
            <input type="date" className={inputClass} value={form.pinUntil} onChange={(e) => setForm({ ...form, pinUntil: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light disabled:opacity-60 transition-all duration-200">
              {loading ? "Posting..." : "Post Notice"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}