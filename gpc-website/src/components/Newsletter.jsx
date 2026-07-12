import FadeIn from "./FadeIn";

export default function Newsletter() {
  return (
    <section className="py-16 bg-navy-deep">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <FadeIn>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">
            Stay Connected
          </h2>
          <p className="text-white/50 mb-6">
            Subscribe to receive updates on school news, events, and announcements.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-5 py-3 rounded-full bg-white/5 border border-white/15 text-white placeholder:text-white/40 focus:outline-none focus:border-gold transition-colors"
            />
            <button className="px-6 py-3 rounded-full bg-gold text-navy font-semibold shadow-gold hover:bg-gold-light hover:scale-105 active:scale-95 transition-all duration-200">
              Subscribe
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}