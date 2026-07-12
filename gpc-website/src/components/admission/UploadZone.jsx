import { useState, useRef } from "react";
import { Upload, FileCheck, X } from "lucide-react";

export default function UploadZone({ label, required, accept, maxSizeMB, file, onChange, error }) {
  const [dragActive, setDragActive] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const inputRef = useRef(null);

  const validate = (f) => {
    if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) {
      return `File exceeds ${maxSizeMB}MB limit`;
    }
    return "";
  };

  const handleFile = (f) => {
    const err = validate(f);
    if (err) {
      setSizeError(err);
      return;
    }
    setSizeError("");
    onChange(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-navy/70">{label}</label>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            required ? "bg-gold/10 text-gold-dark" : "bg-navy/5 text-navy/40"
          }`}
        >
          {required ? "Required" : "Optional"}
        </span>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl2 border-2 border-dashed px-4 py-6 text-center transition-all duration-200 ${
          error
            ? "border-red-400 bg-red-50/50"
            : dragActive
            ? "border-gold bg-gold/5"
            : file
            ? "border-gold/40 bg-gold/[0.03]"
            : "border-navy/15 hover:border-gold/40 hover:bg-navy/[0.02]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {file ? (
          <div className="flex items-center justify-center gap-2 text-navy">
            <FileCheck size={18} className="text-gold" />
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="text-navy/40 hover:text-red-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className={`flex flex-col items-center gap-1 ${error ? "text-red-400" : "text-navy/40"}`}>
            <Upload size={20} />
            <span className="text-sm">
              Drag & drop or <span className="text-gold-dark font-medium">browse</span>
            </span>
            <span className="text-xs">Max {maxSizeMB}MB</span>
          </div>
        )}
      </div>
      {sizeError && <p className="text-red-500 text-xs mt-1">{sizeError}</p>}
      {error && !sizeError && <p className="text-red-500 text-xs mt-1">This document is required</p>}
    </div>
  );
}