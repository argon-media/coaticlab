#!/usr/bin/env python3
"""
Sync the CoaticLab site from a Claude Design export.

Usage:
    python3 tools/sync.py /path/to/unzipped-export-dir

The export is a multi-page Claude Design project: each page is a standalone
`.dc.html` rendered client-side by `support.js`. This script copies the pages,
components, runtime and assets into the repo, rewrites the in-page `goto()`
FILES map to clean URLs, regenerates vercel.json rewrites, and re-applies the
repo-only overrides that the design source does not (yet) contain.

Repo-only overrides applied here (keep in sync with README):
  1. Header logo -> real link to "/" (design ships href="#")
  2. Home: process video forced muted (design ships muted=0)
  3. Home: Instagram tiles -> the real @coaticlab images in assets/instagram/
  4. Home: remove the "Learn About Us" button from the family section

If a future export already contains one of these, its counter prints 0 and the
override can be retired from this script.
"""
import os, re, sys, json, glob, shutil

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EX = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else None
if not EX or not os.path.isdir(EX):
    sys.exit('usage: python3 tools/sync.py /path/to/unzipped-export-dir')

# page key -> (source file in export, output file in repo, clean URL)
PAGES = [
    ('home',        'Home.dc.html',             'index.html',              '/'),
    ('ppf',         'PPF.dc.html',              'ppf.dc.html',             '/ppf'),
    ('ceramic',     'Ceramic Coatings.dc.html', 'ceramic.dc.html',         '/ceramic'),
    ('tint',        'Window Tint.dc.html',      'tint.dc.html',            '/tint'),
    ('commercial',  'Commercial Tint.dc.html',  'commercial-tint.dc.html', '/commercial-tint'),
    ('correction',  'Paint Correction.dc.html', 'correction.dc.html',      '/correction'),
    ('detailing',   'Detailing.dc.html',        'detailing.dc.html',       '/detailing'),
    ('trifecta',    'Trifecta Package.dc.html', 'trifecta.dc.html',        '/trifecta'),
    ('tesla',       'Tesla.dc.html',            'tesla.dc.html',           '/tesla'),
    ('about',       'About.dc.html',            'about.dc.html',           '/about'),
    ('projects',    'Projects.dc.html',         'projects.dc.html',        '/projects'),
    ('gallery',     'Gallery.dc.html',          'gallery.dc.html',         '/gallery'),
    ('reviews',     'Reviews.dc.html',          'reviews.dc.html',         '/reviews'),
    ('contact',     'Contact.dc.html',          'contact.dc.html',         '/contact'),
]

CLEAN_MAP = 'var FILES = {' + ','.join(f"{k}:'{url}'" for k, _s, _d, url in PAGES) + '}'
FILES_RE = re.compile(r'var FILES = \{[^}]*\}')
IG_RE = re.compile(r'(href="https://www\.instagram\.com/p/([A-Za-z0-9_-]+)/"[^>]*>\s*<img src=")assets/[A-Za-z0-9._-]+(")')
LEARN_RE = re.compile(r'\s*<a href="#" onClick="\{\{ nav\.about \}\}"[^>]*>Learn About Us</a>')

print(f'export: {EX}\nrepo:   {REPO}\n')
for key, src, dest, _url in PAGES:
    p = os.path.join(EX, src)
    if not os.path.isfile(p):
        print(f'  !! missing in export: {src}  (skipped)')
        continue
    s = open(p, encoding='utf-8').read()

    if not FILES_RE.search(s):
        print(f'  !! no goto FILES map in {src}')
    s = FILES_RE.sub(CLEAN_MAP, s)

    n_logo = s.count('href="#" onClick="{{ nav.home }}"')
    s = s.replace('href="#" onClick="{{ nav.home }}"', 'href="/" onClick="{{ nav.home }}"')

    extra = ''
    if key == 'home':
        n_mute = s.count('muted=0')
        s = s.replace('muted=0', 'muted=1')
        s, n_ig = IG_RE.subn(lambda m: m.group(1) + 'assets/instagram/' + m.group(2) + '.jpg' + m.group(3), s)
        s, n_learn = LEARN_RE.subn('', s)
        extra = f'  muted={n_mute} ig={n_ig} learnAboutRemoved={n_learn}'

    open(os.path.join(REPO, dest), 'w', encoding='utf-8').write(s)
    print(f'  {dest:26} logoLinks={n_logo}{extra}')

# runtime + shared components (reviews widgets, video player)
comps = ['support.js', 'VideoPlayer.dc.html'] + sorted(
    os.path.basename(p) for p in glob.glob(os.path.join(EX, 'GoogleReviews*.dc.html')))
for c in comps:
    src_c = os.path.join(EX, c)
    if os.path.isfile(src_c):
        shutil.copy(src_c, os.path.join(REPO, c))
print('\ncomponents:', ', '.join(comps))

# assets (additive: never delete assets/instagram/ or other repo-only files)
adir = os.path.join(REPO, 'assets')
os.makedirs(adir, exist_ok=True)
n_assets = 0
for f in os.listdir(os.path.join(EX, 'assets')):
    sp = os.path.join(EX, 'assets', f)
    if os.path.isfile(sp):
        shutil.copy(sp, os.path.join(adir, f)); n_assets += 1
print(f'assets synced: {n_assets}')

rewrites = [{"source": url, "destination": '/' + dest}
            for _k, _s, dest, url in PAGES if url != '/']
open(os.path.join(REPO, 'vercel.json'), 'w').write(json.dumps({"rewrites": rewrites}, indent=2))
print(f'vercel.json: {len(rewrites)} clean-URL rewrites')
print('\nDone. Verify locally, then commit + `vercel deploy --prod`.')
