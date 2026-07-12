import { useState, useEffect } from "react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";

const statusColors = {
  present: "bg-green-500",
  absent: "bg-red-500",
  late: "bg-amber-400",
  excused: "bg-blue-400",
};

const statusBadge = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-600",
  late: "bg-amber-100 text-amber-700",
  excused: "bg-blue-100 text-blue-700",
};

export default function MyAttendance() {
  const [data, setData] = useState(null);
  const [termId, setTermId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async (tid) => {
    setLoading(true);
    try {
      const { data } = await api.get("/student-portal/attendance", {
        params: tid ? { termId: tid } : {},
      });
      setData(data);
      if (!termId && data.currentTermId) setTermId(data.currentTermId);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAttendance(); }, []);
  useEffect(() => { if (termId) fetchAttendance(termId); }, [termId]);

  const termOptions = data?.terms?.map((t) => ({
    value: t.id,
    label: t.name.replace("_", " "),
  })) || [];

  // Group records by month
  const byMonth = {};
  (data?.records || []).forEach((r) => {
    const month = new Date(r.date).toLocaleString("default", { month: "long", year: "numeric" });
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(r);
  });

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Attendance</h1>
          <p className="text-navy/50 text-sm mt-1">Track your attendance record by term.</p>
        </div>
        <div className="w-48">
          <CustomSelect
            value={termId}
            onChange={setTermId}
            options={termOptions}
            placeholder="Select Term"
          />
        </div>
      </FadeIn>

      {/* Summary cards */}
      {!loading && data?.summary && (
        <FadeIn>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Total Days", value: data.summary.total, color: "text-navy" },
              { label: "Present", value: data.summary.present, color: "text-green-600" },
              { label: "Absent", value: data.summary.absent, color: "text-red-500" },
              { label: "Late", value: data.summary.late, color: "text-amber-600" },
              { label: "Excused", value: data.summary.excused, color: "text-blue-600" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-xl2 shadow-card p-4 text-center border border-navy/5">
                <p className={`text-2xl font-serif font-bold ${s.color}`}>{s.value}</p>
                <p className="text-navy/50 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      )}

      {/* Attendance percentage bar */}
      {!loading && data?.summary && (
        <FadeIn>
          <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-navy/60 font-medium">Attendance Rate</span>
              <span className={`font-bold ${data.summary.percentage >= 75 ? "text-green-600" : "text-red-500"}`}>
                {data.summary.percentage}%
              </span>
            </div>
            <div className="w-full bg-navy/5 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${
                  data.summary.percentage >= 75 ? "bg-green-500" : "bg-red-400"
                }`}
                style={{ width: `${data.summary.percentage}%` }}
              />
            </div>
            {data.summary.percentage < 75 && (
              <p className="text-xs text-red-500 mt-2">
                ⚠ Your attendance is below the required 75% threshold.
              </p>
            )}

            {/* Legend */}
            <div className="flex gap-4 mt-4 flex-wrap">
              {Object.entries(statusColors).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-navy/60 capitalize">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  {status}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Monthly breakdown */}
      {!loading && Object.keys(byMonth).length > 0 && (
        <div className="space-y-5">
          {Object.entries(byMonth).map(([month, records]) => (
            <FadeIn key={month}>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 overflow-hidden">
                <div className="px-5 py-3 bg-[#faf8f3] border-b border-navy/5">
                  <h3 className="font-serif font-semibold text-navy text-sm">{month}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-navy/50 text-xs uppercase tracking-wide border-b border-navy/5">
                        <th className="text-left px-5 py-2 font-semibold">Date</th>
                        <th className="text-left px-5 py-2 font-semibold">Day</th>
                        <th className="text-left px-5 py-2 font-semibold">Status</th>
                        <th className="text-left px-5 py-2 font-semibold">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => {
                        const d = new Date(r.date);
                        return (
                          <tr key={r.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors">
                            <td className="px-5 py-2.5 text-navy/70">{d.toLocaleDateString()}</td>
                            <td className="px-5 py-2.5 text-navy/70">{d.toLocaleString("default", { weekday: "short" })}</td>
                            <td className="px-5 py-2.5">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusBadge[r.status]}`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="px-5 py-2.5 text-navy/50 text-xs">{r.notes || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {!loading && data?.records?.length === 0 && (
        <FadeIn>
          <div className="text-center py-16 bg-white rounded-xl2 shadow-card text-navy/40 text-sm">
            No attendance records for this term yet.
          </div>
        </FadeIn>
      )}
    </div>
  );
}