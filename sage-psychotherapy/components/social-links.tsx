import { practice } from "@/content/site";

const ICONS: Record<string, { path: string; rule?: "evenodd" }> = {
  Facebook: {
    path: "M16 8.05A8 8 0 1 0 6.75 16v-5.6H4.72V8.05h2.03V6.27c0-2.01 1.2-3.12 3.02-3.12.88 0 1.79.16 1.79.16v1.97h-1.01c-1 0-1.3.62-1.3 1.25v1.52h2.22l-.36 2.35H9.25V16A8 8 0 0 0 16 8.05Z",
  },
  Instagram: {
    // Rounded square, lens and flash, drawn as one even-odd path so the
    // camera body stays an outline rather than filling in solid.
    path: "M5.2 1h5.6A4.2 4.2 0 0 1 15 5.2v5.6a4.2 4.2 0 0 1-4.2 4.2H5.2A4.2 4.2 0 0 1 1 10.8V5.2A4.2 4.2 0 0 1 5.2 1Zm0 1.45A2.75 2.75 0 0 0 2.45 5.2v5.6a2.75 2.75 0 0 0 2.75 2.75h5.6a2.75 2.75 0 0 0 2.75-2.75V5.2a2.75 2.75 0 0 0-2.75-2.75H5.2ZM8 4.4a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0 1.45a2.15 2.15 0 1 0 0 4.3 2.15 2.15 0 0 0 0-4.3Zm3.85-1.94a.85.85 0 1 1 0 1.7.85.85 0 0 1 0-1.7Z",
    rule: "evenodd",
  },
};

/**
 * Both accounts, in the header and the footer.
 *
 * Until she supplies the real URLs these render as marked-up placeholders
 * rather than links. Pointing "Facebook" at facebook.com's front page is worse
 * than not linking at all: it looks live, and it takes a visitor who wanted to
 * see her page to a login wall instead. Set the href and the status in
 * content/site.ts and each one becomes a real link on its own.
 */
export function SocialLinks({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <ul className="socials" data-tone={tone}>
      {practice.socials.map((social) => {
        const icon = (
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path
              d={ICONS[social.label].path}
              fill="currentColor"
              fillRule={ICONS[social.label].rule}
              clipRule={ICONS[social.label].rule}
            />
          </svg>
        );

        if (social.status !== "confirmed") {
          return (
            <li key={social.label}>
              <span
                className="social-link"
                data-placeholder="true"
                title={`${social.label} — link not supplied yet`}
              >
                {icon}
                <span className="visually-hidden">
                  {social.label} — link not supplied yet
                </span>
                <span aria-hidden="true" className="social-dot" />
              </span>
            </li>
          );
        }

        return (
          <li key={social.label}>
            <a
              href={social.href}
              className="social-link"
              rel="me noopener noreferrer"
              target="_blank"
              title={social.label}
            >
              {icon}
              <span className="visually-hidden">{social.label} (opens in a new tab)</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
