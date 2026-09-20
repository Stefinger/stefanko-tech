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

The old Next.js site is archived under `/old-web` and `/old-web/cs` with its
assets in `public/old-web/assets/`; it is `noindex` and not in the sitemap.
