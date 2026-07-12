import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function StaffDetailModal({ staff, onClose, onToggleActive }) {
  if (!staff) return null;
  const s = staff;
  const isActive = s.user?.is_active ?? true;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl2 shadow-card max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10 sticky top-0 bg-white">
            <div>
              <h2 className="font-serif text-xl font-bold text-navy">
                {s.first_name} {s.middle_name} {s.last_name}
              </h2>
              <p className="text-navy/40 text-sm">{s.staff_id} · {s.designation}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
              }`}>
                {isActive ? "Active" : "Inactive"}
              </span>
              <button onClick={onClose} className="text-navy/40 hover:text-navy transition-colors">
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <Section title="Personal Information">
              <Field label="Email" value={s.email} />
              <Field label="Phone" value={s.phone} />
              <Field label="Gender" value={s.gender} />
              <Field label="State of Origin" value={s.state_of_origin} />
              <Field label="Date of Birth" value={s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : null} />
              <Field label="Address" value={s.address} full />
            </Section>

            <Section title="Employment">
              <Field label="Staff ID" value={s.staff_id} />
              <Field label="Designation" value={s.designation} />
              <Field label="Department" value={s.department} />
              <Field label="Qualification" value={s.qualification} />
              <Field label="Date Employed" value={s.date_employed ? new Date(s.date_employed).toLocaleDateString() : null} />
              <Field label="Class Teacher" value={s.is_class_teacher ? `Yes${s.class ? ` — ${s.class.name} ${s.class.arm}` : ""}` : "No"} />
            </Section>

            {s.subject_assignments?.length > 0 && (
              <Section title="Subject Assignments">
                <div className="sm:col-span-2 flex flex-wrap gap-2">
                  {s.subject_assignments.map((a) => (
                    <span key={a.id} className="px-3 py-1 bg-gold/10 text-gold-dark text-xs font-medium rounded-full">
                      {a.subject.name} — {a.class.name} {a.class.arm}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {s.user && (
              <Section title="Portal Access">
                <Field label="Portal Email" value={s.user.email} />
                <Field label="Last Login" value={s.user.last_login ? new Date(s.user.last_login).toLocaleString() : "Never"} />
              </Section>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy/10 sticky bottom-0 bg-white">
            <button
              onClick={() => onToggleActive(s.id, isActive)}
              className={`px-5 py-2.5 rounded-full border font-medium text-sm transition-all duration-200 ${
                isActive
                  ? "border-red-200 text-red-500 hover:bg-red-50"
                  : "border-green-200 text-green-600 hover:bg-green-50"
              }`}
            >
              {isActive ? "Deactivate Account" : "Activate Account"}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="font-serif font-semibold text-navy mb-3">{title}</h3>
      <dl className="grid sm:grid-cols-2 gap-3 text-sm">{children}</dl>
    </section>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-navy/40 text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-navy/80 font-medium">{value || "—"}</dd>
    </div>
  );
}