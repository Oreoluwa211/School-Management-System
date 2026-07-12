import { useState, useEffect } from "react";
import { Plus, BookOpen, Edit3, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";

const statusColors = {
  draft: "bg-navy/10 text-navy/50",
  upcoming: "bg-amber-100 text-amber-700",
  in_progress: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
};

export default function LessonNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/staff-portal/lesson-notes");
      setNotes(data.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/staff-portal/lesson-notes/${id}`, { status });
      fetchNotes();
    } catch {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Lesson Notes</h1>
          <p className="text-navy/50 text-sm mt-1">Plan and track your lesson content by week.</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200"
        >
          <Plus size={16} /> New Note
        </button>
      </FadeIn>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl2 shadow-card p-5 animate-pulse border border-navy/5">
              <div className="h-5 bg-navy/5 rounded w-2/3 mb-3" />
              <div className="h-4 bg-navy/5 rounded w-full mb-2" />
              <div className="h-4 bg-navy/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5">
            <BookOpen size={32} className="mx-auto mb-3 text-navy/20" />
            <p className="text-navy/40 text-sm">No lesson notes yet. Create your first one.</p>
          </div>
        </FadeIn>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((note, i) => (
            <FadeIn key={note.id} delay={i * 0.04}>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(10,22,40,0.2)] transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    {note.week_number && (
                      <span className="text-xs text-gold-dark font-medium">Week {note.week_number}</span>
                    )}
                    <h3 className="font-serif font-semibold text-navy leading-snug">{note.title}</h3>
                    {note.subject && (
                      <p className="text-xs text-navy/50 mt-0.5">
                        {note.subject.name}
                        {note.class && ` · ${note.class.name} ${note.class.arm}`}
                      </p>
                    )}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold capitalize shrink-0 ${statusColors[note.status]}`}>
                    {note.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-navy/60 text-sm leading-relaxed flex-1 line-clamp-3">{note.content}</p>
                <div className="flex gap-2 mt-4 pt-4 border-t border-navy/5">
                  <button
                    onClick={() => { setEditing(note); setShowModal(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-navy/15 text-navy/60 hover:border-gold hover:text-gold-dark transition-all duration-200"
                  >
                    <Edit3 size={12} /> Edit
                  </button>
                  {note.status !== "delivered" && (
                    <button
                      onClick={() => handleStatusUpdate(note.id, "delivered")}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-green-200 text-green-600 hover:bg-green-50 transition-all duration-200"
                    >
                      <Check size={12} /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {showModal && (
        <LessonNoteModal
          note={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSuccess={() => { setShowModal(false); setEditing(null); fetchNotes(); }}
        />
      )}
    </div>
  );
}

function LessonNoteModal({ note, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: note?.title || "",
    content: note?.content || "",
    weekNumber: note?.week_number || "",
    status: note?.status || "draft",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass = "w-full px-4 py-2.5 rounded-xl2 border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200";
  const labelClass = "block text-sm font-medium text-navy/70 mb-1.5";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (note) {
        await api.patch(`/staff-portal/lesson-notes/${note.id}`, form);
      } else {
        await api.post("/staff-portal/lesson-notes", form);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save lesson note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl2 shadow-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="font-serif text-xl font-bold text-navy mb-5">
          {note ? "Edit Lesson Note" : "New Lesson Note"}
        </h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className={labelClass}>Content *</label>
            <textarea
              className={inputClass + " min-h-[150px] resize-none"}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Write your lesson note content here..."
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Week Number</label>
              <input
                type="number"
                className={inputClass}
                value={form.weekNumber}
                onChange={(e) => setForm({ ...form, weekNumber: e.target.value })}
                min={1} max={20}
                placeholder="e.g. 3"
              />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light disabled:opacity-60 transition-all duration-200">
              {loading ? "Saving..." : note ? "Update Note" : "Create Note"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}