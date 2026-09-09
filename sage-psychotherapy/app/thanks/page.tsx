import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Sprig } from "@/components/sprig";
import { ThanksBody } from "./thanks-body";

export const metadata: Metadata = {
  title: "Thank you",
  description: "Your enquiry is with Lyndsay Gent at Sage Psychotherapy & Counselling.",
  robots: { index: false, follow: true },
};

/**
 * Where the form lands with JavaScript off. Prerendered: the ?state parameter
 * is read in the browser so this page stays static.
 */
export default function ThanksPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <Sprig variant="seven" size={300} flip className="greenery page-greenery" />
        <Suspense>
          <ThanksBody />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
