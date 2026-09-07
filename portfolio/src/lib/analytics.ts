/* Cookie-free analytics, off unless a domain is configured.

   Set VITE_ANALYTICS_DOMAIN to the site's domain on your host and the Plausible
   script is injected at runtime; leave it unset and nothing is loaded and no
   third-party request is made. Kept out of index.html because Vite cannot
   conditionally include a script tag there, and a hardcoded one would fire on
   every local dev run and pollute the numbers.

   Plausible sets no cookies and stores nothing in the browser, which is what
   lets the privacy notice stay short and the site stay banner-free. */

const domain = import.meta.env.VITE_ANALYTICS_DOMAIN ?? "";
const host = import.meta.env.VITE_ANALYTICS_HOST ?? "https://plausible.io";

export const analyticsEnabled = Boolean(domain);

export function mountAnalytics() {
  if (!analyticsEnabled || document.querySelector("script[data-domain]")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.dataset.domain = domain;
  s.src = `${host}/js/script.js`;
  document.head.appendChild(s);
}
