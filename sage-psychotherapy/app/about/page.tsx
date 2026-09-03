import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import portraitImage from "@/public/images/portrait.jpg";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { about, credentials, cta, practice, welcome } from "@/content/site";

export const metadata: Metadata = {
  title: about.title,
  description: about.description,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="shell page-head">
          <h1 className="page-heading">{about.heading}</h1>
          <p className="page-lede">{practice.therapist}, {practice.formerName}. {practice.role}.</p>
        </div>

        <div className="shell about-grid">
          <div className="about-portrait">
            <Image
              src={portraitImage}
              alt={welcome.portraitAlt}
              sizes="(max-width: 800px) 100vw, 30vw"
              placeholder="blur"
              quality={80}
            />
          </div>

          <div className="about-body">
            {about.sections.map((section) => (
              <section key={section.heading} className="about-section">
                <h2 className="about-section-heading">{section.heading}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}

            <section className="about-section">
              <h2 className="about-section-heading">{credentials.heading}</h2>
              <ul className="credentials-list">
                {credentials.rows.map((row) => (
                  <li key={row.fact}>
                    <span className="credentials-fact">{row.fact}</span>
                    {row.note && <span className="credentials-note">{row.note}</span>}
                  </li>
                ))}
              </ul>
            </section>

            <Link href="/#book" className="action">
              {cta.primary}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
