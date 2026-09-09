import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import portraitImage from "@/public/images/portrait.jpg";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SocialLinks } from "@/components/social-links";
import { RegisterMarks } from "@/components/register-marks";
import { Sprig } from "@/components/sprig";
import { about, credentials, cta, welcome } from "@/content/site";

export const metadata: Metadata = {
  title: about.title,
  description: about.description,
  alternates: { canonical: "/about" },
};

/**
 * The one page written in Lyndsay's own hand. Her words run as a single piece
 * of prose with her portrait set into the side of it, so the picture sits in
 * the writing rather than in a column of its own with dead space beneath.
 */
export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="shell-editorial page-head">
          <h1 className="page-heading">{about.heading}</h1>
        </div>

        <div className="shell-editorial about-intro">
          <figure className="about-portrait">
            <Image
              src={portraitImage}
              alt={welcome.portraitAlt}
              sizes="(max-width: 34rem) 46vw, 12rem"
              placeholder="blur"
              quality={80}
            />
          </figure>

          <div className="about-words">
            <p className="about-lede">{about.lede}</p>
            <p>{about.body[0]}</p>

            {/* a div, not a paragraph: the social links are a list */}
            <div className="about-socials">
              <p>{about.socialsLine}</p>
              <SocialLinks />
            </div>

            {about.body.slice(1).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="shell-editorial about-register">
          <Sprig variant="pair" size={52} className="sprig-set about-sprig" />
          <h2 className="about-section-heading">{credentials.heading}</h2>
          <ul className="credentials-list">
            {credentials.rows.map((row) => (
              <li key={row.fact}>
                <span className="credentials-fact">{row.fact}</span>
                {row.note && <span className="credentials-note">{row.note}</span>}
              </li>
            ))}
          </ul>

          <RegisterMarks />

          <Link href="/#book" className="action">
            {cta.primary}
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
