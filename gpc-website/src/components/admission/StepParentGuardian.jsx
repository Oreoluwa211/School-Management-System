import CustomSelect from "./CustomSelect";

const labelClass = "block text-sm font-medium text-navy/70 mb-1.5";

function inputClass(error) {
  return `w-full px-4 py-2.5 rounded-xl2 border bg-white text-navy text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
    error ? "border-red-400 ring-2 ring-red-100" : "border-navy/15 focus:border-gold focus:ring-gold/20"
  }`;
}

function ErrorText({ msg }) {
  if (!msg) return null;
  return <p className="text-red-500 text-xs mt-1">{msg}</p>;
}

export default function StepParentGuardian({ data, onChange, errors = {} }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  const setSelect = (field) => (val) => onChange({ ...data, [field]: val });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-bold text-navy mb-1">Parent / Guardian Information</h2>
        <p className="text-navy/50 text-sm">We'll use these details to keep you informed throughout the process.</p>
      </div>

      {/* Father */}
      <div className="bg-[#faf8f3] rounded-xl2 p-5 border border-navy/5">
        <h3 className="font-serif font-semibold text-navy mb-4">Father's Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Name *</label>
            <input className={inputClass(errors.fatherName)} value={data.fatherName || ""} onChange={set("fatherName")} />
            <ErrorText msg={errors.fatherName} />
          </div>
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input className={inputClass(errors.fatherPhone)} value={data.fatherPhone || ""} onChange={set("fatherPhone")} placeholder="08012345678" />
            <ErrorText msg={errors.fatherPhone} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input type="email" className={inputClass(errors.fatherEmail)} value={data.fatherEmail || ""} onChange={set("fatherEmail")} />
            <ErrorText msg={errors.fatherEmail} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Occupation</label>
            <input className={inputClass()} value={data.fatherOccupation || ""} onChange={set("fatherOccupation")} />
          </div>
        </div>
      </div>

      {/* Mother */}
      <div className="bg-[#faf8f3] rounded-xl2 p-5 border border-navy/5">
        <h3 className="font-serif font-semibold text-navy mb-4">Mother's Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelClass}>Full Name</label>
            <input className={inputClass()} value={data.motherName || ""} onChange={set("motherName")} />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input className={inputClass()} value={data.motherPhone || ""} onChange={set("motherPhone")} placeholder="08012345678" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input type="email" className={inputClass()} value={data.motherEmail || ""} onChange={set("motherEmail")} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Occupation</label>
            <input className={inputClass()} value={data.motherOccupation || ""} onChange={set("motherOccupation")} />
          </div>
        </div>
      </div>

      {/* Emergency contact */}
      <div className="bg-[#faf8f3] rounded-xl2 p-5 border border-navy/5">
        <h3 className="font-serif font-semibold text-navy mb-4">Emergency Contact</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Full Name *</label>
            <input className={inputClass(errors.emergencyName)} value={data.emergencyName || ""} onChange={set("emergencyName")} />
            <ErrorText msg={errors.emergencyName} />
          </div>
          <div>
            <label className={labelClass}>Relationship</label>
            <CustomSelect
              value={data.emergencyRelation}
              onChange={setSelect("emergencyRelation")}
              options={["Father", "Mother", "Uncle", "Aunt", "Sibling", "Guardian", "Other"]}
              placeholder="Select relationship"
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input className={inputClass(errors.emergencyPhone)} value={data.emergencyPhone || ""} onChange={set("emergencyPhone")} placeholder="08012345678" />
            <ErrorText msg={errors.emergencyPhone} />
          </div>
        </div>
      </div>

      {/* Preferred communication */}
      <div>
        <label className={labelClass}>Preferred Communication Method</label>
        <div className="flex gap-3 flex-wrap">
          {["Email", "Phone Call", "WhatsApp"].map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onChange({ ...data, preferredComm: method })}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                data.preferredComm === method
                  ? "bg-gold text-navy border-gold shadow-gold"
                  : "border-navy/15 text-navy/60 hover:border-gold/50"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}