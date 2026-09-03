import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Reasons } from "./components/Reasons";
import { Services } from "./components/Services";
import { Statement } from "./components/Statement";
import { Terrain, Veil } from "./components/Terrain";
import { Where } from "./components/Where";
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

      {/* One landscape behind the whole page, and the veil that keeps the
          words on top of it readable. */}
      <Terrain className="fixed inset-0 z-0 h-[100dvh] w-full" />
      <Veil className="fixed inset-0 z-[1] bg-ink" />

      <div className="relative z-[2]">
        <Nav />
        <main>
          <Hero />
          <Statement />
          <Work />
          <About />
          <Services />
          <Reasons />
          <Where />
          <Contact />
        </main>
        <Footer />
      </div>
    </div>
  );
}
