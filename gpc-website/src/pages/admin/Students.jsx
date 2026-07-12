import { useState, useEffect, useCallback } from "react";
import { Search, Download, Eye, UserPlus, GraduationCap } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";
import StudentDetailModal from "../../components/admin/StudentDetailModal";
import { motion } from "framer-motion";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "graduated", label: "Graduated" },
  { value: "transferred", label: "Transferred" },
  { value: "suspended", label: "Suspended" },
  { value: "withdrawn", label: "Withdrawn" },
];

export default function Students() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/students", {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          page, limit: 20,
        },
      });
      setData(data.data);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    try {
      const res = await api.get("/students/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `students-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed");
    }
  };

  const handleBroadsheet = async () => {
    // Opens a simple prompt — in Phase 7 Part 3 we'll add a proper modal
    const classId = prompt("Enter Class ID (copy from URL when viewing a class):");
    const termId = prompt("Enter Term ID:");
    if (!classId || !termId) return;

    try {
      const res = await api.get(`/export/broadsheet/${classId}/${termId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `broadsheet-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to export broadsheet. Check the class and term IDs.");
    }
  };

  const handlePublishReportCard = async (student) => {
  const teacherRemark = prompt("Teacher's remark (optional):", "Good performance this term.");
  if (teacherRemark === null) return; // cancelled

  const principalRemark = prompt("Principal's remark (optional):", "Keep it up!");
  if (principalRemark === null) return;

  try {
    // Get current session and term IDs
    const [sessionRes, termsRes] = await Promise.all([
      api.get("/sessions"),
      api.get("/terms"),
    ]);

    const currentSession = sessionRes.data[0];
      const currentTerm = termsRes.data.find((t) => t.is_current);

      if (!currentSession || !currentTerm) {
        alert("No active session or term found.");
        return;
      }

      await api.post("/report-cards/compile", {
        studentId: student.id,
        termId: currentTerm.id,
        sessionId: currentSession.id,
        classId: student.class_id,
        teacherRemark,
        principalRemark,
      });

      alert(`✅ Report card published for ${student.first_name} ${student.last_name}!`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to publish report card");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Students</h1>
          <p className="text-navy/50 text-sm mt-1">
            Manage enrolled students — {pagination.total} total.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200">
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={handleBroadsheet}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200"
          >
            📊 Broadsheet
          </button>
          <button onClick={() => setShowEnrollModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200">
            <UserPlus size={16} /> Add Student
          </button>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4 grid sm:grid-cols-[1fr_200px] gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, ID, or email..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            />
          </div>
          <CustomSelect value={status} onChange={setStatus} options={statusOptions} placeholder="All Statuses" />
        </div>
      </FadeIn>

      {credentials && (
        <FadeIn>
          <div className="bg-green-50 border border-green-200 rounded-xl2 p-4 flex items-start justify-between gap-4">
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">✅ Student enrolled successfully!</p>
              <p>Student ID: <strong>{credentials.studentId}</strong></p>
              <p>Portal Email: <strong>{credentials.portalEmail}</strong></p>
              <p>Temporary Password: <strong>{credentials.tempPassword}</strong></p>
              <p className="text-xs mt-1 text-green-600">Share these credentials with the student/parent. They can change the password after first login.</p>
            </div>
            <button onClick={() => setCredentials(null)} className="text-green-600 hover:text-green-800 text-lg font-bold shrink-0">×</button>
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">#</th>
                  <th className="text-left px-5 py-3 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 font-semibold">Student ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Class</th>
                  <th className="text-left px-5 py-3 font-semibold">Boarding</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-navy/5">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-navy/5 rounded-full animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr><td colSpan={7} className="text-center py-10 text-red-500 text-sm">{error}</td></tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-navy/40">
                      <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No students found.</p>
                    </td>
                  </tr>
                ) : (
                  data.map((s, i) => (
                    <tr key={s.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors duration-150">
                      <td className="px-5 py-4 text-navy/40">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-navy">{s.first_name} {s.last_name}</p>
                        <p className="text-navy/40 text-xs">{s.email}</p>
                      </td>
                      <td className="px-5 py-4 text-navy/70">{s.student_id}</td>
                      <td className="px-5 py-4 text-navy/70">{s.class ? `${s.class.name} ${s.class.arm}` : "—"}</td>
                      <td className="px-5 py-4 text-navy/70">{s.boarding_type || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          s.status === "active" ? "bg-green-100 text-green-700" :
                          s.status === "suspended" ? "bg-amber-100 text-amber-700" :
                          s.status === "graduated" ? "bg-blue-100 text-blue-700" :
                          "bg-navy/10 text-navy/50"
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setSelected(s)} className="p-2 rounded-full text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-all duration-200" title="View">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handlePublishReportCard(s)}
                          className="p-2 rounded-full text-navy/50 hover:bg-green-50 hover:text-green-600 transition-all duration-200"
                          title="Publish Report Card"
                        >
                          📋Publish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-navy/5">
              <p className="text-sm text-navy/50">
                Page {page} of {pagination.totalPages} • {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-full border border-navy/15 text-sm font-medium text-navy/60 hover:border-gold hover:text-gold-dark disabled:opacity-30 transition-all duration-200">
                  Previous
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="px-4 py-2 rounded-full border border-navy/15 text-sm font-medium text-navy/60 hover:border-gold hover:text-gold-dark disabled:opacity-30 transition-all duration-200">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {selected && (
        <StudentDetailModal student={selected} onClose={() => setSelected(null)} />
      )}

      {showEnrollModal && (
        <EnrollModal
          onClose={() => setShowEnrollModal(false)}
          onSuccess={(creds) => {
            setCredentials(creds);
            setShowEnrollModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function EnrollModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", gender: "", classId: "", sessionId: "", boardingType: "" });
  const [classes, setClasses] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/classes"), api.get("/sessions")]).then(([c, s]) => {
      setClasses(c.data.map((cls) => ({ value: cls.id, label: `${cls.name} ${cls.arm}` })));
      setSessions(s.data.map((ses) => ({ value: ses.id, label: ses.name })));
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/students", form);
      onSuccess({ studentId: data.studentId, portalEmail: data.portalEmail, tempPassword: data.tempPassword });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create student");
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
        className="bg-white rounded-xl2 shadow-card w-full max-w-lg p-6"
      >
        <h2 className="font-serif text-xl font-bold text-navy mb-5">Add New Student</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name *</label>
              <input className={inputClass} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input className={inputClass} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Gender *</label>
              <CustomSelect value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["Male", "Female"]} placeholder="Select" />
            </div>
            <div>
              <label className={labelClass}>Boarding Type</label>
              <CustomSelect value={form.boardingType} onChange={(v) => setForm({ ...form, boardingType: v })} options={["Day Student", "Full Boarder", "Weekly Boarder"]} placeholder="Select" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Class *</label>
            <CustomSelect value={form.classId} onChange={(v) => setForm({ ...form, classId: v })} options={classes} placeholder="Select class" />
          </div>
          <div>
            <label className={labelClass}>Session *</label>
            <CustomSelect value={form.sessionId} onChange={(v) => setForm({ ...form, sessionId: v })} options={sessions} placeholder="Select session" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold transition-all duration-200">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light disabled:opacity-60 transition-all duration-200">
              {loading ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}