# CoaticLab Automotive Studio — Website

Marketing site for CoaticLab Automotive Studio (Gyeon-certified PPF, ceramic
coatings, window tint, and paint correction in Clearfield, UT).

Built as a **self-contained static site** — plain HTML/CSS/JS, no build step and
no runtime framework. It deploys to any static host (Vercel, Netlify, S3, …).

## Structure

```
index.html      # single-page site (9 hash-routed views: home, ppf, ceramic,
                #   tint, correction, tesla, about, gallery, contact)
css/styles.css  # base styles, keyframes, responsive header, view switching
js/app.js       # hash router, hover styles, gallery filter, reviews carousel,
                #   video handling, quote form, intro wipe
assets/         # images, logos, certification + brand marks
```

Navigation is client-side via URL hash (`#ppf`, `#contact`, …); every route
serves `index.html`.

## Source

Recreated pixel-for-pixel from the Claude Design handoff
`CoaticLab Site v2.dc.html`. The design's reactive prototype was compiled to
static markup and its interaction logic ported to `js/app.js`.

## Local preview

```bash
python3 -m http.server 8080     # then open http://localhost:8080
```

## Notes

- Service clip loops (`data-bgloop`) and the PPF install film stream from
  `coatic-lab.argon-devsite.com` / Vimeo.
- The Trifecta section is an interactive showcase — three tabs (PPF, Ceramic,
  Tint) that auto-advance every 6s and switch on click (`js/app.js`).
- The "On the Instagram" strip shows the six real @coaticlab post images
  (saved under `assets/instagram/`), each linking to its post. It is a
  snapshot, not a live feed — send new post URLs to refresh it.
- A few slots are intentionally marked in the design as needing input
  (e.g. Utah legal tint percentages, SunTek coverage image).
