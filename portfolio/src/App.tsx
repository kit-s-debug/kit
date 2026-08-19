import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { MapSection } from "./components/MapSection";
import { Nav } from "./components/Nav";
import { Reasons } from "./components/Reasons";
import { Services } from "./components/Services";
import { Statement } from "./components/Statement";
import { Work } from "./components/Work";

export default function App() {
  return (
    <div className="u-grain">
      <a
        href="#work"
        className="sr-only rounded-pill focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:bg-chalk focus:px-5 focus:py-3 focus:text-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Statement />
        <Work />
        <About />
        <Services />
        <Reasons />
        <MapSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
