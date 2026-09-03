import Link from "next/link";
import { footer, practice, safety } from "@/content/site";
import { Crisis } from "./crisis";
import { Wordmark } from "./leaf";
import { Placeholder } from "./placeholder";
import { SocialLinks } from "./social-links";

export function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="shell">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            <Wordmark />
            <p className="site-footer-blurb">{footer.blurb}</p>
          </div>

          <div className="site-footer-cols">
            <div>
              <h2 className="label">{footer.contactHeading}</h2>
              <ul className="site-footer-list">
                <li>
                  <a href={practice.phoneHref} className="site-footer-phone link-plain">
                    {practice.phone}
                  </a>
                </li>
                <li>
                  {practice.town}, {practice.county}{" "}
                  <span lang="cy" className="welsh">
                    Sir Benfro
                  </span>
                </li>
                <li>
                  <Placeholder {...practice.fullPostcode} />
                </li>
              </ul>
            </div>

            <div>
              <h2 className="label">{footer.followHeading}</h2>
              <SocialLinks tone="dark" />
            </div>

            <div>
              <h2 className="label">{footer.legalHeading}</h2>
              <ul className="site-footer-list">
                {footer.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="link-plain">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Crisis className="site-footer-crisis" />

        <div className="site-footer-bottom">
          <p className="site-footer-note">{safety.exitFooter}</p>
          <p className="site-footer-meta">
            <span>{footer.copyright(new Date().getFullYear())}</span>
            <span>{footer.builtNote}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
