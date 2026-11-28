import { Hero } from "@/components/hero/Hero";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileBar } from "@/components/layout/MobileBar";
import { RouteSpine } from "@/components/layout/RouteSpine";
import { Booking } from "@/components/sections/Booking";
import { JourneyMap } from "@/components/sections/JourneyMap";
import { Local } from "@/components/sections/Local";
import { Services } from "@/components/sections/Services";
import { BookingProvider } from "@/lib/booking";

export default function Home() {
  return (
    <BookingProvider>
      <a
        href="#main"
        className="sr-only z-[60] rounded-full bg-gold px-5 py-3 font-semibold text-midnight focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <RouteSpine />
      <main id="main">
        <Hero />
        <Services />
        <JourneyMap />
        <Booking />
        <Local />
      </main>
      <Footer />
      <MobileBar />
      <DemoBanner />
    </BookingProvider>
  );
}
