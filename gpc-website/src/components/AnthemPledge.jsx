import FadeIn from "./FadeIn";

export default function AnthemPledge() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#fbf6e9] to-[#f7eed8]">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <FadeIn className="text-center mb-12">
          <span className="text-gold-dark font-semibold text-sm uppercase tracking-widest">
            Our Identity
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-navy mt-2">
            Anthem &amp; Pledge
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-2 gap-8">
          <FadeIn>
            <div className="bg-white rounded-xl2 shadow-card border-t-4 border-gold p-8 h-full hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-serif text-xl font-bold text-navy mb-4">School Anthem</h3>
              <p className="font-serif italic text-navy/60 leading-loose">
                Goodnews on the move, always on the move,<br/>
                for excellence teaching service, Goodnews on the move, <br/>
                moral education with God intervetion,<br/>
                for excellence teaching service Goodnews on the move,<br/>
                we are always punctual no way for nonsence,<br/>
                perciverence and disciple,<br/>
                are always our watch word,<br/>
                Goodnews on the move, always on the move,<br/>
                for teachers always ready to teach us anytime,<br/>
                Goodnews on the move, <br/>
                Goodnews on the move, always on the move,<br/>
                for excellence teaching service, Goodnews on the move.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="bg-white rounded-xl2 shadow-card border-t-4 border-gold p-8 h-full hover:-translate-y-1 transition-transform duration-300">
              <h3 className="font-serif text-xl font-bold text-navy mb-4">School Pledge</h3>
              <p className="font-serif italic text-navy/60 leading-loose">
                I pledge to be a good ambassador of this school,<br />
                both in and outside of the school,<br />
                I refuse to tarnish the name of my school and my family may,<br />
                may God help me Amen.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}