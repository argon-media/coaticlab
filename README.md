# CoaticLab Automotive Studio — Website

Marketing site for CoaticLab Automotive Studio (Gyeon-certified PPF, ceramic
coatings, window tint, paint correction and detailing in Clearfield, UT).

Live: https://coaticlab.vercel.app (also served at coaticlab-new.argon-devsite.com)

## Architecture

A **14-page site published straight from Claude Design** using the design's own
renderer (`support.js`, which loads React, renders the `<x-dc>` template and
fetches the component files). Each page is a standalone `.dc.html` document
rendered client-side.

| Page | File | URL |
|---|---|---|
| Home | `index.html` | `/` |
| Paint Protection Film | `ppf.dc.html` | `/ppf` |
| Ceramic Coatings | `ceramic.dc.html` | `/ceramic` |
| Window Tint | `tint.dc.html` | `/tint` |
| Commercial Tint | `commercial-tint.dc.html` | `/commercial-tint` |
| Paint Correction | `correction.dc.html` | `/correction` |
| Detailing | `detailing.dc.html` | `/detailing` |
| Trifecta Package | `trifecta.dc.html` | `/trifecta` |
| Tesla & EV | `tesla.dc.html` | `/tesla` |
| About | `about.dc.html` | `/about` |
| Projects | `projects.dc.html` | `/projects` |
| Gallery | `gallery.dc.html` | `/gallery` |
| Reviews | `reviews.dc.html` | `/reviews` |
| Contact | `contact.dc.html` | `/contact` |

Shared: `support.js` (design runtime), `VideoPlayer.dc.html`, and the reviews
widgets `GoogleReviews.dc.html` plus per-service forks (`GoogleReviewsPPF`,
`…Ceramic`, `…Tint`, `…Correction`, `…Detail`, `…Tesla`). Images live in
`assets/`; the real Instagram post images are in `assets/instagram/`.

Clean URLs come from `vercel.json` rewrites (`/ppf` → `/ppf.dc.html`, …). In-page
navigation uses `goto()`, whose `FILES` map is rewritten to those clean paths.

## Updating from a new Claude Design export

```bash
unzip "~/Downloads/CoaticLab Automotive Studio.zip" -d /tmp/coaticlab-export
python3 tools/sync.py /tmp/coaticlab-export
# verify locally: python3 -m http.server 8792  → http://localhost:8792
git add -A && git commit -m "Sync with new export" && git push
vercel deploy --prod --yes
```

`tools/sync.py` copies the pages/components/runtime/assets, rewrites the `goto()`
FILES map to clean URLs, regenerates `vercel.json`, and re-applies the repo-only
overrides below. It prints a counter per override — when a counter reads `0`, the
design has absorbed that change and the override can be retired from the script.

### Repo-only overrides (not yet in the design source)

1. **Header logo → `/`** — the design ships `href="#"`; we make it a real home link.
2. **Home process video muted** — the design ships `muted=0` on the PPF process video.
3. **Home Instagram tiles** → the six real @coaticlab images in `assets/instagram/`
   (the design uses placeholder photos).
4. **Home: "Learn About Us" button removed** from the Family Owned section.

Everything else (team photo, Read More/Less family toggle, Window Tint video,
About family video with controls/no autoplay) is now baked into the design itself.

## Notes

- Service clip loops (`data-bgloop`) and the PPF install film stream from
  `coatic-lab.argon-devsite.com` / Vimeo.
- The Instagram strip is a snapshot of six posts, not a live feed. To refresh it,
  save the new post images to `assets/instagram/<shortcode>.jpg` and update the
  post links in the design.
- Outstanding content: the italic caption under the Home team photo is still a
  placeholder awaiting copy, and the Reviews page featured video is a poster+play
  placeholder until a real video URL is supplied.
