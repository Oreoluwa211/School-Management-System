import CustomSelect from "./CustomSelect";

const states = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
];

const classes = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];

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

export default function StepStudentInfo({ data, onChange, errors = {} }) {
  const set = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  const setSelect = (field) => (val) => onChange({ ...data, [field]: val });

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-navy mb-1">Student Information</h2>
      <p className="text-navy/50 text-sm mb-6">Tell us about the student applying for admission.</p>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>First Name *</label>
          <input className={inputClass(errors.firstName)} value={data.firstName || ""} onChange={set("firstName")} />
          <ErrorText msg={errors.firstName} />
        </div>
        <div>
          <label className={labelClass}>Middle Name</label>
          <input className={inputClass()} value={data.middleName || ""} onChange={set("middleName")} />
        </div>
        <div>
          <label className={labelClass}>Last Name *</label>
          <input className={inputClass(errors.lastName)} value={data.lastName || ""} onChange={set("lastName")} />
          <ErrorText msg={errors.lastName} />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Date of Birth *</label>
          <input type="date" className={inputClass(errors.dob)} value={data.dob || ""} onChange={set("dob")} />
          <ErrorText msg={errors.dob} />
        </div>
        <div>
          <label className={labelClass}>Gender *</label>
          <CustomSelect
            value={data.gender}
            onChange={setSelect("gender")}
            options={["Male", "Female"]}
            placeholder="Select gender"
            error={errors.gender}
          />
          <ErrorText msg={errors.gender} />
        </div>
        <div>
          <label className={labelClass}>Religion</label>
          <CustomSelect
            value={data.religion}
            onChange={setSelect("religion")}
            options={["Christianity", "Islam", "Other"]}
            placeholder="Select religion"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>State of Origin *</label>
          <CustomSelect
            value={data.state}
            onChange={setSelect("state")}
            options={states}
            placeholder="Select state"
            error={errors.state}
          />
          <ErrorText msg={errors.state} />
        </div>
        <div>
          <label className={labelClass}>LGA</label>
          <input className={inputClass()} value={data.lga || ""} onChange={set("lga")} placeholder="e.g. Ibadan North" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Home Address *</label>
        <textarea
          className={inputClass(errors.address) + " min-h-[90px] resize-none"}
          value={data.address || ""}
          onChange={set("address")}
        />
        <ErrorText msg={errors.address} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Class Applying For *</label>
          <CustomSelect
            value={data.classApplying}
            onChange={setSelect("classApplying")}
            options={classes}
            placeholder="Select class"
            error={errors.classApplying}
          />
          <ErrorText msg={errors.classApplying} />
        </div>
        <div>
          <label className={labelClass}>Boarding Type *</label>
          <CustomSelect
            value={data.boardingType}
            onChange={setSelect("boardingType")}
            options={["Day Student", "Full Boarder", "Weekly Boarder"]}
            placeholder="Select boarding type"
            error={errors.boardingType}
          />
          <ErrorText msg={errors.boardingType} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Medical Conditions / Allergies (optional)</label>
        <textarea
          className={inputClass() + " min-h-[80px] resize-none"}
          value={data.medicalNotes || ""}
          onChange={set("medicalNotes")}
          placeholder="List any known allergies, conditions, or medications..."
        />
      </div>
    </div>
  );
}