import { useState, useEffect, useCallback } from "react";
import { Download, Search, Wallet } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";
import Counter from "../../components/Counter";

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "school_fees", label: "School Fees" },
  { value: "admission_fee", label: "Admission Fee" },
  { value: "other", label: "Other" },
];

const statusColors = {
  success: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-navy/10 text-navy/50",
};

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, status, type]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/payments", {
        params: {
          search: debouncedSearch || undefined,
          status: status || undefined,
          type: type || undefined,
          page,
          limit: 20,
        },
      });
      setPayments(data.data);
      setPagination(data.pagination);
      setSummary(data.summary);
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, type, page]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleExport = async () => {
    try {
      const res = await api.get("/payments/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payments-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed");
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Payments</h1>
          <p className="text-navy/50 text-sm mt-1">Track all fee payments and transactions.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200"
        >
          <Download size={16} /> Export CSV
        </button>
      </FadeIn>

      {/* Summary cards */}
      {summary && (
        <div className="grid sm:grid-cols-3 gap-5">
          {[
            { label: "Total Collected", value: summary.totalSuccess, color: "bg-green-50 text-green-600" },
            { label: "Pending", value: summary.totalPending, color: "bg-amber-50 text-amber-600" },
            { label: "All Transactions", value: summary.totalCount, color: "bg-blue-50 text-blue-600", isCount: true },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.08}>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5">
                <div className={`w-10 h-10 rounded-xl2 flex items-center justify-center mb-3 ${s.color}`}>
                  <Wallet size={18} />
                </div>
                <p className="text-2xl font-serif font-bold text-navy">
                  {!s.isCount && "₦"}
                  <Counter
                    target={Number(s.value || 0)}
                    className="text-2xl font-serif font-bold text-navy"
                  />
                </p>
                <p className="text-navy/50 text-sm mt-1">{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4 grid sm:grid-cols-[1fr_160px_160px] gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reference or student..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            />
          </div>
          <CustomSelect value={status} onChange={setStatus} options={statusOptions} placeholder="All Statuses" />
          <CustomSelect value={type} onChange={setType} options={typeOptions} placeholder="All Types" />
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
                  <th className="text-left px-5 py-3 font-semibold">Reference</th>
                  <th className="text-left px-5 py-3 font-semibold">Type</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Amount (₦)</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
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
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-red-500 text-sm">{error}</td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-navy/40">
                      <Wallet size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No payment records found.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((p, i) => (
                    <tr key={p.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors">
                      <td className="px-5 py-3 text-navy/40">{(page - 1) * 20 + i + 1}</td>
                      <td className="px-5 py-3">
                        {p.student ? (
                          <>
                            <p className="font-medium text-navy">
                              {p.student.first_name} {p.student.last_name}
                            </p>
                            <p className="text-navy/40 text-xs">{p.student.student_id}</p>
                          </>
                        ) : p.admission ? (
                          <>
                            <p className="font-medium text-navy">
                              {p.admission.first_name} {p.admission.last_name}
                            </p>
                            <p className="text-navy/40 text-xs">Applicant</p>
                          </>
                        ) : (
                          <span className="text-navy/30">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-navy/50 text-xs font-mono">
                        {p.paystack_ref || "—"}
                      </td>
                      <td className="px-5 py-3 text-navy/70 capitalize">
                        {p.payment_type?.replace("_", " ") || "—"}
                      </td>
                      <td className="px-5 py-3 text-navy/60">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString()
                          : new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-navy">
                        {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[p.status] || "bg-navy/10 text-navy/50"}`}>
                          {p.status}
                        </span>
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
                Page {page} of {pagination.totalPages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-full border border-navy/15 text-sm font-medium text-navy/60 hover:border-gold disabled:opacity-30 transition-all duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 rounded-full border border-navy/15 text-sm font-medium text-navy/60 hover:border-gold disabled:opacity-30 transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}