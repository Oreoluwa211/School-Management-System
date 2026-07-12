import { Check, X } from "lucide-react";

function SummaryCard({ title, fields }) {
  return (
    <div className="bg-[#faf8f3] rounded-xl2 p-5 border border-navy/5">
      <h3 className="font-serif font-semibold text-navy mb-3">{title}</h3>
      <dl className="grid sm:grid-cols-2 gap-3 text-sm">
        {fields.map(([label, value]) => (
          <div key={label}>
            <dt className="text-navy/40 text-xs uppercase tracking-wide">{label}</dt>
            <dd className="text-navy/80 font-medium">{value || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const docLabels = {
  passport: "Passport Photograph",
  birthCert: "Birth Certificate",
  medicalReport: "Medical Fitness Report",
  academicReport: "Last Academic Report",
  extraDoc: "Additional Document",
};

export default function StepReview({ data, declared, onDeclareChange }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-navy mb-1">Review & Submit</h2>
        <p className="text-navy/50 text-sm">Please confirm everything below is correct before submitting.</p>
      </div>

      <SummaryCard
        title="Student Information"
        fields={[
          ["Full Name", `${data.firstName || ""} ${data.middleName || ""} ${data.lastName || ""}`.trim()],
          ["Date of Birth", data.dob],
          ["Gender", data.gender],
          ["Religion", data.religion],
          ["State of Origin", data.state],
          ["LGA", data.lga],
          ["Class Applying For", data.classApplying],
          ["Boarding Type", data.boardingType],
          ["Address", data.address],
        ]}
      />

      <SummaryCard
        title="Parent / Guardian"
        fields={[
          ["Father's Name", data.fatherName],
          ["Father's Phone", data.fatherPhone],
          ["Father's Email", data.fatherEmail],
          ["Mother's Name", data.motherName],
          ["Mother's Phone", data.motherPhone],
          ["Emergency Contact", data.emergencyName],
          ["Emergency Phone", data.emergencyPhone],
          ["Preferred Communication", data.preferredComm],
        ]}
      />

      <div className="bg-[#faf8f3] rounded-xl2 p-5 border border-navy/5">
        <h3 className="font-serif font-semibold text-navy mb-3">Documents</h3>
        <ul className="space-y-2">
          {Object.entries(docLabels).map(([key, label]) => {
            const uploaded = !!data[key];
            return (
              <li key={key} className="flex items-center justify-between text-sm">
                <span className="text-navy/70">{label}</span>
                {uploaded ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Check size={16} /> Uploaded
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-navy/30 font-medium">
                    <X size={16} /> {key === "extraDoc" ? "Not provided" : "Missing"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <label className="flex items-start gap-3 cursor-pointer bg-gold/5 border border-gold/20 rounded-xl2 p-4 hover:border-gold/40 transition-colors duration-200">
        <input
          type="checkbox"
          checked={declared}
          onChange={(e) => onDeclareChange(e.target.checked)}
          className="mt-1 w-4 h-4 accent-[#c9a84c]"
        />
        <span className="text-sm text-navy/70 leading-relaxed">
          I declare that all information provided in this application is true and accurate
          to the best of my knowledge. I understand that providing false information may
          result in the rejection of this application.
        </span>
      </label>
    </div>
  );
}