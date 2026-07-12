import Counter from "./Counter";
import FadeIn from "./FadeIn";

const stats = [
  { value: 1240, suffix: "+", label: "Students" },
  { value: 87, suffix: "", label: "Staff" },
  { value: 98, suffix: "%", label: "WAEC Pass Rate" },
  { value: 22, suffix: "+", label: "Years" },
];

export default function StatsBar() {
  return (
    <section className="bg-navy-deep py-14">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <FadeIn key={s.label} delay={i * 0.1}>
            <Counter target={s.value} suffix={s.suffix} />
            <p className="text-white/60 text-sm uppercase tracking-widest mt-2">{s.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}