import Image from "next/image";
import portraitImage from "@/public/images/portrait.jpg";
import { about, chapters, welcome } from "@/content/site";
import { Chapter } from "./chapter";
import { SocialLinks } from "./social-links";
import { Sprig } from "./sprig";

/**
 * Lyndsay's introduction, in her own words, beside her portrait — the same
 * text the About page carries, from the same place in the content file, so
 * the two can never drift apart.
 */
export function Welcome() {
  return (
    <section id="welcome" className="welcome on-dark" aria-label="From Lyndsay">
      <Sprig variant="nine" size={132} className="sprig-set welcome-sprig" />

      <div className="shell-editorial welcome-inner">
        <Chapter {...chapters.welcome} />

        <div className="welcome-spread">
          <figure className="welcome-portrait">
            <Image
              src={portraitImage}
              alt={welcome.portraitAlt}
              sizes="(max-width: 60rem) 60vw, 16rem"
              placeholder="blur"
              quality={82}
            />
          </figure>

          <div className="welcome-lead">
            <p className="welcome-lede">{about.lede}</p>

            <div className="welcome-note">
              <p>{about.body[0]}</p>

              {/* a div, not a paragraph: the social links are a list */}
              <div className="welcome-socials">
                <p>{about.socialsLine}</p>
                <SocialLinks tone="dark" />
              </div>

              {about.body.slice(1).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
