import api from "../lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";
import PageHero from "../components/PageHero";
import FadeIn from "../components/FadeIn";
import Stepper from "../components/admission/Stepper";
import AdmissionSidebar from "../components/admission/AdmissionSidebar";
import StepStudentInfo from "../components/admission/StepStudentInfo";
import StepParentGuardian from "../components/admission/StepParentGuardian";
import StepDocuments from "../components/admission/StepDocuments";
import StepReview from "../components/admission/StepReview";
import SuccessScreen from "../components/admission/SuccessScreen";

const REQUIRED_FIELDS = {
  0: ["firstName", "lastName", "dob", "gender", "state", "address", "classApplying", "boardingType"],
  1: ["fatherName", "fatherPhone", "fatherEmail", "emergencyName", "emergencyPhone"],
  2: ["passport", "birthCert", "medicalReport", "academicReport"],
};

const FIELD_LABELS = {
  firstName: "First name", lastName: "Last name", dob: "Date of birth", gender: "Gender",
  state: "State of origin", address: "Home address", classApplying: "Class applying for",
  boardingType: "Boarding type", fatherName: "Father's name", fatherPhone: "Father's phone",
  fatherEmail: "Father's email", emergencyName: "Emergency contact name", emergencyPhone: "Emergency phone",
  passport: "Passport photograph", birthCert: "Birth certificate", medicalReport: "Medical fitness report",
  academicReport: "Last academic report",
};

function validateStep(step, data) {
  const required = REQUIRED_FIELDS[step] || [];
  const errors = {};
  required.forEach((field) => {
    if (!data[field]) errors[field] = `${FIELD_LABELS[field]} is required`;
  });
  return errors;
}

export default function Apply() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [declared, setDeclared] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState("");
  const [shake, setShake] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const triggerShake = () => setShake((s) => s + 1);

  const next = () => {
    const stepErrors = validateStep(step, formData);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      triggerShake();
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleChange = (newData) => {
    setFormData(newData);
    if (Object.keys(errors).length) {
      const remaining = validateStep(step, newData);
      setErrors(remaining);
    }
  };

  const handleSubmit = async () => {
    if (!declared) {
      triggerShake();
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const payload = new FormData();

      const textFields = [
        "firstName", "middleName", "lastName", "dob", "gender", "religion",
        "state", "lga", "address", "classApplying", "boardingType", "medicalNotes",
        "fatherName", "fatherPhone", "fatherEmail", "fatherOccupation",
        "motherName", "motherPhone", "motherEmail", "motherOccupation",
        "emergencyName", "emergencyPhone", "emergencyRelation", "preferredComm",
      ];
      textFields.forEach((field) => {
        if (formData[field]) payload.append(field, formData[field]);
      });

      const fileFields = ["passport", "birthCert", "medicalReport", "academicReport", "extraDoc"];
      fileFields.forEach((field) => {
        if (formData[field]) payload.append(field, formData[field]);
      });

      const { data } = await api.post("/admissions", payload);

      setReference(data.reference_number);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Failed to submit application. Please try again."
      );
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <PageHero title="Application Received" subtitle="Goodnews Private College" />
        <section className="py-16 bg-[#faf8f3]">
          <SuccessScreen reference={reference} />
        </section>
      </>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <>
      <PageHero
        title="Admission Application"
        subtitle="Begin your journey at Goodnews Private College — fill out the form below to apply."
      />

      <section className="py-16 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-[1fr_320px] gap-10">
          <FadeIn>
            <motion.div
              key={shake}
              animate={shake ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl2 shadow-card p-6 md:p-10"
            >
              <Stepper current={step} />

              <AnimatePresence>
                {errorCount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl2 px-4 py-3">
                      <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">
                        Please complete all required fields (marked *) before continuing —{" "}
                        {errorCount} {errorCount === 1 ? "field" : "fields"} missing.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {step === 0 && (
                <StepStudentInfo data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 1 && (
                <StepParentGuardian data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 2 && (
                <StepDocuments data={formData} onChange={handleChange} errors={errors} />
              )}
              {step === 3 && (
                <StepReview data={formData} declared={declared} onDeclareChange={setDeclared} />
              )}

              {submitError && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl2 px-4 py-3 mt-6">
                  <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{submitError}</p>
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t border-navy/10">
                <button
                  onClick={back}
                  disabled={step === 0}
                  className="px-6 py-2.5 rounded-full border border-navy/15 text-navy/70 font-medium hover:border-gold hover:text-gold-dark disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                >
                  ← Back
                </button>

                {step < 3 ? (
                  <button
                    onClick={next}
                    className="px-7 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`px-7 py-2.5 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light active:scale-95 transition-all duration-200 ${
                      declared && !submitting
                        ? "hover:scale-105"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                  >
                    {submitting ? "Submitting..." : "Submit Application"}
                  </button>
                )}
              </div>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <AdmissionSidebar />
          </FadeIn>
        </div>
      </section>
    </>
  );
}