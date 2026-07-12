import { useState, useEffect, useCallback } from "react";
import { Search, Download, Eye, Check, Ban, GraduationCap } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";
import StatusBadge from "../../components/admin/StatusBadge";
import ApplicationDetailModal from "../../components/admin/ApplicationDetailModal";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "fee_paid", label: "Fee Paid" },
  { value: "enrolled", label: "Enrolled" },
];

const classOptions = [
  { value: "", label: "All Classes" },
  ...["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"].map((c) => ({ value: c, label: c })),
];

export default function Applications() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, classFilter]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admissions", {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          classApplying: classFilter || undefined,
          page,
          limit: 20,
        },
      });
      setData(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, classFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    try {
      const res = await api.get("/admissions/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `admissions-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export CSV");
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admissions/${id}/status`, { status: "approved" });
      await fetchData();
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve application");
    }
  };

  const handleReject = async (id, rejection_reason) => {
    try {
      await api.patch(`/admissions/${id}/status`, { status: "rejected", rejection_reason });
      await fetchData();
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject application");
    }
  };

  const handleEnroll = async (id) => {
    if (!window.confirm("Enroll this student? Full enrollment will be completed in the Students module.")) return;
    try {
      await api.patch(`/admissions/${id}/status`, { status: "enrolled" });
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to enroll student");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Applications</h1>
          <p className="text-navy/50 text-sm mt-1">Manage admission applications and enrollment.</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200">
          <Download size={16} /> Export CSV
        </button>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4 grid sm:grid-cols-[1fr_180px_180px] gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, reference, or email..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl2 border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            />
          </div>
          <CustomSelect value={status} onChange={setStatus} options={statusOptions} placeholder="All Statuses" />
          <CustomSelect value={classFilter} onChange={setClassFilter} options={classOptions} placeholder="All Classes" />
        </div>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">#</th>
                  <th className="text-left px-5 py-3 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 font-semibold">Class</th>
                  <th className="text-left px-5 py-3 font-semibold">Boarding</th>
                  <th className="text-left px-5 py-3 font-semibold">Parent Email</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                  <th className="text-left px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-navy/5">
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-navy/5 rounded-full animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : error ? (
                  <tr><td colSpan={8} className="text-center py-10 text-red-500 text-sm">{error}</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-10 text-navy/40 text-sm">No applications found.</td></tr>
                ) : (
                  data.map((a, i) => (
                    <tr key={a.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors duration-150">
                      <td className="px-5 py-4 text-navy/40">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-navy">{a.first_name} {a.last_name}</p>
                        <p className="text-navy/40 text-xs">{a.reference_number}</p>
                      </td>
                      <td className="px-5 py-4 text-navy/70">{a.class_applying_for}</td>
                      <td className="px-5 py-4 text-navy/70">{a.boarding_type}</td>
                      <td className="px-5 py-4 text-navy/70">{a.father_email}</td>
                      <td className="px-5 py-4 text-navy/50">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelected(a)} className="p-2 rounded-full text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-all duration-200" title="View">
                            <Eye size={16} />
                          </button>
                          {["pending", "review"].includes(a.status) && (
                            <>
                              <button onClick={() => handleApprove(a.id)} className="p-2 rounded-full text-navy/50 hover:bg-green-50 hover:text-green-600 transition-all duration-200" title="Approve">
                                <Check size={16} />
                              </button>
                              <button onClick={() => setSelected(a)} className="p-2 rounded-full text-navy/50 hover:bg-red-50 hover:text-red-500 transition-all duration-200" title="Reject">
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                          {a.status === "fee_paid" && (
                            <button onClick={() => handleEnroll(a.id)} className="p-2 rounded-full text-navy/50 hover:bg-gold/10 hover:text-gold-dark transition-all duration-200" title="Enroll Student">
                              <GraduationCap size={16} />
                            </button>
                          )}
                        </div>
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
                Page {pagination.page} of {pagination.totalPages} • {pagination.total} total
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
        <ApplicationDetailModal
          application={selected}
          onClose={() => setSelected(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}