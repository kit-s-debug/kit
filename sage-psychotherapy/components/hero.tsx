import Image from "next/image";
import roomImage from "@/public/images/room.jpg";
import { cta, hero, practice } from "@/content/site";

/**
 * One room, one sentence, one thing to do.
 *
 * There is no scroll act here any more: the hero is a still photograph with the
 * copy set into the lower third, and its foot dissolves into exactly the colour
 * the next section begins with — so scrolling on carries you into the room
 * rather than over an edge. Nothing is hidden and nothing waits for JavaScript;
 * the only motion is the lamp coming up once, on load.
 */
export function Hero() {
  return (
    <section
      id="top"
      className="hero-stage"
      aria-label="Sage Psychotherapy and Counselling"
    >
      <div className="hero-viewport">
        <div className="hero-image">
          <Image
            src={roomImage}
            alt={hero.imageAlt}
            fill
            priority
            fetchPriority="high"
            /* The source photograph is 1200px wide. `100vw` asked the
               optimiser for 1920 on a desktop, which returned an upscale:
               more bytes for a softer picture. Capping the request at the
               width the file actually has keeps it sharp and smaller. */
            sizes="(max-width: 1200px) 100vw, 1200px"
            placeholder="blur"
            quality={80}
            className="hero-photo"
          />
          <div className="hero-vignette" aria-hidden="true" />
          {/* A floor for the copy column on wide screens. See globals.css —
              the headline measured 1.13:1 over the window without it. */}
          <div className="hero-scrim" aria-hidden="true" />
          <div className="hero-warm" aria-hidden="true" />
          {/* the foot of the photograph resolves to the next section's field */}
          <div className="hero-dissolve" aria-hidden="true" />
        </div>

        <div className="shell-editorial hero-content">
          <div className="hero-opening">
            <p className="kicker hero-kicker">{hero.kicker}</p>
            <h1 className="hero-headline">
              <span lang="cy" className="hero-croeso">
                {hero.welcomeWelsh}.
              </span>{" "}
              {hero.headline}
            </h1>
            <hr className="sill hero-sill" />
            <p className="hero-credit">{hero.credit}</p>
            <a href="#book" className="action hero-action">
              {cta.primary}
            </a>
            <p className="hero-phone">
              {cta.phoneLabel}{" "}
              <a href={practice.phoneHref} className="link-plain">
                {practice.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
