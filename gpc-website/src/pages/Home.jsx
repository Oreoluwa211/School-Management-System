import Hero from "../components/Hero";
import StatsBar from "../components/StatsBar";
import AboutPreview from "../components/AboutPreview";
import NewsSection from "../components/NewsSection";
import Extracurricular from "../components/Extracurricular";
import AnthemPledge from "../components/AnthemPledge";
import Newsletter from "../components/Newsletter";
import CTABanner from "../components/CTABanner";

export default function Home() {
  return (
    <>
      <Hero />
      <StatsBar />
      <AboutPreview />
      <div id="news"><NewsSection /></div>
      <div id="activities"><Extracurricular /></div>
      <div id="anthem"><AnthemPledge /></div>
      <Newsletter />
      <CTABanner />
      <div id="contact">
        {/* Contact section placeholder */}
      </div>
    </>
  );
}