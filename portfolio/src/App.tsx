import { About } from "./components/About";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Nav } from "./components/Nav";
import { Process } from "./components/Process";
import { Services } from "./components/Services";
import { Strip } from "./components/Strip";
import { Where } from "./components/Where";
import { Work } from "./components/Work";

/* The page alternates ground on purpose: ink, bone, tint, bone, ink, bone,
   ink, bone, ink. Nothing sits next to something that looks like it. */
export default function App() {
  return (
    <div className="u-grain">
      <a
        href="#work"
        className="s-dark sr-only rounded-pill focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[90] focus:bg-[var(--btn-bg)] focus:px-5 focus:py-3 focus:text-[var(--btn-fg)]"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Strip />
        <Work />
        <Services />
        <Process />
        <About />
        <Where />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
