import Image from "next/image";
import portraitImage from "@/public/images/portrait.jpg";
import { welcome } from "@/content/site";

/**
 * Her portrait, a generous framed photo beside the description on a full ink
 * field — substantial, not a small circular avatar. Three lines, first person,
 * and nothing else. The temptation to add a fourth is the thing to resist.
 */
export function Welcome() {
  return (
    <section className="welcome on-dark" aria-label="From Lyndsay">
      <div className="welcome-portrait">
        <Image
          src={portraitImage}
          alt={welcome.portraitAlt}
          sizes="(max-width: 60rem) 20rem, 24rem"
          placeholder="blur"
          quality={80}
          className="welcome-photo"
        />
      </div>
      <div className="welcome-words">
        {welcome.lines.map((line, index) => (
          <p key={line} className="welcome-line" data-i={index}>
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}
