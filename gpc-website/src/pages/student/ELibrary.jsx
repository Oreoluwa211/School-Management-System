import { useState, useEffect } from "react";
import { BookOpen, Download, Search } from "lucide-react";
import api from "../../lib/api";
import FadeIn from "../../components/FadeIn";
import CustomSelect from "../../components/admission/CustomSelect";

const typeIcons = {
  ebook: "📗", past_question: "📝",
  reference: "📚", magazine: "📰", other: "📄",
};

const typeColors = {
  ebook: "bg-green-50 text-green-700",
  past_question: "bg-blue-50 text-blue-700",
  reference: "bg-purple-50 text-purple-700",
  magazine: "bg-amber-50 text-amber-700",
  other: "bg-navy/5 text-navy/60",
};

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "ebook", label: "📗 E-Books" },
  { value: "past_question", label: "📝 Past Questions" },
  { value: "reference", label: "📚 Reference" },
  { value: "magazine", label: "📰 Magazine" },
  { value: "other", label: "📄 Other" },
];

export default function ELibrary() {
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [type, setType] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/student-portal/library", { params: { type: type || undefined, subjectId: subjectId || undefined } })
      .then(({ data }) => {
        setResources(data.data);
        setSubjects([
          { value: "", label: "All Subjects" },
          ...data.subjects.map((s) => ({ value: s.id, label: s.name })),
        ]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type, subjectId]);

  const filtered = resources.filter((r) =>
    !search ||
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.author?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-navy">E-Library</h1>
        <p className="text-navy/50 text-sm mt-1">Access textbooks, past questions, and study materials.</p>
      </FadeIn>

      <FadeIn>
        <div className="bg-white rounded-xl2 shadow-card p-4 grid sm:grid-cols-[1fr_180px_180px] gap-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full pl-11 pr-4 py-2.5 rounded-xl2 border border-navy/15 text-navy text-sm focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-200"
            />
          </div>
          <CustomSelect value={type} onChange={setType} options={typeOptions} placeholder="All Types" />
          <CustomSelect value={subjectId} onChange={setSubjectId} options={subjects} placeholder="All Subjects" />
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl2 shadow-card p-5 animate-pulse border border-navy/5">
              <div className="h-5 bg-navy/5 rounded w-2/3 mb-3" />
              <div className="h-4 bg-navy/5 rounded w-full mb-2" />
              <div className="h-8 bg-navy/5 rounded-full w-1/3 mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <FadeIn>
          <div className="text-center py-20 bg-white rounded-xl2 shadow-card border border-navy/5">
            <BookOpen size={32} className="mx-auto mb-3 text-navy/20" />
            <p className="text-navy/40 text-sm">No resources found.</p>
          </div>
        </FadeIn>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r, i) => (
            <FadeIn key={r.id} delay={i * 0.04}>
              <div className="bg-white rounded-xl2 shadow-card border border-navy/5 p-5 hover:-translate-y-1 hover:shadow-[0_12px_40px_-12px_rgba(10,22,40,0.2)] transition-all duration-300 flex flex-col h-full">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl shrink-0">{typeIcons[r.resource_type] || "📄"}</span>
                  <div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${typeColors[r.resource_type]}`}>
                      {r.resource_type.replace("_", " ")}
                    </span>
                    {r.subject && (
                      <p className="text-xs text-gold-dark font-medium mt-1">{r.subject.name}</p>
                    )}
                  </div>
                </div>

                <h3 className="font-serif font-semibold text-navy mb-1 leading-snug">{r.title}</h3>
                {r.author && <p className="text-xs text-navy/50 mb-2">by {r.author}</p>}
                {r.description && (
                  <p className="text-navy/60 text-sm leading-relaxed line-clamp-2 mb-3 flex-1">{r.description}</p>
                )}

                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full bg-gold text-navy font-semibold text-sm shadow-gold hover:bg-gold-light hover:scale-105 transition-all duration-200 mt-auto"
                >
                  <Download size={16} /> Access Resource
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}