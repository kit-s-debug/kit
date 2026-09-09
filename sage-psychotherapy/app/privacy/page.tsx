import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { privacy } from "@/content/site";

export const metadata: Metadata = {
  title: privacy.title,
  description: privacy.description,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="shell-editorial page-head">
          <h1 className="page-heading">{privacy.heading}</h1>
          <p className="page-updated label">{privacy.updated}</p>
          <p className="page-lede">{privacy.intro}</p>
        </div>

        <div className="shell-editorial prose">
          {privacy.sections.map((section) => (
            <section key={section.heading} className="prose-section">
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
          <Link href="/" className="action-quiet">
            Back to the main page
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
