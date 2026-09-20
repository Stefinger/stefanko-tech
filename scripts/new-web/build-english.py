"""Generate the English homepage from the Czech one without forking design or behaviour.

Sources (maintained by hand):
  public/index.html           Czech homepage, served at /
  public/story.js             interactive copy + behaviour, shared by both languages
  scripts/new-web/en-copy.json  Czech → English dictionary

Outputs (generated, committed so the deploy needs no Python):
  public/en.html              English homepage, served at /en
  public/en-story.js          story.js with its string literals translated

Run from anywhere:  python3 scripts/new-web/build-english.py   (or: pnpm build:en)
Run it after editing index.html, story.js or en-copy.json.
"""
import json
import re
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / 'public'
COPY = json.loads((Path(__file__).resolve().parent / 'en-copy.json').read_text(encoding='utf-8'))

SITE_URL = 'https://stefanko.tech'
PREVIEW_DOMAIN = 'chatgpt.site'
CONTACT_EMAIL = 'info@stefanko.tech'
OG_IMAGE_CS = f'{SITE_URL}/assets/og-cs-v1.png'   # rendered by scripts/new-web/og/render-og.mjs (pnpm build:og)
OG_IMAGE_EN = f'{SITE_URL}/assets/og-en-v1.png'
OLD_CONTACT_EMAIL = 'jan@stefanko.tech'

SWITCHER_CS = ('<a href="/" hreflang="cs" lang="cs" aria-current="page">Čeština <b aria-hidden="true">✓</b></a>'
               '<a href="/en" hreflang="en" lang="en">English</a>')
SWITCHER_EN = ('<a href="/" hreflang="cs" lang="cs">Čeština</a>'
               '<a href="/en" hreflang="en" lang="en" aria-current="page">English <b aria-hidden="true">✓</b></a>')
CANONICAL_CS = f'<link rel="canonical" href="{SITE_URL}/">'
CANONICAL_EN = f'<link rel="canonical" href="{SITE_URL}/en">'


def translate(value):
    stripped = value.strip()
    if stripped not in COPY:
        return value
    return value.replace(stripped, COPY[stripped], 1)


def replace_exactly(text, old, new, what, count=1):
    if text.count(old) != count:
        raise ValueError(f'{what}: expected exactly {count} occurrence(s) of {old!r}')
    return text.replace(old, new)


html = (PUBLIC / 'index.html').read_text(encoding='utf-8')
html = re.sub(r'(?<=>)([^<]+)(?=<)', lambda m: escape(translate(unescape(m[1])), quote=False), html)
html = re.sub(r'(aria-label|content|title|alt|placeholder)="([^"]*)"',
              lambda m: m[1] + '="' + escape(translate(unescape(m[2])), quote=True) + '"', html)
html = replace_exactly(html, '<html lang="cs">', '<html lang="en">', 'html lang')
html = replace_exactly(html, 'src="/story.js"', 'src="/en-story.js"', 'story script')
html = replace_exactly(html, '>CZ <span', '>EN <span', 'language summary')
html = replace_exactly(html, SWITCHER_CS, SWITCHER_EN, 'language switcher')
html = replace_exactly(html, CANONICAL_CS, CANONICAL_EN, 'canonical')
# Share metadata: og:image + twitter:image, og:url and the locale pair are per language.
html = replace_exactly(html, f'content="{OG_IMAGE_CS}"', f'content="{OG_IMAGE_EN}"', 'share image', count=2)
html = replace_exactly(html, f'<meta property="og:url" content="{SITE_URL}/">', f'<meta property="og:url" content="{SITE_URL}/en">', 'og:url')
html = replace_exactly(html, '<meta property="og:locale" content="cs_CZ">', '<meta property="og:locale" content="en_US">', 'og:locale')
html = replace_exactly(html, '<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="cs_CZ">', 'og:locale:alternate')
html = replace_exactly(html, 'subject=M%C3%A1m%20n%C3%A1pad', 'subject=I%20have%20an%20idea', 'mailto subject')
html = html.replace('<h2>THE IDEA<br><em>TAKING SHAPE.', '<h2>THE IDEA<br><em>TAKES SHAPE.')

# Translate complete JS string literals, never selectors or fragments of code.
js = (PUBLIC / 'story.js').read_text(encoding='utf-8')
js = re.sub(r"'((?:\\.|[^'\\])*)'",
            lambda m: json.dumps(COPY[m[1]], ensure_ascii=False) if m[1] in COPY else m[0], js)

# Fail visibly if a new Czech text has no translation.
czech = re.compile('[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]')


class Audit(HTMLParser):
    def handle_data(self, data):
        if czech.search(data) and data.strip() != 'Čeština':
            raise ValueError('Untranslated HTML: ' + data)

    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ['aria-label', 'content', 'alt', 'title', 'placeholder'] and czech.search(value or ''):
                raise ValueError('Untranslated attribute: ' + value)


Audit().feed(html)
if czech.search(js):
    raise ValueError('Untranslated JavaScript string')

# Production-route guards: no .html links, no preview domain, no retired contact address, no relative asset paths.
for name, text in (('en.html', html), ('en-story.js', js)):
    if PREVIEW_DOMAIN in text:
        raise ValueError(f'{name}: preview domain leaked into output')
    if OLD_CONTACT_EMAIL in text:
        raise ValueError(f'{name}: retired contact address {OLD_CONTACT_EMAIL} left in output')
if f'mailto:{CONTACT_EMAIL}' not in html:
    raise ValueError(f'en.html: contact address {CONTACT_EMAIL} missing')
for attr in re.findall(r'(?:href|src)="([^"]*)"', html):
    if attr.endswith('.html') or attr.startswith('index.html') or attr.startswith('en.html'):
        raise ValueError(f'en.html: .html link left in output: {attr}')
    if not re.match(r'^(/|#|https?:|mailto:)', attr):
        raise ValueError(f'en.html: relative path left in output: {attr}')
if CANONICAL_EN not in html:
    raise ValueError('en.html: canonical for /en missing')
if OG_IMAGE_CS in html or html.count(f'content="{OG_IMAGE_EN}"') != 2:
    raise ValueError('en.html: share image must be the English one in both og:image and twitter:image')
for url in (OG_IMAGE_CS, OG_IMAGE_EN):
    image = PUBLIC / url.removeprefix(SITE_URL + '/')
    header = image.read_bytes()[:24] if image.exists() else b''
    if header[:8] != b'\x89PNG\r\n\x1a\n' or (int.from_bytes(header[16:20], 'big'), int.from_bytes(header[20:24], 'big')) != (1200, 630):
        raise ValueError(f'{image.relative_to(ROOT)}: share image missing or not a 1200x630 PNG (run pnpm build:og)')

(PUBLIC / 'en.html').write_text(html, encoding='utf-8')
(PUBLIC / 'en-story.js').write_text(
    '// Generated by scripts/new-web/build-english.py from public/story.js. Edit scripts/new-web/en-copy.json for translations.\n' + js,
    encoding='utf-8')
print('English page and interactive copy generated; Czech residue, route and share-metadata checks passed.')
