import { useState, useEffect } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";

const statusOptions = ["present", "absent", "late", "excused"];

const statusColors = {
  present: "bg-green-100 text-green-700 border-green-200",
  absent: "bg-red-100 text-red-600 border-red-200",
  late: "bg-amber-100 text-amber-700 border-amber-200",
  excused: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [termId, setTermId] = useState("");
  const [classId, setClassId] = useState("");
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/staff-portal/my-students").then(({ data }) => {
      setStudents(data.data || []);
      const init = {};
      (data.data || []).forEach((s) => { init[s.id] = "present"; });
      setAttendance(init);
    }).catch(() => setError("Failed to load students"));

    api.get("/staff-portal/dashboard").then(({ data }) => {
      if (data.staff?.class_id) setClassId(data.staff.class_id);
    }).catch(() => {});

    api.get("/sessions").then(({ data }) => {
      // Get terms for current session
      if (data[0]?.id) {
        return api.get(`/terms?sessionId=${data[0].id}`);
      }
    }).then((res) => {
      if (res?.data) {
        setTerms(res.data);
        const current = res.data.find((t) => t.is_current);
        if (current) setTermId(current.id);
      }
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  };

  const markAll = (status) => {
    const all = {};
    students.forEach((s) => { all[s.id] = status; });
    setAttendance(all);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!classId || !termId) {
      setError("Class or term information missing. Please check your profile.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const records = students.map((s) => ({
        studentId: s.id,
        status: attendance[s.id] || "present",
      }));
      await api.post("/attendance", { classId, termId, date, records });
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter((s) => s === "present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "absent").length;

  return (
    <div className="space-y-6">
      <FadeIn className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Attendance</h1>
          <p className="text-navy/50 text-sm mt-1">Record daily attendance for your class.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setSaved(false); }}
            className="px-4 py-2.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
          />
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 disabled:opacity-50 transition-all duration-200"
          >
            {saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Attendance"}
          </button>
        </div>
      </FadeIn>

      {error && (
        <FadeIn>
          <div className="bg-red-50 border border-red-200 rounded-xl2 px-4 py-3 text-sm text-red-600">{error}</div>
        </FadeIn>
      )}

      {!loading && students.length > 0 && (
        <FadeIn>
          <div className="bg-white rounded-xl2 shadow-card p-4 flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 font-medium">✓ {presentCount} Present</span>
              <span className="text-red-500 font-medium">✗ {absentCount} Absent</span>
              <span className="text-navy/50">{students.length} Total</span>
            </div>
            <div className="flex gap-2">
              <span className="text-xs text-navy/50 mr-1">Mark all:</span>
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => markAll(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 capitalize ${statusColors[s]}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-navy/40 text-sm animate-pulse">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-navy/40">
              <p className="text-sm">No students found. You may not be assigned as a class teacher.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">#</th>
                  <th className="text-left px-5 py-3 font-semibold">Student</th>
                  <th className="text-left px-5 py-3 font-semibold">Student ID</th>
                  <th className="text-left px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, i) => (
                  <tr key={student.id} className="border-t border-navy/5">
                    <td className="px-5 py-3 text-navy/40">{i + 1}</td>
                    <td className="px-5 py-3 font-medium text-navy">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="px-5 py-3 text-navy/50">{student.student_id}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-3 py-1 rounded-full text-xs font-medium border capitalize transition-all duration-200 ${
                              attendance[student.id] === status
                                ? statusColors[status]
                                : "border-navy/10 text-navy/40 hover:border-navy/20"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
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