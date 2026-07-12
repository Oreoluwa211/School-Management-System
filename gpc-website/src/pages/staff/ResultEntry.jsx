import { useState, useEffect, useCallback } from "react";
import { Save, Send, CheckCircle2, AlertCircle } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";

export default function ResultEntry() {
  const [staffData, setStaffData] = useState(null);
  const [assignments, setAssignments] = useState([]);

  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [termId, setTermId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [terms, setTerms] = useState([]);

  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [existingResults, setExistingResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Load staff profile + terms
  useEffect(() => {
    Promise.all([
      api.get("/staff-portal/dashboard"),
      api.get("/sessions"),
    ]).then(([dashRes, sessionRes]) => {
      const staff = dashRes.data.staff;
      setStaffData(staff);

      const assigns = staff?.subject_assignments || [];
      setAssignments(
        assigns.map((a) => ({
          value: `${a.subject_id}|${a.class_id}`,
          label: `${a.subject.name} — ${a.class.name} ${a.class.arm}`,
          subjectId: a.subject_id,
          classId: a.class_id,
        }))
      );

      const currentSession = sessionRes.data[0];
      if (currentSession) {
        setSessionId(currentSession.id);
        return api.get(`/terms?sessionId=${currentSession.id}`);
      }
    }).then((res) => {
      if (res?.data) {
        setTerms(res.data.map((t) => ({
          value: t.id,
          label: t.name.replace("_", " "),
        })));
        const current = res.data.find((t) => t.is_current);
        if (current) setTermId(current.id);
      }
    }).catch(() => setError("Failed to load data"))
    .finally(() => setLoading(false));
  }, []);

  const selectedAssignmentData = assignments.find((a) => a.value === selectedAssignment);

  // Load students and existing results when selection changes
  const loadStudentsAndResults = useCallback(async () => {
    if (!selectedAssignment || !termId) return;

    // Extract classId and subjectId from the combined value
    const parts = selectedAssignment.split("|");
    if (parts.length < 2) return;
    const subjectId = parts[0];
    const classId = parts[1];

    try {
      const [studentsRes, resultsRes] = await Promise.all([
        api.get("/staff-portal/class-students", { params: { classId } }),
        api.get("/results", { params: { classId, subjectId, termId } }),
      ]);

      const studentList = studentsRes.data.data;
      setStudents(studentList);
      setExistingResults(resultsRes.data.data);

      const initialScores = {};
      studentList.forEach((s) => {
        const existing = resultsRes.data.data.find((r) => r.student_id === s.id);
        initialScores[s.id] = {
          ca: existing ? String(existing.ca_score) : "",
          exam: existing ? String(existing.exam_score) : "",
        };
      });
      setScores(initialScores);
      setSaved(false);
      setSubmitted(false);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load students for selected class"
      );
    }
  }, [selectedAssignment, termId]);



  useEffect(() => {
    loadStudentsAndResults();
  }, [loadStudentsAndResults]);

  const handleScoreChange = (studentId, field, value) => {
    const max = field === "ca" ? 40 : 60;
    const num = Number(value);
    if (value !== "" && (isNaN(num) || num < 0 || num > max)) return;
    setScores((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
    setSaved(false);
    setSubmitted(false);
  };

  const getTotal = (studentId) => {
    const ca = Number(scores[studentId]?.ca) || 0;
    const exam = Number(scores[studentId]?.exam) || 0;
    return ca + exam;
  };

  const getGrade = (total) => {
    if (total >= 75) return { grade: "A", color: "text-green-600" };
    if (total >= 65) return { grade: "B", color: "text-blue-600" };
    if (total >= 55) return { grade: "C", color: "text-navy" };
    if (total >= 45) return { grade: "D", color: "text-amber-600" };
    if (total >= 40) return { grade: "E", color: "text-orange-500" };
    return { grade: "F", color: "text-red-600" };
  };

  const handleSave = async () => {
    if (!selectedAssignment || !termId || !sessionId) return;

    const parts = selectedAssignment.split("|");
    const subjectId = parts[0];
    const classId = parts[1];

    setSaving(true);
    setError("");
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        caScore: scores[s.id]?.ca || 0,
        examScore: scores[s.id]?.exam || 0,
      }));
      await api.post("/results/bulk", {
        classId,
        subjectId,
        termId,
        sessionId,
        results: records,
      });
      setSaved(true);
      await loadStudentsAndResults();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!saved) {
      setError("Please save results before submitting.");
      return;
    }
    if (!window.confirm("Submit results? Once submitted, they are marked as final.")) return;

    const parts = selectedAssignment.split("|");
    const subjectId = parts[0];
    const classId = parts[1];

    setSubmitting(true);
    setError("");
    try {
      await api.patch("/results/submit", { classId, subjectId, termId });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit results");
    } finally {
      setSubmitting(false);
    }
  };

  const allSubmitted = existingResults.length > 0 && existingResults.every((r) => r.is_submitted);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white rounded-xl2 w-1/3" />
        <div className="h-48 bg-white rounded-xl2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Result Entry</h1>
        <p className="text-navy/50 text-sm mt-1">Enter CA (max 40) and Exam (max 60) scores for each student.</p>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-5 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1.5">Subject & Class *</label>
            <CustomSelect
              value={selectedAssignment}
              onChange={(v) => { setSelectedAssignment(v); setSaved(false); }}
              options={assignments}
              placeholder="Select subject and class"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy/70 mb-1.5">Term *</label>
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
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl2 px-4 py-3 text-sm text-red-600">
            <AlertCircle size={16} /> {error}
          </div>
        </FadeIn>
      )}

      {submitted || allSubmitted ? (
        <FadeIn>
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl2 px-5 py-4 text-green-700">
            <CheckCircle2 size={20} />
            <div>
              <p className="font-semibold">Results submitted successfully!</p>
              <p className="text-sm text-green-600">These results have been marked as final and submitted for review.</p>
            </div>
          </div>
        </FadeIn>
      ) : null}

      {selectedAssignment && termId && students.length > 0 && (
        <FadeIn>
          <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy/5">
              <p className="text-sm font-medium text-navy">
                {students.length} students · {selectedAssignmentData?.label}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || allSubmitted}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-gold text-navy font-semibold text-sm shadow-gold hover:bg-gold-light hover:scale-105 disabled:opacity-50 transition-all duration-200"
                >
                  {saved ? <CheckCircle2 size={15} /> : <Save size={15} />}
                  {saving ? "Saving..." : saved ? "Saved!" : "Save"}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !saved || allSubmitted}
                  className="flex items-center gap-2 px-5 py-2 rounded-full border border-navy/15 text-navy font-semibold text-sm hover:border-gold hover:text-gold-dark disabled:opacity-40 transition-all duration-200"
                >
                  <Send size={15} />
                  {submitting ? "Submitting..." : "Submit Final"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                    <th className="text-left px-5 py-3 font-semibold">#</th>
                    <th className="text-left px-5 py-3 font-semibold">Student</th>
                    <th className="text-left px-5 py-3 font-semibold">CA (max 40)</th>
                    <th className="text-left px-5 py-3 font-semibold">Exam (max 60)</th>
                    <th className="text-left px-5 py-3 font-semibold">Total</th>
                    <th className="text-left px-5 py-3 font-semibold">Grade</th>
                    <th className="text-left px-5 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => {
                    const total = getTotal(student.id);
                    const { grade, color } = getGrade(total);
                    const existing = existingResults.find((r) => r.student_id === student.id);

                    return (
                      <tr key={student.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors">
                        <td className="px-5 py-3 text-navy/40">{i + 1}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-navy">{student.first_name} {student.last_name}</p>
                          <p className="text-navy/40 text-xs">{student.student_id}</p>
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="number"
                            min={0}
                            max={40}
                            value={scores[student.id]?.ca || ""}
                            onChange={(e) => handleScoreChange(student.id, "ca", e.target.value)}
                            disabled={existing?.is_submitted}
                            className="w-20 px-3 py-1.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-navy/5 disabled:text-navy/40 transition-all duration-200"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <input
                            type="number"
                            min={0}
                            max={60}
                            value={scores[student.id]?.exam || ""}
                            onChange={(e) => handleScoreChange(student.id, "exam", e.target.value)}
                            disabled={existing?.is_submitted}
                            className="w-20 px-3 py-1.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:bg-navy/5 disabled:text-navy/40 transition-all duration-200"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-5 py-3">
                          <span className="font-semibold text-navy">{total}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`font-bold ${color}`}>{total > 0 ? grade : "—"}</span>
                        </td>
                        <td className="px-5 py-3">
                          {existing?.is_submitted ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Submitted</span>
                          ) : existing ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Draft</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-navy/5 text-navy/40">Not entered</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}

      {selectedAssignment && termId && students.length === 0 && !loading && (
        <FadeIn>
          <div className="text-center py-16 bg-white rounded-xl2 shadow-card text-navy/40 text-sm">
            No students found in this class.
          </div>
        </FadeIn>
      )}

      {!selectedAssignment && (
        <FadeIn>
          <div className="text-center py-16 bg-white rounded-xl2 shadow-card text-navy/40">
            <p className="text-sm">Select a subject and class above to begin entering results.</p>
          </div>
        </FadeIn>
      )}
    </div>
  );
}