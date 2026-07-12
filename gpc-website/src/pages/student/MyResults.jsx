import { useState, useEffect } from "react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";

function gradeColor(grade) {
  if (grade === "A") return "text-green-600 bg-green-50";
  if (grade === "B") return "text-blue-600 bg-blue-50";
  if (grade === "C") return "text-navy bg-navy/5";
  if (grade === "D") return "text-amber-600 bg-amber-50";
  return "text-red-600 bg-red-50";
}

export default function MyResults() {
  const [data, setData] = useState(null);
  const [termId, setTermId] = useState("");
  const [loading, setLoading] = useState(true);

  const handleDownloadReportCard = async () => {
    if (!data?.reportCard || !termId) {
      alert("No published report card available for this term yet.");
      return;
    }
    try {
      const studentId = data.results[0]?.student_id;
      if (!studentId) return;
      const res = await api.get(
        `/export/report-card/${studentId}/${termId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-card.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download report card.");
    }
  };

  const fetchResults = async (tid) => {
    setLoading(true);
    try {
      const { data } = await api.get("/student-portal/results", {
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

  useEffect(() => { fetchResults(); }, []);
  useEffect(() => { if (termId) fetchResults(termId); }, [termId]);

  const termOptions = data?.terms?.map((t) => ({
    value: t.id,
    label: t.name.replace("_", " "),
  })) || [];

  const totalScore = data?.results?.reduce((s, r) => s + Number(r.total_score), 0) || 0;
  const average = data?.results?.length > 0
    ? (totalScore / data.results.length).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">My Results</h1>
          <p className="text-navy/50 text-sm mt-1">View your academic performance by term.</p>
        </div>
        <div className="w-48">
          <CustomSelect
            value={termId}
            onChange={setTermId}
            options={termOptions}
            placeholder="Select Term"
          />
        </div>
        {data?.reportCard && (
          <button
            onClick={handleDownloadReportCard}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200"
          >
            📥 Download Report Card
          </button>
        )}
      </FadeIn>

      {/* Summary cards */}
      {!loading && data?.results?.length > 0 && (
        <FadeIn>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 text-center">
              <p className="text-3xl font-serif font-bold text-navy">{data.results.length}</p>
              <p className="text-navy/50 text-sm mt-1">Subjects</p>
            </div>
            <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 text-center">
              <p className="text-3xl font-serif font-bold text-navy">{totalScore}</p>
              <p className="text-navy/50 text-sm mt-1">Total Score</p>
            </div>
            <div className="bg-white rounded-xl2 shadow-card p-5 border border-navy/5 text-center">
              <p className="text-3xl font-serif font-bold text-navy">{average}</p>
              <p className="text-navy/50 text-sm mt-1">Average Score</p>
            </div>
          </div>
        </FadeIn>
      )}

      {/* Report card summary */}
      {data?.reportCard && (
        <FadeIn>
          <div className="bg-navy rounded-xl2 shadow-card p-5 flex flex-wrap gap-6 items-center">
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide">Position</p>
              <p className="text-white font-serif text-2xl font-bold">
                {data.reportCard.position}<span className="text-gold text-sm">/{data.reportCard.class_size}</span>
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs uppercase tracking-wide">Average</p>
              <p className="text-white font-serif text-2xl font-bold">{Number(data.reportCard.average).toFixed(1)}</p>
            </div>
            {data.reportCard.teacher_remark && (
              <div className="flex-1">
                <p className="text-white/60 text-xs uppercase tracking-wide">Teacher's Remark</p>
                <p className="text-white text-sm mt-0.5">{data.reportCard.teacher_remark}</p>
              </div>
            )}
            {data.reportCard.principal_remark && (
              <div className="flex-1">
                <p className="text-white/60 text-xs uppercase tracking-wide">Principal's Remark</p>
                <p className="text-white text-sm mt-0.5">{data.reportCard.principal_remark}</p>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-navy/5 flex justify-between animate-pulse">
                <div className="h-4 bg-navy/5 rounded w-1/3" />
                <div className="h-4 bg-navy/5 rounded w-32" />
              </div>
            ))
          ) : data?.results?.length === 0 ? (
            <div className="text-center py-16 text-navy/40">
              <p className="text-sm">No results available for this term yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">Subject</th>
                  <th className="text-center px-5 py-3 font-semibold">CA (40)</th>
                  <th className="text-center px-5 py-3 font-semibold">Exam (60)</th>
                  <th className="text-center px-5 py-3 font-semibold">Total</th>
                  <th className="text-center px-5 py-3 font-semibold">Grade</th>
                  <th className="text-left px-5 py-3 font-semibold">Remark</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((r) => (
                  <tr key={r.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors">
                    <td className="px-5 py-3 font-medium text-navy">{r.subject.name}</td>
                    <td className="px-5 py-3 text-center text-navy/70">{Number(r.ca_score)}</td>
                    <td className="px-5 py-3 text-center text-navy/70">{Number(r.exam_score)}</td>
                    <td className="px-5 py-3 text-center font-bold text-navy">{Number(r.total_score)}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${gradeColor(r.grade)}`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-navy/60">{r.remark || "—"}</td>
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