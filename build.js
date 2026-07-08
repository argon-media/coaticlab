#!/usr/bin/env node
/* ============================================================
   CoaticLab site compiler
   Converts the Claude Design handoff `CoaticLab Site v2.dc.html`
   (a reactive prototype) into the self-contained static index.html.

   Usage:
     node build.js <path/to/CoaticLab Site v2.dc.html> <out index.html> [helmet.css]

   It also re-applies repo-only overrides that don't live in the design
   source (real Instagram images, button hover, copy/style tweaks) so a
   fresh export always rebuilds complete.
   ============================================================ */
const fs = require('fs');
const SRC = process.argv[2];
const OUT = process.argv[3];
let raw = fs.readFileSync(SRC, 'utf8');

const helmetMatch = raw.match(/<helmet>([\s\S]*?)<\/helmet>/);
const helmet = helmetMatch ? helmetMatch[1] : '';
const xdcMatch = raw.match(/<x-dc>([\s\S]*?)<\/x-dc>/);
let body = xdcMatch[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '');

const styleMatch = helmet.match(/<style>([\s\S]*?)<\/style>/);
if (process.argv[4]) fs.writeFileSync(process.argv[4], styleMatch ? styleMatch[1] : '');

/* ================= dc-import: GoogleReviews ================= */
const REVIEWS = [
  { name: 'Brian Dyer', initials: 'BD', meta: 'Local Guide · 12 reviews', date: 'a month ago', text: 'I can’t say enough good things about CoaticLab and especially Blake. From the very beginning, Blake was incredibly patient, knowledgeable, and genuinely invested in helping us find the perfect wrap color for our 1991 Mazda Miata. We went through countless options, comparisons, and ideas, and he never once made us feel rushed or like we were asking too many questions. His attention to detail and willingness to help made the entire process exciting instead of overwhelming.' },
  { name: 'Karson Nilsen', initials: 'KN', img: 'assets/review-karson.png', meta: '4 reviews · 9 photos', date: '4 months ago', text: 'Got the ceramic coating and tint done at Coaticlab and it looks absolutely amazing. My paint honestly looks better than when I bought the car brand new. My mom had her new car coated here first, and after seeing how good hers turned out, I knew I had to do the same when I got mine. Everything turned out perfect and the car looks incredible.' },
  { name: 'Jeffrey Gould', initials: 'JG', meta: '1 review', date: '3 months ago', text: 'First time with CoaticLab, Blake answered all my questions. I chose to do the full front PPF, Ceramic Coating level 2 and the Ceramic Window Tint. Blake and his staff did an Outstanding Job. I Highly Recommend them for your automotive needs.' },
  { name: 'Kara Jean Kelly', initials: 'KK', meta: 'Local Guide · 76 reviews', date: '2 months ago', text: 'I truly can’t say enough great things about my experience with CoaticLab. From the moment I requested a quote to the moment they pulled my vehicle out of the garage, it felt like a red carpet experience. I was genuinely impressed by every step of the process.' },
  { name: 'Braxton Schenk', initials: 'BS', meta: 'Local Guide · 15 reviews', date: '7 months ago', text: 'Blake (owner) and his guys are awesome. I took my truck in for some PPF and Ceramic coating and couldn’t be happier. I went back for some additional things like fogging the lights and other things, and their work is just top-notch. Highly recommend.' }
];
const GSTAR = '<svg width="17" height="17" viewBox="0 0 24 24" fill="#FBBC05"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z"></path></svg>';
const GLOGO_SM = '<svg viewBox="0 0 48 48" width="20" height="20" style="margin-left:auto;flex-shrink:0;"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"></path><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"></path><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"></path><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"></path></svg>';
const GLOGO_LG = GLOGO_SM.replace('width="20" height="20" style="margin-left:auto;flex-shrink:0;"', 'width="30" height="30" style="flex-shrink:0;"');
function reviewCard(r) {
  const avatar = r.img
    ? `<img src="${r.img}" alt="${r.name}" style="width:46px;height:46px;border-radius:50%;object-fit:cover;flex-shrink:0;background:#E7E4DC;">`
    : `<div style="width:46px;height:46px;border-radius:50%;background:#21314d;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Open Sans',sans-serif;font-weight:700;font-size:15px;flex-shrink:0;letter-spacing:0.02em;">${r.initials}</div>`;
  return `<div class="dc-review-card" style="flex:1;min-width:0;background:#fff;border-radius:16px;box-shadow:0 12px 32px rgba(14,30,60,0.08);padding:24px;display:flex;flex-direction:column;">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
      ${avatar}
      <div style="min-width:0;">
        <div style="font-family:'Open Sans',sans-serif;font-weight:700;font-size:15px;color:#15233F;">${r.name}</div>
        <div style="font-family:'Open Sans',sans-serif;font-size:12px;color:#8A93A3;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.meta}</div>
        <div style="font-family:'Open Sans',sans-serif;font-size:12.5px;color:#8A93A3;margin-top:1px;">${r.date}</div>
      </div>
      ${GLOGO_SM}
    </div>
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:12px;">${GSTAR}${GSTAR}${GSTAR}${GSTAR}${GSTAR}</div>
    <p style="font-family:'Open Sans',sans-serif;font-size:14.5px;line-height:1.6;color:#3A4252;margin:0 0 14px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${r.text}</p>
    <a href="{{WRITE}}" target="_blank" rel="noopener" style="margin-top:auto;font-family:'Open Sans',sans-serif;font-size:13.5px;color:#8A93A3;text-decoration:none;" data-hover="color:#21314d;">Read more</a>
  </div>`;
}
function googleReviewsHTML(attrs) {
  const rating = attrs.rating || '5.0';
  const count = attrs.count || '360+';
  const writeUrl = attrs['write-url'] || 'https://search.google.com/local/reviews?placeid=ChIJ5SUPzJ4BU4cRmS7cZqw0N40';
  const bigStar = '<svg width="20" height="20" viewBox="0 0 24 24" fill="#FBBC05"><path d="M12 2l2.9 6.3 6.9.7-5.1 4.7 1.4 6.8L12 17.8 5.9 20.5l1.4-6.8L2.2 9l6.9-.7z"></path></svg>';
  const cards = REVIEWS.map(reviewCard).join('\n').replace(/\{\{WRITE\}\}/g, writeUrl);
  return `<div class="dc-reviews" style="width:100%;font-family:'Open Sans',sans-serif;">
  <div style="background:#fff;border-radius:16px;box-shadow:0 14px 38px rgba(14,30,60,0.08);padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      ${GLOGO_LG}
      <span style="font-family:'Open Sans',sans-serif;font-weight:700;font-size:15px;color:#15233F;">Excellent</span>
      <span style="display:flex;gap:2px;">${bigStar}${bigStar}${bigStar}${bigStar}${bigStar}</span>
      <span style="font-family:'Open Sans',sans-serif;font-weight:700;font-size:15px;color:#15233F;">${rating}</span>
      <span style="width:1px;height:20px;background:#E1E5EC;"></span>
      <span style="font-family:'Open Sans',sans-serif;font-size:14.5px;color:#5A6273;">${count} reviews</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <button type="button" data-action="reviews-prev" aria-label="Previous reviews" style="flex-shrink:0;width:42px;height:42px;border-radius:50%;border:1px solid #E1E5EC;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;" data-hover="background:#F4F7F8;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#21314d" stroke-width="2.2"><path d="M15 5l-7 7 7 7"></path></svg></button>
      <button type="button" data-action="reviews-next" aria-label="Next reviews" style="flex-shrink:0;width:42px;height:42px;border-radius:50%;border:1px solid #E1E5EC;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;" data-hover="background:#F4F7F8;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#21314d" stroke-width="2.2"><path d="M9 5l7 7-7 7"></path></svg></button>
      <a href="${writeUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:8px;background:#21314d;color:#fff;font-family:'Open Sans',sans-serif;font-weight:700;font-size:14px;padding:12px 22px;border-radius:10px;text-decoration:none;box-shadow:0 10px 22px rgba(29,55,108,0.24);" data-hover="background:#15294F;">Write a review</a>
    </div>
  </div>
  <div style="margin-top:22px;">
    <div class="dc-reviews-track" style="flex:1;min-width:0;display:flex;gap:18px;">
${cards}
    </div>
  </div>
</div>`;
}
function parseAttrs(tag) {
  const attrs = {}; const re = /([a-zA-Z_:-]+)="([^"]*)"/g; let m;
  while ((m = re.exec(tag))) attrs[m[1]] = m[2].replace(/&amp;/g, '&');
  return attrs;
}
body = body.replace(/<dc-import\s+name="GoogleReviews"[^>]*><\/dc-import>/g, (t) => googleReviewsHTML(parseAttrs(t)));

/* ================= Trifecta interactive ================= */
const TRIF = [
  { num: '01', title: 'Paint Protection Film', img: 'assets/trifecta-ppf.jpg', alt: 'Paint protection film being applied to a black Corvette at CoaticLab', desc: 'A virtually invisible, self-healing film bonded to your paint. It is the first and most important line of defense against rock chips, scratches, and the road debris our Utah highways throw at you.' },
  { num: '02', title: 'Ceramic Coating', img: 'assets/trifecta-ceramic.jpg', alt: 'Ceramic-coated red Porsche 911 GTS outside the CoaticLab studio', desc: 'A hydrophobic nano-ceramic layer applied over the film and exposed paint. It locks in gloss, repels water and contaminants, and makes routine washing effortless.' },
  { num: '03', title: 'Ceramic Window Tint', img: 'assets/trifecta-tint.jpg', alt: 'Ceramic window tint on a black Corvette Z06 at CoaticLab', desc: 'Ceramic window tint that blocks heat and UV without cutting visibility, keeping your cabin cooler and your interior protected on every drive.' }
];
function trifButton(it, i) {
  return `<button type="button" class="trif-btn${i === 0 ? ' is-active' : ''}" data-trif="${i}" data-num="${it.num}" data-title="${it.title}" style="display:flex;gap:clamp(14px,1.6vw,20px);align-items:stretch;width:100%;background:transparent;border:none;cursor:pointer;text-align:left;padding:clamp(16px,2vw,22px) 0;${i === 0 ? '' : 'border-top:1px solid #E7EAEF;'}">
              <div style="position:relative;width:3px;border-radius:2px;background:#E1E5EC;flex-shrink:0;align-self:stretch;overflow:hidden;">
                <span class="trif-fill" style="position:absolute;left:0;top:0;width:100%;background:#21314d;border-radius:2px;"></span>
              </div>
              <div style="flex:1;text-align:left;">
                <div style="display:flex;align-items:baseline;gap:12px;">
                  <span class="trif-num" style="font-family:'Archivo',sans-serif;font-variation-settings:'wdth' 125,'wght' 800;font-size:clamp(24px,2.6vw,36px);line-height:0.8;flex-shrink:0;transition:color .3s ease;">${it.num}</span>
                  <h3 class="trif-title" style="font-family:'Archivo',sans-serif;font-variation-settings:'wdth' 118,'wght' 740;text-transform:uppercase;letter-spacing:0;font-size:clamp(17px,1.9vw,23px);margin:0;line-height:1.02;transition:color .3s ease;">${it.title}</h3>
                </div>
                <p class="trif-desc" style="font-family:'Open Sans',sans-serif;color:#3A4252;font-size:15px;line-height:1.65;margin:12px 0 0;max-width:46ch;">${it.desc}</p>
              </div>
            </button>`;
}
function trifVisual(it, i) {
  return `<div class="trif-visual${i === 0 ? ' is-active' : ''}"><img src="${it.img}" alt="${it.alt}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;"></div>`;
}

/* ================= global attribute transforms ================= */
body = body.replace(/href="#[^"]*"\s+onClick="\{\{ nav\.(\w+) \}\}"/g, 'href="#$1"');
body = body.replace(/onClick="\{\{ toggleMenu \}\}"/g, 'data-action="toggle-menu"');
body = body.replace(/onClick="\{\{ playPpf \}\}"/g, 'data-action="play-ppf"');
body = body.replace(/onSubmit="\{\{ onSubmit \}\}"/g, 'data-action="submit-quote"');
body = body.replace(/style-hover="/g, 'data-hover="');

/* trifecta scalar tokens */
body = body.replace(/style="\{\{ trifGridStyle \}\}"/g, 'class="trif-grid" style="display:grid;grid-template-columns:0.9fr 1.1fr;gap:clamp(24px,4vw,64px);align-items:stretch;margin-top:clamp(30px,4vw,52px);"');
body = body.replace(/<span style="([^"]*)">\{\{ trifActiveTitle \}\}<\/span>/, '<span class="trif-cap-title" style="$1">Paint Protection Film</span>');
body = body.replace(/<span style="([^"]*)">\{\{ trifActiveNum \}\} \/ 03<\/span>/, '<span class="trif-cap-num" style="$1">01 / 03</span>');

/* ================= sc-for expansion (innermost: last-open / next-close) ================= */
const NAV = [
  { label: 'Film', key: 'ppf' }, { label: 'Ceramic', key: 'ceramic' }, { label: 'Tint', key: 'tint' },
  { label: 'Correction', key: 'correction' }, { label: 'Tesla', key: 'tesla' }, { label: 'About', key: 'about' },
  { label: 'Gallery', key: 'gallery' }, { label: 'Contact', key: 'contact' }
];
const GALLERY = [
  { src: 'assets/ppf-corvette-hood.jpg', label: 'C8 Corvette / Full Front PPF', cats: ['PPF'] },
  { src: 'assets/ppf-corvette-side.jpg', label: 'C8 Corvette / Side PPF', cats: ['PPF'] },
  { src: 'assets/porsche-993-red.jpg', label: 'Porsche 993 / Ceramic Coating', cats: ['Ceramic', 'Detail'] },
  { src: 'assets/gr-corolla-fender.jpg', label: 'GR Corolla / Ceramic + Detail', cats: ['Ceramic', 'Detail'] },
  { src: 'assets/gr-corolla-rear.jpg', label: 'GR Corolla / Full Detail', cats: ['Detail'] },
  { src: 'assets/bmw-e30-pickup.jpg', label: 'BMW E30 / Ceramic Coating', cats: ['Ceramic', 'Detail'] },
  { src: 'assets/bmw-e30-wheel.jpg', label: 'BMW E30 / Wheel Detail', cats: ['Detail'] },
  { src: 'assets/rwb-event.jpg', label: 'RWB Porsche / CoaticLab Meet', cats: ['Detail'] }
];
const FILTERS = ['All', 'PPF', 'Ceramic', 'Tint', 'Tesla', 'Detail'];
function filterStyle(active) {
  return "font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.1em;font-size:11.5px;padding:10px 17px;border-radius:2px;cursor:pointer;border:1px solid " +
    (active ? '#21314d' : '#C7C5BC') + ';background:' + (active ? '#21314d' : 'transparent') + ';color:' + (active ? '#FFFFFF' : '#1B2436') + ';';
}
function boxStyle(src) {
  return 'aspect-ratio:4 / 5;border-radius:2px;overflow:hidden;background-color:#E7E4DC;background-image:url(' + src + ');background-size:cover;background-position:center;';
}
function expandScFor() {
  while (true) {
    const open = body.lastIndexOf('<sc-for');
    if (open === -1) break;
    const gt = body.indexOf('>', open);
    const close = body.indexOf('</sc-for>', gt);
    const openTag = body.slice(open, gt + 1);
    const inner = body.slice(gt + 1, close);
    const list = (openTag.match(/list="\{\{ (\w+) \}\}"/) || [])[1] || '';
    let out;
    if (list === 'navItems') {
      out = NAV.map(it => inner
        .replace(/href="#"\s+onClick="\{\{ item\.on \}\}"/, 'href="#' + it.key + '"')
        .replace(/\{\{ item\.label \}\}/g, it.label)).join('\n');
    } else if (list === 'filterBtns') {
      out = FILTERS.map(f => `<button type="button" class="dc-filter-btn" data-filter="${f}" style="${filterStyle(f === 'All')}">${f}</button>`).join('\n');
    } else if (list === 'filteredGallery') {
      out = GALLERY.map(g => `<figure class="dc-gallery-item" data-cats="${g.cats.join(',')}" style="margin:0;">
            <div style="${boxStyle(g.src)}"></div>
            <figcaption style="font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.06em;font-size:10.5px;color:#6E7585;margin-top:10px;">${g.label}</figcaption>
          </figure>`).join('\n');
    } else if (list === 'trifItems') {
      out = inner.indexOf('item.visualStyle') > -1 ? TRIF.map(trifVisual).join('\n') : TRIF.map(trifButton).join('\n');
    } else {
      out = inner;
    }
    body = body.slice(0, open) + out + body.slice(close + '</sc-for>'.length);
  }
}
expandScFor();

/* ================= sc-if expansion (innermost: last-open / next-close) ================= */
function wrapFor(expr, inner) {
  const pages = ['isHome', 'isPpf', 'isCeramic', 'isTint', 'isCorrection', 'isTesla', 'isAbout', 'isGallery', 'isContact'];
  if (pages.includes(expr)) {
    const key = expr.replace(/^is/, '').toLowerCase();
    return `<div class="dc-page" data-page="${key}"${key === 'home' ? '' : ' hidden'}>${inner}</div>`;
  }
  switch (expr) {
    case 'isDesktop': return `<div class="dc-only-desktop">${inner}</div>`;
    case 'isMobile': return `<div class="dc-only-mobile">${inner}</div>`;
    case 'introPlaying': return `<div id="dc-intro">${inner}</div>`;
    case 'menuOpen': return `<div id="dc-mobile-menu" hidden>${inner}</div>`;
    case 'ppfAudio': return `<div class="dc-ppf-audio" hidden>${inner}</div>`;
    case 'ppfIdle': return `<div class="dc-ppf-idle">${inner}</div>`;
    case 'submitted': return `<div class="dc-contact-success" hidden>${inner}</div>`;
    case 'formVisible': return `<div class="dc-contact-form">${inner}</div>`;
    case 'galleryEmpty': return `<div class="dc-gallery-empty" hidden>${inner}</div>`;
    default: return inner;
  }
}
function expandScIf() {
  while (true) {
    const open = body.lastIndexOf('<sc-if');
    if (open === -1) break;
    const gt = body.indexOf('>', open);
    const close = body.indexOf('</sc-if>', gt);
    const openTag = body.slice(open, gt + 1);
    const inner = body.slice(gt + 1, close);
    const expr = (openTag.match(/value="\{\{ (\w+) \}\}"/) || [])[1] || '';
    body = body.slice(0, open) + wrapFor(expr, inner) + body.slice(close + '</sc-if>'.length);
  }
}
expandScIf();

/* ---- headerScrollAttr ---- */
body = body.replace(/data-cl-scroll="\{\{ headerScrollAttr \}\}"/g, 'data-cl-scroll="home"');

/* ================= repo-only overrides (not in the design source) ================= */
/* "Want all three?" Trifecta strip background -> #e7e7e7 */
body = body.replace(/(margin-top:clamp\(36px,5vw,56px\);background:)#fff/, '$1#e7e7e7');

/* PPF "Process, Start to Finish" copy */
body = body.replace(
  'Watch a full paint protection film installation from start to finish. Every vehicle begins with a thorough wash and decontamination, followed by precise pattern cutting and careful hand application across each panel, with edges wrapped and tucked out of sight. A final inspection confirms a flawless, virtually invisible finish built to last.',
  'Watch a full-body paint protection film build from start to finish. Every vehicle starts with a wash and decontamination, then paint refinement, where orbital polishers remove the swirls, light scratches, and haze even new paint can carry. Trim and badges come off for a seamless fit, then each piece of film is precisely cut, hand-applied across every panel, and trimmed with the edges tucked out of sight. This beautiful Raptor received full-body paint protection film finished with a Gyeon ceramic coating for added gloss and easier cleaning. Our process is never rushed. It is done right.'
);

/* quote-form bottom badges: checkmark icons + copy per client screenshot
   ("Reply within 1 business day" / "Licensed & insured") */
{
  var badgeCheck = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#21314d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M5 12l5 5L20 6"></path></svg>';
  var badgeSpanOpen = '<span style="display:inline-flex;align-items:center;gap:7px;font-family:\'Open Sans\',sans-serif;font-size:13px;color:#3A4252;font-weight:600;">';
  var oldBadges = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-top:18px;">' +
    badgeSpanOpen + '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#21314d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><circle cx="12" cy="12" r="9"></circle><path d="M12 7.5V12l3 2"></path></svg>Reply within 1 business day</span>' +
    badgeSpanOpen + '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#21314d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="M12 3l7 3v5.5c0 4.2-3 6.9-7 8.5-4-1.6-7-4.3-7-8.5V6z"></path></svg>Licensed &amp; insured</span></div>';
  var newBadges = '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:20px;margin-top:18px;">' +
    badgeSpanOpen + badgeCheck + 'Quick Response</span>' +
    badgeSpanOpen + badgeCheck + 'Licensed &amp; insured</span></div>';
  body = body.split(oldBadges).join(newBadges);
}

/* keep the process video muted (no autoplay-with-sound on load) */
body = body.replace(/muted=0/g, 'muted=1');
body = body.replace(/aria-label="Play video with sound"/g, 'aria-label="Play video"');

/* "Built on craftsmanship": add team-photo placeholder + caption, and a
   "Family Owned & Operated" heading above the "At CoaticLab..." paragraphs */
body = body.replace(
  'and we go the extra mile on every build, at a fair price.</p>',
  'and we go the extra mile on every build, at a fair price.</p>' +
  '<div data-placeholder="team-photo" style="margin:0 0 14px;border-radius:2px;overflow:hidden;background:#EDEFF2;border:1px dashed #C7CDD8;aspect-ratio:16/10;display:flex;align-items:center;justify-content:center;"><span style="font-family:\'DM Mono\',monospace;text-transform:uppercase;letter-spacing:0.16em;font-size:11px;color:#9AA0AD;">Team photo — coming soon</span></div>' +
  '<p data-placeholder="team-caption" style="font-family:\'Open Sans\',sans-serif;color:#7A8296;font-style:italic;font-size:clamp(13px,1.25vw,14.5px);line-height:1.7;margin:0 0 26px;max-width:60ch;">[ A short line about the CoaticLab crew goes here — send us your team details and we will drop them in. ]</p>' +
  '<h3 style="font-family:\'Archivo\',sans-serif;font-variation-settings:\'wdth\' 125,\'wght\' 840;text-transform:uppercase;letter-spacing:-0.01em;line-height:0.95;margin:0 0 16px;color:#21314d;font-size:clamp(22px,2.6vw,34px);">Family Owned &amp; Operated</h3>'
);

/* "A track record" subtext */
body = body.replace(
  'Six years of film, coating and tint work across Northern Utah.',
  'Over six years of professional paint protection film, ceramic coating and window film.'
);

/* "From daily drivers..." heading: drop "new trucks"; remove the paragraph under it */
body = body.replace(
  'From daily drivers to new trucks to exotics all protected to the CoaticLab standard',
  'From daily drivers to exotics all protected to the CoaticLab standard'
);
body = body.split('<p style="font-family: \'Open Sans\',sans-serif; color: #3A4252; font-size: clamp(13px,1.3vw,15px); line-height: 1.65; margin: 0; max-width: 80ch">Daily drivers, trucks, EVs, and exotics, all protected to one standard. Raptors, Super Dutys, and Broncos to Tesla, Audi, Mercedes, BMW, and beyond.</p>').join('');

/* "Recent builds" subtext */
body = body.replace(
  'A look at recent paint protection, ceramic, and tint work, straight from the studio bay and back out on Utah roads.',
  'A look at recent paint protection film, ceramic coating, and ceramic window film installs, straight from the studio bay and back out on Utah roads'
);

/* Instagram: point the 6 tiles at the real post images we downloaded */
body = body.replace(/(href="https:\/\/www\.instagram\.com\/p\/([A-Za-z0-9_-]+)\/"[^>]*>\s*<img src=")assets\/[A-Za-z0-9._-]+(")/g,
  (m, pre, code, post) => pre + 'assets/instagram/' + code + '.jpg' + post);

/* tag CTA buttons/links with .cl-btn for a consistent hover lift */
body = body.replace(/<(a|button)\b([^>]*)>/g, function (m, tag, attrs) {
  if (/\bclass=/.test(attrs)) return m;
  var sm = attrs.match(/style="([^"]*)"/);
  if (!sm) return m;
  var s = sm[1];
  var looksButton = /font-weight:700/.test(s) && /text-transform:uppercase/.test(s) && /padding:/.test(s);
  var hasFill = /background:#/.test(s) || /background:rgba/.test(s) || /background:linear-gradient/.test(s) || /border:1\.5px/.test(s);
  if (looksButton && hasFill) return '<' + tag + attrs + ' class="cl-btn">';
  return m;
});

/* ---- strip hint-* attrs ---- */
body = body.replace(/\s+hint-[a-z-]+="[^"]*"/g, '');
body = body.replace(/\s+hint-[a-z-]+="\{\{[^}]*\}\}"/g, '');

const leftovers = body.match(/\{\{[^}]*\}\}|<sc-(if|for)|<\/sc-(if|for)>|<dc-import|<x-dc|<helmet/g);
if (leftovers) console.error('WARNING leftover tokens:', [...new Set(leftovers)].slice(0, 40));

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>PPF, Ceramic Coating &amp; Window Tint | CoaticLab, Clearfield UT</title>
<meta name="description" content="Gyeon-certified paint protection film, ceramic coatings, and window tint for new and high-value vehicles in Clearfield and across Northern Utah. Get a quote.">
<meta property="og:title" content="CoaticLab Automotive Studio | Clearfield, Utah">
<meta property="og:description" content="Gyeon-certified PPF, ceramic coatings, and window tint for new and high-value vehicles across Northern Utah.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0E1E3C">
<link rel="icon" href="assets/logo-navy.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62.5..125,100..900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Open+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css">
</head>
<body>
${body.trim()}
<script src="js/app.js" defer></script>
</body>
</html>
`;
fs.writeFileSync(OUT, html);
console.log('Wrote', OUT, '(' + html.length + ' bytes)');
