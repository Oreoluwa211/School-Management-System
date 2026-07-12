import UploadZone from "./UploadZone";

export default function StepDocuments({ data, onChange, errors = {} }) {
  const set = (field) => (file) => onChange({ ...data, [field]: file });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-navy mb-1">Document Uploads</h2>
        <p className="text-navy/50 text-sm">Please upload clear scans or photos of the following documents.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <UploadZone label="Passport Photograph" required accept="image/*" maxSizeMB={2} file={data.passport} onChange={set("passport")} error={errors.passport} />
        <UploadZone label="Birth Certificate" required accept="image/*,application/pdf" maxSizeMB={5} file={data.birthCert} onChange={set("birthCert")} error={errors.birthCert} />
        <UploadZone label="Medical Fitness Report" required accept="image/*,application/pdf" maxSizeMB={5} file={data.medicalReport} onChange={set("medicalReport")} error={errors.medicalReport} />
        <UploadZone label="Last Academic Report" required accept="image/*,application/pdf" maxSizeMB={5} file={data.academicReport} onChange={set("academicReport")} error={errors.academicReport} />
        <UploadZone label="Additional Document" accept="*" maxSizeMB={5} file={data.extraDoc} onChange={set("extraDoc")} />
      </div>
    </div>
  );
}