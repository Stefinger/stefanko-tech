# Stefanko.tech Website

Read these files before making architectural or visual decisions:

- @docs/brand-bible.md
- @docs/website-strategy.md
- @docs/figma-source.md
- @docs/motion-spec.md

## Product goal

Stefanko.tech is a living demonstration of how an unclear idea becomes a real product.

The website must demonstrate a complete product experience, not only programming, GSAP or 3D skill.

## Technology

Use:

- Next.js App Router
- TypeScript
- styled-components
- GSAP
- GSAP ScrollTrigger
- React Three Fiber
- Three.js

Do not use Tailwind.

## Figma

The final Figma frames are the visual source of truth:

- Desktop: file uzpgsTDcrVr6HdblOxIE5d, node 19:3
- Mobile: file uzpgsTDcrVr6HdblOxIE5d, node 113:3
- Navbar behavior: node 135:4

Always use the Figma MCP server to inspect relevant frames before implementation.

Do not copy Figma-generated absolute-positioned code directly.

Translate the design into semantic React components and responsive CSS.

## Design rules

- Preserve approved colors and hierarchy.
- Do not add gradients, glow, glassmorphism or generic SaaS cards.
- Do not create fake product screenshots.
- Do not invent customers, revenue, metrics, testimonials or awards.
- Blob buttons must use organic SVG/vector shapes, not standard pill border-radius.
- Desktop and mobile are equally important.
- Do not derive mobile only by shrinking desktop.

## Motion rules

- Motion must communicate transformation.
- Use GSAP for DOM and SVG animation.
- Use React Three Fiber only for the signature Blob S.
- Do not put text or normal UI inside WebGL.
- Respect prefers-reduced-motion.
- Performance takes priority over excessive effects.

## Workflow

Work in phases.

Before each phase:

1. Inspect the relevant Figma nodes.
2. State the implementation plan.
3. Implement only the requested phase.
4. Run linting, TypeScript checks and production build.
5. Summarize changes and known differences from Figma.

Do not continue into the next phase without approval.
