# Ryder Designs brand assets

`ryder-designs-logo-original.png` is the logo as supplied. Everything the site
renders is vectorised from it.

The traced artwork lives in `../src/components/primitives/logoArt.ts` and is
drawn by `../src/components/primitives/Logo.tsx`. It is a single artwork in
`currentColor`, so the same component is correct on the bone sections and the
ink ones. The silver falloff of the original is a gradient between currentColor
at full strength and currentColor at 76%, which reads as white-to-silver on
dark and ink-to-graphite on light.

`../public/favicon.svg` is the RD monogram on ink. It uses solid fills rather
than currentColor, because a favicon has no page to inherit a colour from.

To re-trace after changing the logo: binarise the artwork, run it through
vtracer in binary/polygon mode, and regenerate `logoArt.ts` from the paths.
