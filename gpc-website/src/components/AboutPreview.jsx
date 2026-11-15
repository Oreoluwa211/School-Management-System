import FadeIn from "./FadeIn";

const pillars = [
  { icon: "🎯", title: "Mission", text: "To provide holistic, faith-driven education that empowers students to excel academically and morally." },
  { icon: "🔭", title: "Vision", text: "To be a leading center of academic excellence and character formation in Nigeria and beyond." },
  { icon: "💎", title: "Core Values", text: "Integrity, Diligence, Respect, Innovation, and Faith — the pillars that guide everything we do." },
];

export default function AboutPreview() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left images */}
        <FadeIn y={40}>
          <div className="relative h-[420px]">
            <img
              src="images\Secondary-school-images1.jfif"
              alt="School building"
              className="absolute top-0 left-0 w-3/4 h-3/4 object-cover rounded-xl2 shadow-card"
            />
            <img
              src="images\Secondary-school-images2.jfif"
              alt="Students studying"
              className="absolute bottom-0 right-0 w-2/3 h-2/3 object-cover rounded-xl2 shadow-card border-4 border-white"
            />
            <div className="absolute top-4 right-4 bg-gold text-navy font-serif font-bold px-5 py-3 rounded-full shadow-gold rotate-3">
              Est. 2003
            </div>
          </div>
        </FadeIn>

        {/* Right content */}
        <div>
          <FadeIn>
            <span className="text-gold-dark font-semibold text-sm uppercase tracking-widest">
              Who We Are
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mt-3 mb-5 leading-snug">
              More Than a School — A Community of Excellence
            </h2>
            <p className="text-navy/60 leading-relaxed mb-10 max-w-lg">
              For over two decades, Goodnews Private College has combined
              rigorous academics with strong moral foundations, producing
              graduates who excel in WAEC, JAMB, and life beyond the classroom.
            </p>
          </FadeIn>

          <div className="grid sm:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.1}>
                <div className="group bg-white border border-navy/10 rounded-xl2 p-5 hover:border-gold/50 hover:shadow-card hover:-translate-y-1 transition-all duration-300 h-full">
                  <span className="text-3xl">{p.icon}</span>
                  <h3 className="font-serif font-semibold text-navy mt-3 mb-1">{p.title}</h3>
                  <p className="text-sm text-navy/55 leading-relaxed">{p.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}