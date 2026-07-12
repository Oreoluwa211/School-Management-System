import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function StudentDetailModal({ student, onClose }) {
  if (!student) return null;
  const s = student;

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
              <p className="text-navy/40 text-sm">{s.student_id}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                s.status === "active" ? "bg-green-100 text-green-700" :
                s.status === "suspended" ? "bg-amber-100 text-amber-700" :
                "bg-navy/10 text-navy/50"
              }`}>
                {s.status}
              </span>
              <button onClick={onClose} className="text-navy/40 hover:text-navy transition-colors">
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <Section title="Personal Information">
              <Field label="Date of Birth" value={s.date_of_birth ? new Date(s.date_of_birth).toLocaleDateString() : "—"} />
              <Field label="Gender" value={s.gender} />
              <Field label="Religion" value={s.religion} />
              <Field label="State of Origin" value={s.state_of_origin} />
              <Field label="Blood Group" value={s.blood_group} />
              <Field label="Genotype" value={s.genotype} />
              <Field label="Boarding Type" value={s.boarding_type} />
              <Field label="Address" value={s.address} full />
            </Section>

            <Section title="Academic">
              <Field label="Class" value={s.class ? `${s.class.name} ${s.class.arm}` : "—"} />
              <Field label="Student ID" value={s.student_id} />
              <Field label="Portal Email" value={s.email} />
            </Section>

            <Section title="Parent / Guardian">
              <Field label="Father's Name" value={s.father_name} />
              <Field label="Father's Phone" value={s.father_phone} />
              <Field label="Father's Email" value={s.father_email} />
              <Field label="Mother's Name" value={s.mother_name} />
              <Field label="Mother's Phone" value={s.mother_phone} />
              <Field label="Emergency Contact" value={s.emergency_name} />
              <Field label="Emergency Phone" value={s.emergency_phone} />
            </Section>

            {s.medical_notes && (
              <Section title="Medical Notes">
                <p className="text-sm text-navy/70 sm:col-span-2">{s.medical_notes}</p>
              </Section>
            )}
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