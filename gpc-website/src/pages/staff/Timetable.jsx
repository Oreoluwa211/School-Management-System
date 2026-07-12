import { useState, useEffect } from "react";
import { Calendar, Download, Upload } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function Timetable() {
  const [timetable, setTimetable] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    api.get("/staff-portal/dashboard").then(({ data }) => {
      const staff = data.staff;
      setClassInfo(staff?.class);
      setAssignments(staff?.subject_assignments || []);

      if (staff?.class_id) {
        return api.get("/timetables", { params: { classId: staff.class_id } });
      }
    }).then((res) => {
      if (res?.data?.data?.[0]) {
        setTimetable(res.data.data[0]);
      }
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-white rounded-xl2 w-1/3" />
        <div className="h-64 bg-white rounded-xl2" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">Timetable</h1>
        <p className="text-navy/50 text-sm mt-1">
          {classInfo
            ? `Class timetable for ${classInfo.name} ${classInfo.arm}`
            : "Your class timetable"}
        </p>
      </FadeIn>

      {timetable ? (
        <FadeIn>
          <div className="bg-white rounded-xl2 shadow-card p-6 border border-navy/5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif font-semibold text-navy">{timetable.title}</h2>
              <a
                href={timetable.file_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-navy/15 text-navy/70 text-sm font-medium hover:border-gold hover:text-gold-dark transition-all duration-200"
              >
                <Download size={16} /> Download Timetable
              </a>
            </div>

            {/* Embedded PDF or link */}
            {timetable.file_url?.endsWith(".pdf") ? (
              <iframe
                src={timetable.file_url}
                className="w-full h-[500px] rounded-xl2 border border-navy/5"
                title="Timetable"
              />
            ) : (
              <div className="text-center py-12 bg-[#faf8f3] rounded-xl2">
                <Calendar size={32} className="mx-auto mb-3 text-navy/30" />
                <p className="text-navy/50 text-sm">
                  Timetable file available.{" "}
                  <a href={timetable.file_url} target="_blank" rel="noreferrer" className="text-gold-dark hover:underline">
                    Click to view
                  </a>
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      ) : (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5">
            <Calendar size={40} className="mx-auto mb-4 text-navy/20" />
            <h3 className="font-serif font-semibold text-navy mb-2">No Timetable Yet</h3>
            <p className="text-navy/40 text-sm max-w-sm mx-auto">
              Your timetable hasn't been uploaded yet. Contact the admin to upload it.
            </p>
          </div>
        </FadeIn>
      )}

      {/* Subject assignments summary */}
      <FadeIn delay={0.1}>
        <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-6">
          <h2 className="font-serif font-semibold text-navy mb-4">My Teaching Schedule</h2>
          {assignments.length === 0 ? (
            <p className="text-navy/40 text-sm">No subject assignments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#faf8f3] text-navy/50 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-semibold">Subject</th>
                    <th className="text-left px-4 py-3 font-semibold">Class</th>
                    <th className="text-left px-4 py-3 font-semibold">Level</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => (
                    <tr key={a.id} className="border-t border-navy/5 hover:bg-[#faf8f3] transition-colors">
                      <td className="px-4 py-3 font-medium text-navy">{a.subject.name}</td>
                      <td className="px-4 py-3 text-navy/70">{a.class.name} {a.class.arm}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gold/10 text-gold-dark">
                          {a.class.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}