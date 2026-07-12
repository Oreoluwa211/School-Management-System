import FadeIn from "./FadeIn";
import { ArrowRight } from "lucide-react";

const news = [
  {
    featured: true,
    category: "Academic",
    title: "GPC Students Sweep Top Honors in 2025 WAEC Results",
    excerpt: "Our graduating class recorded a record-breaking 98% pass rate, with 12 students achieving distinctions in 8+ subjects.",
    date: "May 28, 2025",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80",
  },
  {
    category: "Event",
    title: "Inter-House Sports Competition Kicks Off Next Week",
    excerpt: "Four houses battle for the championship trophy across track, field, and team events.",
    date: "May 20, 2025",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80",
  },
  {
    category: "Fees",
    title: "Third Term Fee Schedule Now Available",
    excerpt: "Parents and guardians can now view and pay third term fees through the student portal.",
    date: "May 15, 2025",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
  },
];

export default function NewsSection() {
  return (
    <section className="py-24 bg-[#faf8f3]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <FadeIn className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <span className="text-gold-dark font-semibold text-sm uppercase tracking-widest">
              Stay Informed
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mt-2">
              Latest News &amp; Updates
            </h2>
          </div>
          <a href="/news" className="group flex items-center gap-2 text-navy font-semibold hover:text-gold-dark transition-colors">
            View All News
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </FadeIn>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Featured */}
          <FadeIn className="lg:col-span-2">
            <a href="#" className="group block bg-white rounded-xl2 overflow-hidden shadow-card hover:shadow-[0_20px_60px_-15px_rgba(10,22,40,0.3)] hover:-translate-y-2 transition-all duration-300 h-full">
              <div className="overflow-hidden h-64">
                <img
                  src={news[0].image}
                  alt={news[0].title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <span className="inline-block px-3 py-1 rounded-full bg-gold/10 text-gold-dark text-xs font-semibold uppercase tracking-wide mb-3">
                  {news[0].category}
                </span>
                <h3 className="font-serif text-2xl font-bold text-navy mb-2 group-hover:text-gold-dark transition-colors">
                  {news[0].title}
                </h3>
                <p className="text-navy/55 text-sm mb-3 leading-relaxed">{news[0].excerpt}</p>
                <span className="text-xs text-navy/40">{news[0].date}</span>
              </div>
            </a>
          </FadeIn>

          {/* Regular */}
          <div className="flex flex-col gap-6">
            {news.slice(1).map((n, i) => (
              <FadeIn key={n.title} delay={i * 0.1}>
                <a href="#" className="group flex bg-white rounded-xl2 overflow-hidden shadow-card hover:shadow-[0_20px_60px_-15px_rgba(10,22,40,0.3)] hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="overflow-hidden w-28 shrink-0">
                    <img
                      src={n.image}
                      alt={n.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold/10 text-gold-dark text-[10px] font-semibold uppercase tracking-wide mb-2 w-fit">
                      {n.category}
                    </span>
                    <h3 className="font-serif text-base font-semibold text-navy mb-1 group-hover:text-gold-dark transition-colors leading-snug">
                      {n.title}
                    </h3>
                    <span className="text-xs text-navy/40 mt-auto">{n.date}</span>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}