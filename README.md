# CoaticLab Automotive Studio — Website

Marketing site for CoaticLab Automotive Studio (Gyeon-certified PPF, ceramic
coatings, window tint, and paint correction in Clearfield, UT).

## Architecture

A **multi-page site published straight from Claude Design** using the design's
own renderer (`support.js`, which mounts the pages with React). Each page is a
standalone `.dc.html` document; the runtime renders it client-side.

```
index.html            # Home
ppf.dc.html           # /ppf
ceramic.dc.html       # /ceramic
tint.dc.html          # /tint
correction.dc.html    # /correction
tesla.dc.html         # /tesla
about.dc.html         # /about
gallery.dc.html       # /gallery
reviews.dc.html       # /reviews
contact.dc.html       # /contact
GoogleReviews.dc.html, GoogleReviewsPPF.dc.html, VideoPlayer.dc.html  # components
support.js            # design runtime (loads React, renders <x-dc>, fetches components)
assets/               # images, logos, brand + certification marks, assets/instagram/
vercel.json           # clean-URL rewrites (/ppf -> /ppf.dc.html, etc.)
```

Clean URLs are provided by `vercel.json` rewrites; in-page navigation uses
`window.location.href` to `/ppf`, `/tesla`, etc.

## Updating from a new Claude Design export

Re-export the project, then for each page file: keep it verbatim **except**
rewrite the `goto()` `FILES` map to the clean paths (`/ppf`, `/ceramic`, …),
and on Home apply the two client overrides — force the process video to
`muted=1` and point the six Instagram tiles at `assets/instagram/<shortcode>.jpg`.
Copy `support.js`, the component `.dc.html` files, and `assets/`.
(The scratchpad `setup_mp.py` script automates this.)

## Notes

- Service clip loops (`data-bgloop`) and the PPF install film stream from
  `coatic-lab.argon-devsite.com` / Vimeo.
- The "On the Instagram" strip uses the six real @coaticlab post images saved
  under `assets/instagram/` — a snapshot, not a live feed.
- The team photo on the About/Home family section is still the studio image
  (`data-team-photo` marker) with a placeholder caption, pending the real photo.
