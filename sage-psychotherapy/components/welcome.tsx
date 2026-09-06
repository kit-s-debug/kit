import Image from "next/image";
import portraitImage from "@/public/images/portrait.jpg";
import { chapters, welcome } from "@/content/site";
import { Chapter } from "./chapter";

/**
 * An editorial spread rather than a photo-beside-a-bio. The chapter opens on a
 * large italic pull-line — the one true thing she wants a nervous reader to
 * know — with her portrait floated into the margin and the practical detail
 * kept small beneath. Asymmetric on purpose.
 */
export function Welcome() {
  return (
    <section id="welcome" className="welcome on-dark" aria-label="From Lyndsay">
      <div className="shell-editorial welcome-inner">
        <Chapter {...chapters.welcome} />

        <div className="welcome-spread">
          <figure className="welcome-portrait">
            <Image
              src={portraitImage}
              alt={welcome.portraitAlt}
              sizes="(max-width: 60rem) 60vw, 22rem"
              placeholder="blur"
              quality={82}
            />
          </figure>

          <div className="welcome-lead">
            <p className="pull welcome-pull">
              {welcome.pull.before}
              <em>{welcome.pull.em}</em>
              {welcome.pull.after}
            </p>

            <p className="welcome-note">{welcome.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
