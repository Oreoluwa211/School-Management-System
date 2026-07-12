import { useState, useEffect } from "react";
import { Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";

export default function Fees() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student-portal/fees")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const paymentStatusColors = {
    success: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-600",
    refunded: "bg-navy/10 text-navy/50",
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Fee History</h1>
        <p className="text-navy/50 text-sm mt-1">Track your fee payments and outstanding balance.</p>
      </FadeIn>

      {!loading && data && (
        <>
          <div className="grid sm:grid-cols-3 gap-5">
            <FadeIn>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5">
                <div className="w-10 h-10 rounded-xl2 bg-green-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
                <p className="text-2xl font-serif font-bold text-navy">
                  ₦{data.totalPaid.toLocaleString()}
                </p>
                <p className="text-navy/50 text-sm mt-1">Total Paid</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5">
                <div className="w-10 h-10 rounded-xl2 bg-red-50 flex items-center justify-center mb-3">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <p className="text-2xl font-serif font-bold text-navy">
                  ₦{data.outstanding.toLocaleString()}
                </p>
                <p className="text-navy/50 text-sm mt-1">Outstanding</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.16}>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5">
                <div className="w-10 h-10 rounded-xl2 bg-gold/10 flex items-center justify-center mb-3">
                  <Wallet size={20} className="text-gold-dark" />
                </div>
                <p className="text-2xl font-serif font-bold text-navy">
                  ₦{data.sessionFee.toLocaleString()}
                </p>
                <p className="text-navy/50 text-sm mt-1">Full Session Fee</p>
              </div>
            </FadeIn>
          </div>

          {data.sessionFee > 0 && (
            <FadeIn>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-navy/60 font-medium">Payment Progress</span>
                  <span className="font-bold text-navy">
                    {Math.round((data.totalPaid / data.sessionFee) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-navy/5 rounded-full h-3">
                  <div
                    className="bg-gold h-3 rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, Math.round((data.totalPaid / data.sessionFee) * 100))}%` }}
                  />
                </div>
              </div>
            </FadeIn>
          )}
        </>
      )}

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-navy/5">
            <h2 className="font-serif font-semibold text-navy">Transaction History</h2>
          </div>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-navy/5 flex justify-between animate-pulse">
                <div className="h-4 bg-navy/5 rounded w-1/3" />
                <div className="h-4 bg-navy/5 rounded w-24" />
              </div>
            ))
          ) : !data?.payments?.length ? (
            <div className="text-center py-16 text-navy/40 text-sm">No payment records yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Description</th>
                  <th className="text-left px-5 py-3 font-semibold">Reference</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                  <th className="text-right px-5 py-3 font-semibold">Amount (₦)</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors">
                    <td className="px-5 py-3 text-navy">{p.description || p.payment_type.replace("_", " ")}</td>
                    <td className="px-5 py-3 text-navy/50 text-xs font-mono">{p.paystack_ref || "—"}</td>
                    <td className="px-5 py-3 text-navy/60">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-navy">
                      {Number(p.amount).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${paymentStatusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </FadeIn>
    </div>
  );
}