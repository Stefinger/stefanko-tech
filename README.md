# stefanko.tech

Next.js 16 app (pnpm 11, Node 22) deployed on Railway.

- `/`, `/en` — static homepage from `public/index.html` / `public/en.html`
  (English is generated: `pnpm build:en`, see `scripts/new-web/README.md`).
- `/old-web`, `/old-web/cs` — the original Next.js site, archived, `noindex`.
- `/cs` → `/` (permanent redirect).

## Commands

```sh
pnpm install --frozen-lockfile
pnpm dev                 # http://localhost:3000
pnpm lint
pnpm exec tsc --noEmit
pnpm build && pnpm start # production server, PORT respected
pnpm build:en            # regenerate public/en.html + public/en-story.js
```

Local QA tooling (Puppeteer) is installed separately, see `qa/tooling/README.md`.
