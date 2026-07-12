import { useState } from "react";
import PageHero from "../components/PageHero";
import FadeIn from "../components/FadeIn";
import { Search, CheckCircle2, Clock, XCircle, CreditCard, GraduationCap } from "lucide-react";
import api from "../lib/api";

const statusConfig = {
  pending: { label: "Pending Review", color: "bg-amber-100 text-amber-700", icon: Clock },
  review: { label: "Under Review", color: "bg-purple-100 text-purple-700", icon: Clock },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  fee_paid: { label: "Fee Paid", color: "bg-blue-100 text-blue-700", icon: CreditCard },
  enrolled: { label: "Enrolled", color: "bg-green-100 text-green-700", icon: GraduationCap },
};

export default function TrackApplication() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await api.get(`/admissions/track/${ref.trim().toUpperCase()}`);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No application found with that reference number. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHero
        title="Track Your Application"
        subtitle="Enter your reference number to check the status of your admission application."
      />

      <section className="py-20 bg-[#faf8f3] min-h-[50vh]">
        <div className="max-w-xl mx-auto px-4">
          <FadeIn>
            <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                placeholder="e.g. GPC-2025-10234"
                className="flex-1 px-5 py-3 rounded-full border border-navy/15 bg-white text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 disabled:opacity-60 disabled:scale-100 transition-all duration-200"
              >
                <Search size={18} /> {loading ? "Searching..." : "Track"}
              </button>
            </form>
          </FadeIn>

          {error && (
            <FadeIn>
              <p className="text-center text-red-500 text-sm">{error}</p>
            </FadeIn>
          )}

          {result && (
            <FadeIn>
              <div className="bg-white rounded-xl2 shadow-card p-6 border border-navy/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl font-bold text-navy">{result.name}</h3>
                  {(() => {
                    const cfg = statusConfig[result.status];
                    const Icon = cfg.icon;
                    return (
                      <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <Icon size={14} /> {cfg.label}
                      </span>
                    );
                  })()}
                </div>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-navy/40 text-xs uppercase tracking-wide">Class Applying For</dt>
                    <dd className="text-navy/80 font-medium">{result.classApplying}</dd>
                  </div>
                  <div>
                    <dt className="text-navy/40 text-xs uppercase tracking-wide">Applied Date</dt>
                    <dd className="text-navy/80 font-medium">
                      {new Date(result.appliedDate).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-navy/40 text-xs uppercase tracking-wide">Reviewed Date</dt>
                    <dd className="text-navy/80 font-medium">
                      {result.reviewedDate
                        ? new Date(result.reviewedDate).toLocaleDateString()
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </div>
            </FadeIn>
          )}
        </div>
      </section>
    </>
  );
}