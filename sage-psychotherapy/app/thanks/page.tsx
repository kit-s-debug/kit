import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
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
        <Suspense>
          <ThanksBody />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
