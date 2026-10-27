import Image from "next/image";
import portraitImage from "@/public/images/portrait.jpg";
import { about, chapters, welcome } from "@/content/site";
import { Chapter } from "./chapter";
import { Hills } from "./ground";
import { SocialLinks } from "./social-links";
import { Sprig, Wreath } from "./sprig";

/**
 * Lyndsay's introduction, in her own words, beside her portrait — the same
 * text the About page carries, from the same place in the content file, so
 * the two can never drift apart.
 *
 * The portrait is cut to an arch, the shape the rest of the page keeps using
 * behind its type, with a green arch of its own stepped out behind it and a
 * cutting laid across the corner. Her hello runs at display size with her
 * title set beneath it, so the block opens on something rather than starting
 * flat at reading size.
 */
export function Welcome() {
  return (
    <section id="welcome" className="welcome on-dark" aria-label="From Lyndsay">
      <Hills horizon="near" className="welcome-hills" />
      <Wreath size={420} leaves={15} className="greenery welcome-greenery" />
      <Sprig variant="nine" size={132} className="sprig-set welcome-sprig" />

      <div className="shell-editorial welcome-inner">
        <Chapter {...chapters.welcome} />

        <div className="welcome-spread">
          <figure className="welcome-portrait">
            <span className="welcome-portrait-plate" aria-hidden="true" />
            <span className="welcome-portrait-frame">
              <Image
                src={portraitImage}
                alt={welcome.portraitAlt}
                sizes="(max-width: 60rem) 60vw, 17rem"
                placeholder="blur"
                quality={82}
              />
            </span>
            <Sprig variant="three" size={58} className="welcome-portrait-sprig" />
          </figure>

          <div className="welcome-lead">
            <p className="welcome-greeting">{about.greeting}</p>
            <p className="welcome-role">{about.role}</p>

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
