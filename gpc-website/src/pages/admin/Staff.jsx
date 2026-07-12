import { useState, useEffect, useCallback } from "react";
import { Search, Download, Eye, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";
import StaffDetailModal from "../../components/admin/StaffDetailModal";

export default function Staff() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [credentials, setCredentials] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/staff", {
        params: { search: debouncedSearch || undefined, page, limit: 20 },
      });
      setData(data.data);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async () => {
    try {
      const res = await api.get("/staff/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `staff-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed");
    }
  };

  const handleToggleActive = async (id, currentlyActive) => {
    try {
      await api.patch(`/staff/${id}/toggle-active`);
      setSelected(null);
      fetchData();
    } catch {
      alert("Failed to update staff status");
    }
  };

  const handleViewDetail = async (staff) => {
    try {
      const { data } = await api.get(`/staff/${staff.id}`);
      setSelected(data);
    } catch {
      setSelected(staff);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Staff</h1>
          <p className="text-navy/50 text-sm mt-1">
            Manage teaching and non-teaching staff — {pagination.total} total.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200">
            <UserPlus size={16} /> Add Staff
          </button>
        </div>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, staff ID, designation, or email..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            />
          </div>
        </div>
      </FadeIn>

      {credentials && (
        <FadeIn>
          <div className="bg-green-50 border border-green-200 rounded-xl2 p-4 flex items-start justify-between gap-4">
            <div className="text-sm text-green-800">
              <p className="font-semibold mb-1">✅ Staff account created!</p>
              <p>Staff ID: <strong>{credentials.staffId}</strong></p>
              <p>Portal Email: <strong>{credentials.email}</strong></p>
              <p>Temporary Password: <strong>{credentials.tempPassword}</strong></p>
              <p className="text-xs mt-1 text-green-600">Share these credentials with the staff member. They should change their password after first login.</p>
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
                  <th className="text-left px-5 py-3 font-semibold">Staff Member</th>
                  <th className="text-left px-5 py-3 font-semibold">Staff ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Designation</th>
                  <th className="text-left px-5 py-3 font-semibold">Department</th>
                  <th className="text-left px-5 py-3 font-semibold">Class Teacher</th>
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
                      <p className="text-sm">No staff found.</p>
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
                      <td className="px-5 py-4 text-navy/70">{s.staff_id}</td>
                      <td className="px-5 py-4 text-navy/70">{s.designation || "—"}</td>
                      <td className="px-5 py-4 text-navy/70">{s.department || "—"}</td>
                      <td className="px-5 py-4">
                        {s.is_class_teacher ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold-dark">
                            {s.class ? `${s.class.name} ${s.class.arm}` : "Yes"}
                          </span>
                        ) : (
                          <span className="text-navy/30 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleViewDetail(s)} className="p-2 rounded-full text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-all duration-200" title="View">
                          <Eye size={16} />
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
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-full border border-navy/15 text-sm font-medium text-navy/60 hover:border-gold disabled:opacity-30 transition-all duration-200">
                  Previous
                </button>
                <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages} className="px-4 py-2 rounded-full border border-navy/15 text-sm font-medium text-navy/60 hover:border-gold disabled:opacity-30 transition-all duration-200">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>

      {selected && (
        <StaffDetailModal
          staff={selected}
          onClose={() => setSelected(null)}
          onToggleActive={handleToggleActive}
        />
      )}

      {showCreateModal && (
        <CreateStaffModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(creds) => {
            setCredentials(creds);
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function CreateStaffModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    designation: "", department: "", gender: "",
    qualification: "", phone: "",
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
      const { data } = await api.post("/staff", form);
      onSuccess({ staffId: data.staffId, email: form.email, tempPassword: data.tempPassword });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create staff");
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
        <h2 className="font-serif text-xl font-bold text-navy mb-5">Add New Staff Member</h2>
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
          <div>
            <label className={labelClass}>Email Address *</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Designation *</label>
              <input className={inputClass} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Class Teacher" required />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input className={inputClass} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="e.g. Sciences" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Gender</label>
              <CustomSelect value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["Male", "Female"]} placeholder="Select" />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input className={inputClass} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08012345678" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Qualification</label>
            <input className={inputClass} value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="e.g. B.Sc. Mathematics" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold transition-all duration-200">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light disabled:opacity-60 transition-all duration-200">
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}