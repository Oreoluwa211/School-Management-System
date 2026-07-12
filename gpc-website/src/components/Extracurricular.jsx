import FadeIn from "./FadeIn";

const activities = [
  { icon: "⚽", title: "Sports & Athletics", text: "Football, basketball, athletics and inter-house competitions." },
  { icon: "🎭", title: "Drama & Arts", text: "Theatre productions, cultural displays, and creative arts." },
  { icon: "🎵", title: "Music & Band", text: "School choir, instrumental band, and music theory classes." },
  { icon: "💻", title: "Tech & Coding Club", text: "Robotics, programming, and digital innovation projects." },
  { icon: "📖", title: "Debate & Quiz", text: "Public speaking, debate society, and inter-school quiz competitions." },
  { icon: "🌿", title: "Eco & Science Club", text: "Environmental projects, science fairs, and field research." },
  { icon: "🙏", title: "Fellowship & CDS", text: "Spiritual growth through fellowship and community service." },
  { icon: "👑", title: "Leadership Academy", text: "Mentorship and leadership training for prefects and student leaders." },
];

export default function Extracurricular() {
  return (
    <section className="py-24 bg-navy">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-14">
          <span className="text-gold font-semibold text-sm uppercase tracking-widest">
            Beyond the Classroom
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2">
            Extracurricular Activities
          </h2>
        </FadeIn>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {activities.map((a, i) => (
            <FadeIn key={a.title} delay={(i % 4) * 0.08}>
              <div className="group bg-white/[0.03] border border-white/10 rounded-xl2 p-6 hover:bg-white/[0.06] hover:border-gold/40 hover:-translate-y-1.5 transition-all duration-300 h-full">
                <span className="text-3xl">{a.icon}</span>
                <h3 className="font-serif font-semibold text-white mt-4 mb-1 relative inline-block">
                  {a.title}
                  <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gold transition-all duration-300 group-hover:w-full" />
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mt-2">{a.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}