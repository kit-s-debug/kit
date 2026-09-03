import { Approach } from "@/components/approach";
import { Arriving } from "@/components/arriving";
import { Booking } from "@/components/booking";
import { BookingBar } from "@/components/booking-bar";
import { Credentials } from "@/components/credentials";
import { Fees } from "@/components/fees";
import { FindingWords } from "@/components/finding-words";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Sessions } from "@/components/sessions";
import { StructuredData } from "@/components/structured-data";
import { Welcome } from "@/components/welcome";
import { SITE_URL } from "@/lib/site-url";

/**
 * The order of the rooms. No two consecutive sections share a layout, and the
 * fields alternate — dark, light, dark, light — so scrolling reads as moving
 * between rooms rather than down a document.
 */
export default function Home() {
  return (
    <>
      <Header overHero />
      <main id="main">
        <Hero />
        {/* The booking bar watches this, so it appears only once the hero has gone. */}
        <div id="hero-end" aria-hidden="true" />
        <Welcome />
        <FindingWords />
        <Sessions />
        <Approach />
        <Fees />
        <Credentials />
        <Arriving />
        <Booking />
      </main>
      <Footer />
      <BookingBar sentinelId="hero-end" />
      <StructuredData siteUrl={SITE_URL} />
    </>
  );
}
