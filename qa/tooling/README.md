# QA tooling (local only)

Puppeteer and FFmpeg live here, **not** in the root `package.json`.

Railway's Railpack inspects the root dependency graph. When it found
`puppeteer` there it automatically added Chromium/FFmpeg Linux system packages
to the build image, and that apt step failed — breaking production deploys for
tooling the website never uses at runtime.

## Install

```sh
cd qa/tooling && pnpm install
```

That is the only command needed. Packages are installed into `qa/node_modules`
(see `.npmrc` → `modules-dir=../node_modules`) so every existing script in
`qa/` and `qa/real-gpu/` resolves a bare `puppeteer` import through Node's
normal upward lookup, with no per-script path juggling.

## Run a script

From the repository root, as before:

```sh
node qa/real-gpu/00-gpu.mjs
node qa/polish-shots.mjs /tmp/out
```

## Notes

- This package is **not** a pnpm workspace member. The root
  `pnpm-workspace.yaml` has no `packages:` key, and this directory carries its
  own `pnpm-workspace.yaml` so pnpm treats it as a separate root.
- It has its own `pnpm-lock.yaml`, independent of the root lockfile.
- Build-script approvals for the browser download and the ffmpeg binary live in
  this directory's `pnpm-workspace.yaml`, not the root one.
