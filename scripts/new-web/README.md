# Static homepage — sources and English generator

The homepage served at `/` (Czech) and `/en` (English) is a standalone
HTML/CSS/JS site, not a React page. It lives in `public/` and is served by the
rewrites in `next.config.ts` (`/` → `public/index.html`, `/en` → `public/en.html`).

## Maintained sources

| File | Role |
|---|---|
| `public/index.html` | Czech homepage — the only HTML you edit by hand |
| `public/story.js` | interactive copy + behaviour shared by both languages |
| `public/style.css`, `experience.css`, `rhythm.css`, `fonts.css` | styles |
| `public/jelly-shape.js`, `jelly-logo.js`, `scroll-story.js` | Blob S WebGL/SVG logo and scroll story |
| `public/vendor/` | local GSAP + ScrollTrigger |
| `public/assets/`, `public/display.otf`, `logo.png`, `language-arrow.svg` | assets of the new site |
| `scripts/new-web/en-copy.json` | Czech → English dictionary |
| `scripts/new-web/og/render-og.mjs` | renders the Open Graph share images (see below) |

## Generated files (committed)

`public/en.html` and `public/en-story.js` are produced by:

```sh
pnpm build:en          # = python3 scripts/new-web/build-english.py
```

Run it after every change to `index.html`, `story.js` or `en-copy.json`, then
commit the regenerated outputs. The script fails if any Czech text has no
translation, if a `.html` link, the old preview domain or the retired contact
address (`jan@stefanko.tech`, replaced by `info@stefanko.tech`) slips into the
output, or if a relative asset path appears (all paths must be root-absolute so they
work on `/`, `/en` and `/en/` alike).

## Share metadata and Open Graph images

`index.html` carries the `<title>`, `meta description`, Open Graph and Twitter
card tags; the generator translates the texts through the dictionary and swaps
the per-language values (`og:url`, `og:locale` pair, `og:image` + `twitter:image`).
It also refuses to run if either share image is missing or is not a 1200×630 PNG.

The images `public/assets/og-cs-v1.png` and `public/assets/og-en-v1.png` are
committed and rendered by:

```sh
pnpm build:og          # = node scripts/new-web/og/render-og.mjs
```

The pink S is the site's own WebGL model (`jelly-logo.js`) in its finished
resting pose, screenshotted from headless Google Chrome (macOS path by default,
override with `CHROME=/path/to/chrome`); headline in Anton, wordmark in Geist,
both from `fonts.css`. When the artwork changes, bump `VERSION` in the script and
the file names in `index.html` + `build-english.py` — share caches key on the URL.

The old Next.js site is archived under `/old-web` and `/old-web/cs` with its
assets in `public/old-web/assets/`; it is `noindex` and not in the sitemap.
