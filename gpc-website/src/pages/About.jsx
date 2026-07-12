import PageHero from "../components/PageHero";
import FadeIn from "../components/FadeIn";
import Accordion from "../components/Accordion";

const coreValues = [
  { icon: "🤝", title: "Integrity", text: "We act with honesty and strong moral principles in all we do." },
  { icon: "📚", title: "Diligence", text: "We commit to hard work, consistency, and excellence in every task." },
  { icon: "🙏", title: "Respect", text: "We honor the dignity of every individual within our community." },
  { icon: "💡", title: "Innovation", text: "We embrace creativity and forward-thinking in learning and life." },
  { icon: "✝️", title: "Faith", text: "We nurture spiritual growth alongside academic development." },
];

const conduct = [
  { title: "Attendance & Punctuality", content: "Students are expected to arrive at school by 7:30am and maintain regular attendance. Repeated lateness or absence without valid reason attracts disciplinary action." },
  { title: "Uniform & Appearance", content: "All students must wear the prescribed school uniform neatly at all times. Hair, footwear, and accessories must conform to school grooming standards." },
  { title: "Academic Honesty", content: "Examination malpractice, plagiarism, and any form of dishonesty in academic work are strictly prohibited and will result in severe consequences." },
  { title: "Respect for Others", content: "Bullying, harassment, and disrespect toward staff or fellow students will not be tolerated. GPC promotes a culture of kindness and mutual respect." },
  { title: "Use of School Property", content: "Students must take care of school facilities, equipment, and materials. Willful damage will result in cost recovery from parents/guardians." },
];

const leadership = [
  {
    name: "Mrs. Adebayo Folake",
    role: "Principal",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    bio: "With over 20 years in education leadership, Mrs. Adebayo champions academic excellence and character formation at GPC.",
  },
  {
    name: "Mr. Emmanuel Adeyemi",
    role: "Vice Principal (Academics)",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
    bio: "Mr. Adeyemi oversees curriculum delivery and academic standards, ensuring every student reaches their full potential.",
  },
];

export default function About() {
  return (
    <>
      <PageHero
        title="About Goodnews Private College"
        subtitle="Two decades of nurturing excellence, faith, and integrity in Nigerian secondary education."
      />

      {/* Biography */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <div className="relative rounded-xl2 overflow-hidden shadow-card aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80"
                alt="GPC campus"
                className="w-full h-full object-cover"
              />
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <span className="text-gold-dark font-semibold text-sm uppercase tracking-widest">Our Story</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mt-3 mb-5 leading-snug">
              Two Decades of Academic Excellence
            </h2>
            <p className="text-navy/60 leading-relaxed mb-4">
              Founded in 2003, Goodnews Private College began as a small community
              school with a bold vision: to raise a generation of disciplined,
              knowledgeable, and faith-driven young Nigerians equipped to lead
              with integrity.
            </p>
            <p className="text-navy/60 leading-relaxed">
              Today, GPC stands as one of the region's most trusted secondary
              institutions, combining a rigorous WAEC/JAMB-aligned curriculum with
              a nurturing boarding and day-school environment, modern facilities,
              and a dedicated team of over 80 staff members committed to student
              success.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-24 bg-[#faf8f3]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-8">
          <FadeIn>
            <div className="bg-white rounded-xl2 shadow-card p-8 h-full border-t-4 border-gold hover:-translate-y-1 transition-transform duration-300">
              <span className="text-3xl">🔭</span>
              <h3 className="font-serif text-2xl font-bold text-navy mt-4 mb-3">Our Vision</h3>
              <p className="text-navy/60 leading-relaxed">
                To be a leading center of academic excellence and character
                formation, producing graduates who are globally competitive and
                grounded in strong values.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-xl2 shadow-card p-8 h-full border-t-4 border-gold hover:-translate-y-1 transition-transform duration-300">
              <span className="text-3xl">🎯</span>
              <h3 className="font-serif text-2xl font-bold text-navy mt-4 mb-3">Our Mission</h3>
              <p className="text-navy/60 leading-relaxed">
                To provide holistic, faith-driven education through quality
                teaching, strong discipline, and a supportive environment that
                empowers every student to excel.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FadeIn className="text-center mb-14">
            <span className="text-gold font-semibold text-sm uppercase tracking-widest">What Guides Us</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mt-2">Core Values</h2>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-5">
            {coreValues.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.08}>
                <div className="group bg-white/[0.03] border border-white/10 rounded-xl2 p-6 text-center hover:bg-white/[0.06] hover:border-gold/40 hover:-translate-y-1.5 transition-all duration-300 h-full">
                  <span className="text-3xl">{v.icon}</span>
                  <h3 className="font-serif font-semibold text-white mt-3 mb-1">{v.title}</h3>
                  <p className="text-white/50 text-xs leading-relaxed">{v.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Code of Conduct */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <FadeIn className="text-center mb-12">
            <span className="text-gold-dark font-semibold text-sm uppercase tracking-widest">Our Standards</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mt-2">Code of Conduct</h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <Accordion items={conduct} />
          </FadeIn>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-24 bg-[#faf8f3]">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <FadeIn className="text-center mb-14">
            <span className="text-gold-dark font-semibold text-sm uppercase tracking-widest">Meet the Team</span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mt-2">School Leadership</h2>
          </FadeIn>

          <div className="grid sm:grid-cols-2 gap-8">
            {leadership.map((p, i) => (
              <FadeIn key={p.name} delay={i * 0.1}>
                <div className="bg-white rounded-xl2 shadow-card overflow-hidden hover:shadow-[0_20px_60px_-15px_rgba(10,22,40,0.3)] hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="overflow-hidden aspect-[4/3]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-navy">{p.name}</h3>
                    <p className="text-gold-dark text-sm font-semibold uppercase tracking-wide mb-3">{p.role}</p>
                    <p className="text-navy/60 text-sm leading-relaxed">{p.bio}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}