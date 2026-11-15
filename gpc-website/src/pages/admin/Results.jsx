import { useState, useEffect, useCallback } from "react";
import { Search, Download } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";

export default function Results() {
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classId, setClassId] = useState("");
  const [termId, setTermId] = useState("");
  const [broadsheet, setBroadsheet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/classes"), api.get("/sessions")]).then(
      async ([classRes, sessionRes]) => {
        setClasses(
          classRes.data.map((c) => ({
            value: c.id,
            label: `${c.name} ${c.arm}`,
          }))
        );
        if (sessionRes.data[0]) {
          const termRes = await api.get(
            `/terms?sessionId=${sessionRes.data[0].id}`
          );
          setTerms(
            termRes.data.map((t) => ({
              value: t.id,
              label: t.name.replace("_", " "),
            }))
          );
          const current = termRes.data.find((t) => t.is_current);
          if (current) setTermId(current.id);
        }
      }
    );
  }, []);

  const fetchBroadsheet = useCallback(async () => {
    if (!classId || !termId) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/results/broadsheet", {
        params: { classId, termId },
      });
      setBroadsheet(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load broadsheet"
      );
    } finally {
      setLoading(false);
    }
  }, [classId, termId]);

  useEffect(() => {
    fetchBroadsheet();
  }, [fetchBroadsheet]);

  const handleExportBroadsheet = async () => {
    if (!classId || !termId) return;
    try {
      const res = await api.get(
        `/export/broadsheet/${classId}/${termId}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `broadsheet-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Failed to export broadsheet");
    }
  };

  function gradeColor(grade) {
    if (grade === "A") return "text-green-600";
    if (grade === "B") return "text-blue-600";
    if (grade === "C") return "text-navy";
    if (grade === "D") return "text-amber-600";
    return "text-red-500";
  }

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">
            Results
          </h1>
          <p className="text-navy/50 text-sm mt-1">
            View and export class broadsheets by term.
          </p>
        </div>
        {classId && termId && (
          <button
            onClick={handleExportBroadsheet}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200"
          >
            <Download size={16} /> Export Broadsheet CSV
          </button>
        )}
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1.5">
              Class
            </label>
            <CustomSelect
              value={classId}
              onChange={setClassId}
              options={classes}
              placeholder="Select class"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1.5">
              Term
            </label>
            <CustomSelect
              value={termId}
              onChange={setTermId}
              options={terms}
              placeholder="Select term"
            />
          </div>
        </div>
      </FadeIn>

      {error && (
        <FadeIn>
          <p className="text-red-500 text-sm">{error}</p>
        </FadeIn>
      )}

      {!classId || !termId ? (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5 text-navy/40">
            <p className="text-sm">
              Select a class and term above to view results.
            </p>
          </div>
        </FadeIn>
      ) : loading ? (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5 text-navy/40 animate-pulse">
            Loading broadsheet...
          </div>
        </FadeIn>
      ) : broadsheet?.broadsheet?.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5 text-navy/40">
            <p className="text-sm">
              No results found for this class and term yet.
            </p>
          </div>
        </FadeIn>
      ) : broadsheet ? (
        <FadeIn>
          <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy text-white text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-semibold sticky left-0 bg-navy">
                      #
                    </th>
                    <th className="text-left px-4 py-3 font-semibold sticky left-8 bg-navy">
                      Student
                    </th>
                    {broadsheet.subjects.map((s) => (
                      <th
                        key={s}
                        className="text-center px-3 py-3 font-semibold whitespace-nowrap"
                      >
                        {s}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 font-semibold text-gold">
                      Total
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gold">
                      Avg
                    </th>
                    <th className="text-center px-4 py-3 font-semibold text-gold">
                      Pos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {broadsheet.broadsheet.map((row, i) => (
                    <tr
                      key={row.student.id}
                      className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors"
                    >
                      <td className="px-4 py-3 text-navy/40 sticky left-0 bg-white">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 sticky left-8 bg-white min-w-[160px]">
                        <p className="font-medium text-navy">
                          {row.student.name}
                        </p>
                        <p className="text-navy/40 text-xs">
                          {row.student.student_id}
                        </p>
                      </td>
                      {broadsheet.subjects.map((subj) => {
                        const score = row.scores[subj];
                        return (
                          <td
                            key={subj}
                            className="px-3 py-3 text-center"
                          >
                            {score?.total != null ? (
                              <div>
                                <p
                                  className={`font-bold ${gradeColor(score.grade)}`}
                                >
                                  {score.total}
                                </p>
                                <p className="text-xs text-navy/40">
                                  {score.grade}
                                </p>
                              </div>
                            ) : (
                              <span className="text-navy/20">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-navy">
                        {row.totalScore}
                      </td>
                      <td className="px-4 py-3 text-center text-navy/70">
                        {row.average}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gold/10 text-gold-dark">
                          {row.position}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      ) : null}
    </div>
  );
}