import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Check, Ban } from "lucide-react";
import StatusBadge from "./StatusBadge";
import api from "../../lib/api";

const docFields = [
  { key: "passport_url", label: "Passport Photo" },
  { key: "birth_cert_url", label: "Birth Certificate" },
  { key: "medical_report_url", label: "Medical Report" },
  { key: "academic_report_url", label: "Academic Report" },
  { key: "extra_doc_url", label: "Additional Document" },
];

export default function ApplicationDetailModal({ application, onClose, onApprove, onReject }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");

  if (!application) return null;
  const a = application;

  const canApprove = ["pending", "review"].includes(a.status);
  const canReject = ["pending", "review", "approved"].includes(a.status);

  const handleDownloadLetter = async () => {
    try {
      const res = await api.get(
        `/export/acceptance-letter/${a.id}`,
        { responseType: "blob" }
      );
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `acceptance-letter-${a.reference_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to generate letter. Ensure application is approved.");
    }
  };

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
                {a.first_name} {a.middle_name} {a.last_name}
              </h2>
              <p className="text-navy/40 text-sm">{a.reference_number}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={a.status} />
              <button onClick={onClose} className="text-navy/40 hover:text-navy transition-colors">
                <X size={22} />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <section>
              <h3 className="font-serif font-semibold text-navy mb-3">Student Information</h3>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label="Date of Birth" value={new Date(a.date_of_birth).toLocaleDateString()} />
                <Field label="Gender" value={a.gender} />
                <Field label="Religion" value={a.religion} />
                <Field label="State of Origin" value={a.state_of_origin} />
                <Field label="LGA" value={a.lga} />
                <Field label="Class Applying For" value={a.class_applying_for} />
                <Field label="Boarding Type" value={a.boarding_type} />
                <Field label="Address" value={a.address} full />
                {a.medical_notes && <Field label="Medical Notes" value={a.medical_notes} full />}
              </dl>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-navy mb-3">Parent / Guardian</h3>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <Field label="Father's Name" value={a.father_name} />
                <Field label="Father's Phone" value={a.father_phone} />
                <Field label="Father's Email" value={a.father_email} />
                <Field label="Father's Occupation" value={a.father_occupation} />
                <Field label="Mother's Name" value={a.mother_name} />
                <Field label="Mother's Phone" value={a.mother_phone} />
                <Field label="Emergency Contact" value={a.emergency_name} />
                <Field label="Emergency Phone" value={a.emergency_phone} />
                <Field label="Preferred Communication" value={a.preferred_comm} />
              </dl>
            </section>

            <section>
              <h3 className="font-serif font-semibold text-navy mb-3">Documents</h3>
              <div className="flex flex-wrap gap-2">
                {docFields.map(({ key, label }) =>
                  a[key] ? (
                    <a key={key} href={a[key]} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 text-gold-dark text-xs font-medium hover:bg-gold/20 transition-colors duration-200">
                      <FileText size={14} /> {label}
                    </a>
                  ) : null
                )}
              </div>
            </section>

            {a.status === "rejected" && a.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-xl2 p-4">
                <p className="text-sm text-red-600"><strong>Rejection reason:</strong> {a.rejection_reason}</p>
              </div>
            )}

            {rejectMode && (
              <div className="bg-red-50 border border-red-200 rounded-xl2 p-4">
                <label className="block text-sm font-medium text-red-700 mb-2">Reason for rejection *</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl2 border border-red-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-red-200 min-h-[80px] resize-none"
                  placeholder="Explain why this application is being rejected..."
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-navy/10 sticky bottom-0 bg-white">
            <button onClick={onClose} className="px-5 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark transition-all duration-200">
              Close
            </button>

            {canReject && !rejectMode && (
              <button onClick={() => setRejectMode(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-200 text-red-500 font-medium hover:bg-red-50 transition-all duration-200">
                <Ban size={16} /> Reject
              </button>
            )}

            {rejectMode && (
              <button
                onClick={() => reason.trim() && onReject(a.id, reason)}
                disabled={!reason.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 disabled:opacity-40 transition-all duration-200"
              >
                <Ban size={16} /> Confirm Rejection
              </button>
            )}

            {canApprove && !rejectMode && (
              <button onClick={() => onApprove(a.id)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200">
                <Check size={16} /> Approve
              </button>
            )}
            {["approved", "fee_paid", "enrolled"].includes(a.status) && (
              <button
                onClick={handleDownloadLetter}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/30 text-gold-dark font-medium text-sm hover:bg-gold/5 transition-all duration-200"
              >
                📄 Download Letter
              </button>
            )}
            
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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