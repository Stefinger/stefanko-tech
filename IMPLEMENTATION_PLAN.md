Stefanko.tech — Implementation Plan

Source of truth: Figma file uzpgsTDcrVr6HdblOxIE5d

Desktop frame: node 19:3 — 1440 x ~7997 px (7 sections)

Mobile frame: node 113:3 — 390 x ~7760 px (7 sections)

Navbar behavior reference: node 135:4 — sticky overlay prototype

Assets are retrieved via Figma MCP before each phase that requires them. No manual export workflow is required. If a node ID is stale, resolve the asset by its layer name inside the final frame.

This plan is the approved implementation baseline. Do not reopen visual direction or add unapproved interactions during implementation.

1. Page and Component Architecture

app/
layout.tsx — global fonts, metadata, styled-components registry
page.tsx — homepage (assembles all sections in order)

components/
layout/
Navbar.tsx — fixed overlay, multi-wave SVG bottom, hamburger
sections/
HeroSection.tsx — 01 / RAW IDEA
UncertaintySection.tsx — 02 / AN IDEA IS ONLY THE START
ClaritySection.tsx — 03 / CLARITY BEFORE COMPLEXITY
DecisionsSection.tsx — 04 / DECISIONS
BuildSection.tsx — 05 / DESIGNED TO BE USED
ProofSection.tsx — 06 / PROOF LIVES IN REALITY (id="proof")
FinalCtaSection.tsx — 07 / HAVE AN IDEA WORTH BUILDING?
Footer.tsx
ui/
BlobButton.tsx — organic SVG CTA (primary + secondary variants)
SectionLabel.tsx — "01 / RAW IDEA" tracking label
BlobSStatic.tsx — static SVG Blob S (Phase 2 and reduced-motion fallback)
canvas/
BlobSCanvas.tsx — React Three Fiber canvas, added in Phase 4 (dynamic import, ssr: false)
BlobSMesh.tsx — SVG-path-based Three.js geometry and animation

styles/
tokens.ts — all design tokens exported as styled-components theme
global.ts — CSS reset, font-face, body defaults
typography.ts — shared text component primitives

Routing

Only one route in scope: / (homepage). No /work route is created or linked during the homepage phase. CTAs that reference selected work scroll to the #proof anchor within the homepage. A /work route is out of scope until explicitly requested.

2. Responsive Strategy

Mobile is designed from scratch at 390 px — it is not a scaled-down desktop. Both viewports must be implemented and verified independently.

Property

Desktop

Mobile

Horizontal padding

64 px

24 px

Navbar height (incl. wave)

~104 px

~112 px

Hero headline (Anton)

138 px / line-height 144 px

66 px / line-height 70 px

Body text (Geist Regular)

22 px / line-height 34 px

18 px / line-height 28 px

Section label

Geist Medium 13 px / tracking 1.82 px

Geist Medium 11 px / tracking 1.54 px

Blob S hero

590 x 780 px, right column

218 x 289 px, centered

Decision journey

Horizontal S-curve wave SVG

Vertical winding path SVG

CTA buttons

Fixed-width organic shapes

Full-width 342 px organic shapes

Responsive ranges

Above 1100 px = full desktop

Up to 768 px = mobile

Implementation uses three responsive ranges:

Mobile: up to 768 px

Tablet and small desktop safeguard: 769–1100 px

Full desktop: above 1100 px

The tablet range does not introduce a new visual direction. It preserves the approved desktop composition while using fluid clamp() values, reduced object sizes, adjusted spacing, and layout safeguards that prevent overlap.

Use styled-components media helpers. No Tailwind.

Blob S cursor interaction is desktop only. On mobile the Blob S reacts to scroll progress only. No deviceorientation API and no orientation permission requests.

3. Design-Token Structure

// styles/tokens.ts

export const colors = {
darkGreen: "#082e26",
darkGreenAlt: "#103a32", // section 05 background
pink: "#ff6fae",
lime: "#88ff5c",
cream: "#f4f0ea",
creamBody: "#e9e2d8", // body text on dark sections
creamFaded: "#e8e0d5", // section 05 body text
muted: "#9eaaa5", // section labels, secondary text
white: "#ffffff",
} as const;

export const fonts = {
display: "'Anton', sans-serif", // all headlines
body: "'Geist', sans-serif", // body, nav, buttons, labels
} as const;

export const spacing = {
desktopPadding: "64px",
mobilePadding: "24px",
navHeight: "104px",
navHeightMobile: "112px",
} as const;

export const radius = {
card: "34px", // proof cards desktop
cardMobile: "30px",
} as const;

Font note on CTA labels. The desktop Figma frame (19:3) uses Inter:Medium for CTA button labels. The mobile frame (113:3) uses Geist:SemiBold for the same elements. Both are final-direction frames and they disagree. Because the project instruction says to use Geist for buttons unless the Figma explicitly confirms otherwise, and because loading Inter only for CTAs introduces a third font family for a single use case, CTA labels use Geist SemiBold. Inter is not loaded. If visual QA against the desktop frame reveals this is a meaningful difference, it can be revisited with one targeted change.

Fonts loaded via next/font/google:

Anton — Regular 400

Geist — weights 400, 500, 600

4. Asset Inventory

Assets are retrieved using Figma MCP at the start of the relevant phase. Node IDs come from the inspected final frames. If a node ID is stale, resolve the asset by its layer name inside frame 19:3 or 113:3.

SVG assets

Asset

Figma source

Usage

Phase

Navbar multi-wave bottom

135:152 "Desktop Multi-wave Navbar Bottom — Fixed"

Navbar organic bottom shape

2

Blob S — Nav mark

19:137 / 135:154

Navbar logo mark

2

Blob S — Footer mark

67:12 / 135:148

Footer logo mark

2

Hamburger cloud blob border

123:2 / 135:159 "Hamburger Cloud Blob Border"

Mobile hamburger border

2

"Start a project" blob shape

57:44

Desktop nav CTA shape

2

"Start a conversation" blob shape

59:2 / 59:5

Hero + final CTA primary

2

"Explore selected work" blob shape

69:2

Hero secondary CTA

2

"Explore selected work" blob dark

61:5

Proof section CTA

2

Mobile CTA blob shapes primary

118:4 / 118:5

Mobile primary CTAs

2

Mobile CTA blob shapes secondary

118:6 / 118:7 / 118:8

Mobile secondary CTAs

2

Question blobs desktop — 6 shapes

57:26, 57:28, 57:30, 57:32, 57:34, 57:36

Section 02 desktop

2

Question blobs mobile — 6 shapes

113:29, 113:32, 113:35, 113:38, 113:41, 113:44

Section 02 mobile

2

Blob S — Hero static

19:139 / 113:16

Hero static fallback

2

Blob S — Clarity static

19:143 / 113:53

Clarity static fallback

2

Blob S — Final static

26:10 / 113:129

Final CTA static fallback

2

Decision wave timeline desktop

46:3 "Refined hand-drawn wave timeline"

Section 04 background path

2

Mobile decision journey path

113:71 / 135:78

Section 04 mobile path

2

Timeline S-point markers

48:2, 48:6, 48:10, 48:14

Section 04 dot markers

2

Cloud step backgrounds 01-04

46:17-46:35 desktop / 113:75-113:93 mobile

Decision step cards

2

Footer rule

19:134 / 113:135

Footer separator

2

Interaction note blob border

63:6 / 113:64

Section 03 annotation box

2

WebGL — no asset required before Phase 4

Blob S must preserve the approved, recognizable Stefanko.tech S silhouette.

The first 3D prototype will retrieve the approved Blob S SVG from Figma and convert its path into Three.js geometry using SVGLoader and ExtrudeGeometry, with rounded bevelled depth and a matte material.

Only subtle organic deformation may be added after the S silhouette is preserved.

Do not use a noise-deformed SphereGeometry as the main shape.

The static SVG Blob S from Phase 2 remains the permanent reduced-motion and WebGL fallback.

A Blender-authored GLB is considered only if the SVG-based 3D prototype is not visually sufficient after review.

No text or normal UI inside the WebGL canvas.

5. HTML / SVG / GSAP / React Three Fiber per Element

This table reflects the final target state. During Phase 2 all animated and WebGL elements use their static equivalents.

Element

Technology

Phase introduced

Navbar shell

HTML header + styled-components

2

Navbar multi-wave shape

Inline SVG

2

Nav links, wordmark

HTML nav and anchor elements

2

Blob S nav + footer marks

Inline SVG

2

Hamburger + cloud border

Inline SVG

2

CTA buttons (organic blob)

Inline SVG path as button background

2

Section labels

HTML p

2

All headlines

HTML h1 / h2

2

Supporting body text

HTML p

2

Question blobs section 02

SVG images — static Phase 2, GSAP-animated Phase 3

2 / 3

Question word labels

HTML p

2

Decision wave timeline

Inline SVG — static Phase 2, stroke-dashoffset Phase 3

2 / 3

Decision cloud steps

HTML divs with SVG backgrounds

2

Assembly slabs section 05

HTML divs with background-color and border-radius

2

Proof cards section 06

HTML divs

2

Section backgrounds

styled-components section element

2

Scroll hint text

HTML p

2

Discipline labels section 03

HTML p — static Phase 2, GSAP Phase 3

2 / 3

Section entrance animations

GSAP ScrollTrigger

3

Question blob scatter and drift

GSAP

3

Decision wave draw stroke-dashoffset

GSAP ScrollTrigger scrub

3

Assembly slab reveal and spread

GSAP ScrollTrigger

3

Card stagger entrances

GSAP

3

Blob S — Hero

React Three Fiber

4

Blob S — Clarity

React Three Fiber

4

Blob S — Final CTA

React Three Fiber

4

Section 03 pin

GSAP ScrollTrigger pin

5

Blob S cross-section morph

R3F + ScrollTrigger context

5

Blob S cursor tilt desktop

R3F useFrame

5

Blob S scroll-reactive mobile

R3F useFrame + scroll progress

5

The single persistent R3F canvas (fixed/absolute, sections drive it via shared scroll context) is the target architecture for Phase 5. Phase 4 may mount per-section canvases while establishing the mesh and animation baseline — it does not need to solve the single-canvas architecture first.

6. Section-by-Section Motion Plan

Global GSAP setup

One GSAP context per section component, cleaned up on unmount. markers: false in production. A useReducedMotion hook reads window.matchMedia('(prefers-reduced-motion: reduce)') at init and is passed into each section.

All motion below is Phase 3 or later. Phase 2 is fully static.

Section 01 — Hero (dark green)

Trigger

Animation

Phase

Page load

Headlines stagger up from y:30, opacity 0 to 1

3

Page load

Supporting text and CTAs follow 150 ms later

3

Scroll out 0-20%

Blob S scale and begin morph

5

Cursor move desktop

Blob S tilts toward cursor, lerp 0.05

5

Scroll out

Blob S transitions toward section 03 state

5

Mobile scroll

Blob S responds to scroll progress only

5

No pin on hero. Scroll is immediate and natural.

Section 02 — Uncertainty (cream)

Trigger

Animation

Phase

Section enters

Headline slides in from left

3

Section enters

Supporting text opacity fade

3

Section enters

Six question blobs stagger in with rotation (desktop and mobile)

3

Continuous

Blobs drift plus or minus 5 px Y with individual phase offsets

3

Scroll out

Blobs scatter outward

3

Section 03 — Clarity (dark green) — pinned on desktop

Trigger

Animation

Phase

Section enters desktop

Pin begins

5

Pin 0-30%

Headline enters, supporting text fades in

3

Pin 30-70%

Blob S canvas visible, discipline labels orbit in one by one

5

Cursor move desktop

Blob S tilts toward cursor

5

Pin 70-100%

Statement headline enters

3

Pin end

Section unpins

5

Mobile

No pin — labels stagger on scroll, Blob S scroll-reactive

3 / 5

Section 04 — Decisions (cream)

Trigger

Animation

Phase

Section enters

Headline stagger in

3

Desktop

Wave stroke-dashoffset draws left to right on scroll

3

Cloud steps 01-04

Pop in as wave reaches each step

3

S-point markers

Pulse once on activation

3

Mobile

Vertical path draws top to bottom, steps cascade

3

Section 05 — Build (#103a32)

Trigger

Animation

Phase

Section enters

Headline enters line by line

3

Scroll

Three slabs spread from flat-stack to Figma angles

3

Per slab

Label PROBLEM / EXPERIENCE / PRODUCT appears

3

Section 06 — Proof (cream)

Trigger

Animation

Phase

Section enters

Headline and supporting text fade in

3

Section enters

Three proof cards stagger in from y:40

3

After cards

CTA appears

3

No hover scale, glow, or glassmorphism.

Section 07 — Final CTA (dark green)

Trigger

Animation

Phase

Section enters

Headline enters line by line

3

Section enters

Blob S morphs to final S form

5

Section enters

Supporting text fades in

3

Section enters

CTAs scale from 0.95, opacity 0 to 1

3

Section end

Footer fades in

3

7. Navbar Implementation Plan

Structure

header — position: fixed; top: 0; left: 0; width: 100%; z-index: 100
NavWave — inline SVG, multi-wave organic bottom, fill: #082e26
NavContent
BlobSLogo — Organic Blob S mark, 34 px desktop / 26 px mobile
Wordmark — stefanko.tech
NavLinks — Desktop only: Work, Build in Public, About, Contact
NavCta — Desktop only: "Start a project" organic blob button
Hamburger — Mobile only: 2-line icon inside cloud blob SVG border

Wave behavior (per figma-source.md and node 135:4)

The multi-wave SVG is always part of the navbar. It does not animate as a separate element and does not have a transition.

On the dark-green hero: wave fill #082e26 matches the hero background — the wave is invisible.

Over cream sections: the wave becomes visible as an organic dark-green overhanging edge.

Implementation: navbar background-color: #082e26, wave SVG fill: #082e26. The visual appearance of the wave changes because cream content scrolls underneath — no color change or resize happens in the navbar itself.

No divider line. No scroll-triggered navbar resize or background change.

Desktop navbar dimensions (from node 19:3)

Total height including wave: ~104 px

Logo Blob S: 34 px, position top: 34 px, left: 64 px

Wordmark: left: 98 px, top: 39 px, Geist SemiBold 17 px, color #f4f0ea

Nav links: top 44-45 px, Geist Medium 14 px, color #e9e2d8

"Start a project" CTA: right edge at 1376 px, top: 26 px, organic blob shape 166 x 56 px

Mobile navbar dimensions (from node 113:3 and 135:4)

Total height including wave: ~112 px

Logo Blob S: ~26 px mark, top: 24 px, left: 24 px

Wordmark: left: 60 px, top: 27 px, Geist SemiBold 14 px, color #f4f0ea

Hamburger container: 52 x 50 px, top: 12-18 px, right: ~18 px

Cloud blob border: inline SVG wrapping the hamburger

Hamburger lines: 2 lines of 20 x 2 px, color #f4f0ea, border-radius 1 px, at top 23 px and 29 px

Mobile menu open state

The Figma does not specify the open state. The hamburger renders as a visual control only. No menu layout is invented. The open state is deferred until a design is approved.

8. Reduced-Motion Strategy

useReducedMotion hook reads window.matchMedia('(prefers-reduced-motion: reduce)'). The Phase 2 static homepage satisfies reduced-motion requirements by definition — all Phase 3+ animations are simply skipped when reduced motion is active.

Element

Reduced-motion behavior

Section entrance animations

Omitted — content visible in natural document flow

Section 03 pin

Disabled — section scrolls normally

Blob S cursor and scroll reaction

Disabled

Blob S morph

Static SVG fallback, no transition

Question blob drift

Static Figma positions

Decision wave draw

Wave SVG fully visible on load

Assembly slab spread

Slabs in final spread positions immediately

Card stagger entrances

Cards visible immediately

Opacity-only transitions

Kept

R3F reduced-motion mode uses the static SVG fallback or Canvas frameloop="demand". Do not keep a continuous render loop active when animation is disabled.

9. Performance

Performance is a measurement-driven QA task, not a pre-implementation constraint. Sensible baseline decisions are built into the implementation. Nothing beyond those is added until profiling shows a specific problem.

Baseline decisions built into implementation

R3F canvas loaded with next/dynamic with ssr: false — not in the critical path.

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) caps retina overdraw.

Mobile Blob S uses reduced vertex count compared to desktop.

Static SVG Blob S renders while the R3F canvas loads and as a permanent fallback if WebGL is unavailable.

Fonts loaded via next/font with display: swap.

Question blob SVG assets kept under 5 KB each.

Deferred until profiling shows a need

Section lazy-loading

Device capability gating (hardwareConcurrency, deviceMemory)

Mandatory ScrollTrigger.batch usage

Manual FPS limiting

QA targets (Phase 6)

pnpm build clean, zero TS errors

pnpm lint clean

Lighthouse performance measured on real mobile hardware; threshold set after baseline is established

No layout shift on font load

No console errors in production build

10. Implementation Phases and Acceptance Criteria

Phase 1 — Foundation and design tokens

Scope: Project structure, design tokens, font loading, global CSS, Next.js App Router shell, styled-components registry.

Acceptance:

pnpm lint passes clean

pnpm exec tsc --noEmit passes with zero TypeScript errors

pnpm build passes cleanly

Anton and Geist load correctly in browser

colors, fonts, spacing, radius tokens importable from styles/tokens.ts

No Tailwind dependency present

Inter is not loaded

Phase 2 — Complete static responsive homepage

Scope: All 7 sections, navbar, and footer — fully styled and correct on both desktop (1440 px) and mobile (390 px). No GSAP. No React Three Fiber. No animation of any kind.

The entire static homepage must be complete and approved before Phase 3 begins.

Blob S renders as a static SVG asset in the hero, clarity, and final CTA sections. Question blobs appear at their Figma coordinates. Decision wave SVG is fully visible. Assembly slabs render in their spread state. Organic blob CTAs use SVG paths, not border-radius pills. The fixed navbar and its permanent multi-wave SVG bottom are fully implemented in this phase without JavaScript-driven reveal behavior. Proof cards render with placeholder content (development only — see section 11). Selected-work CTAs scroll to #proof on the homepage. No /work route.

Acceptance:

All 7 sections match Figma 19:3 at 1440 px in layout, colors, spacing, and typography

All 7 sections match Figma 113:3 at 390 px

Navbar is position: fixed, wave visible over cream sections, invisible over dark hero

No divider line in navbar

Hamburger renders with organic cloud blob border; no open-state content

All CTA buttons use organic SVG paths — no standard border-radius pills

Blob S renders as static SVG in correct positions and proportions

Visually checked at 360, 390, 768, 1024, 1280, and 1440 px

No horizontal overflow or overlapping content at intermediate widths

pnpm lint passes

pnpm exec tsc --noEmit passes

pnpm build passes

Tested visually in Chrome desktop and Chrome mobile

Phase 3 — Fixed navbar and DOM / SVG motion with GSAP

Scope: Install GSAP and ScrollTrigger. Implement all non-WebGL animations: section headline entrances, question blob scatter and drift, decision wave draw, assembly slab spread, and card stagger entrances. Add the useReducedMotion hook and all reduced-motion states.

The fixed navbar and its permanent multi-wave SVG bottom are already complete in Phase 2. The wave is always present. It visually disappears over the dark-green hero because the colors match and becomes visible when cream sections scroll underneath. Do not animate its color, height, visibility, or reveal with JavaScript or GSAP.

Acceptance:

Section headlines enter on scroll

Six question blobs on both desktop and mobile stagger in on section 02 enter

Decision wave draws via stroke-dashoffset on desktop; vertical path on mobile

Cloud steps 01-04 reveal sequentially as wave reaches them

Assembly slabs spread from flat-stack on scroll

All animations absent under prefers-reduced-motion: reduce

pnpm lint, pnpm exec tsc --noEmit, and pnpm build pass

Phase 4 — SVG-based 3D Blob S prototype

Scope: Install React Three Fiber and Three.js.

Retrieve the approved Blob S SVG from Figma and build the first 3D prototype from its real vector path using SVGLoader and ExtrudeGeometry, or another path-based Three.js geometry approach.

Add rounded bevelled depth, a matte material and only subtle organic deformation while preserving the recognizable S silhouette.

Load the canvas via next/dynamic with ssr: false.

Replace the static SVG Blob S in the hero section with the R3F prototype.

Add a subtle desktop cursor tilt reaction.

The static SVG remains the permanent fallback for reduced motion, unavailable WebGL and canvas loading.

Do not use a deformed sphere as the main Blob S geometry.

No Blender or GLB asset is required before this phase starts. If the SVG-based 3D prototype is not visually sufficient after review, consider a Blender-authored GLB before Phase 5.

Acceptance:

Hero Blob S renders as an animated 3D mesh on desktop and mobile

Cursor tilt visible on desktop (lerp smooth)

Static SVG fallback renders when WebGL is unavailable or reduced motion is active

R3F canvas does not overlay navbar, text, or CTA buttons

Page layout not broken on mobile by canvas mounting

pnpm lint, pnpm exec tsc --noEmit, and pnpm build pass

Visual quality approved before proceeding to Phase 5

Phase 5 — Complete scroll-driven motion system

Scope: Full scroll choreography across all sections. Section 03 pin on desktop. Single persistent R3F canvas driven by shared scroll context. Blob S morph transitions across sections 01, 03, and 07. Mobile scroll-reactive Blob S with no cursor or orientation dependency.

Acceptance:

Section 03 pins on desktop for the correct scroll distance; discipline labels enter in sequence

Blob S is visible and animated in sections 01, 03, and 07 with visual continuity

Mobile: Blob S scroll-reactive, no cursor and no orientation dependency

Scroll hint "SCROLL TO SHAPE THE IDEA" fades on first scroll

All reduced-motion states verified

No layout regression from Phase 2

pnpm lint, pnpm exec tsc --noEmit, and pnpm build pass

Phase 6 — Real proof assets, QA, performance and deployment

Scope: Replace all placeholder proof cards with real assets. Cross-device QA. Performance measurement and targeted fixes. Deployment readiness.

The public deployment must not contain placeholder text or visible replacement instructions in any section.

Acceptance:

Section 06 contains a real product screenshot, a real hardware/software asset, and a real build-in-public image — no placeholder text visible

Lighthouse audit run on real mobile hardware; critical regressions addressed

prefers-reduced-motion: reduce tested on desktop and mobile

No console errors in production build

Tested at 360, 390, 768, 1024, 1280, and 1440 px

Tested on: Chrome desktop, Safari desktop, Chrome Android, Safari iOS

pnpm lint, pnpm exec tsc --noEmit, and pnpm build all pass cleanly

11. Placeholder Inventory — Do Not Present as Real Proof

The following elements are explicitly marked as placeholders in the Figma. They are acceptable in development builds only. They must not appear in any public deployment.

Section 06 — Proof Lives In Reality

Card

Figma annotation

Status

Featured product card (dark green, large)

"A REAL DIGITAL PRODUCT" and "REPLACE WITH A REAL SCREENSHOT" in lime

Placeholder — real screenshot required before public launch

Hardware + Software card (pink)

"HARDWARE + SOFTWARE" and "REAL PROTOTYPE" with no image

Placeholder — real prototype photo or screenshot required

Build in Public card (#103a32)

"BUILD IN PUBLIC" and "REAL PROCESS IMAGE" in lime

Placeholder — real behind-the-scenes asset required

Implementation rule during Phase 2 through Phase 5: render these cards with their Figma placeholder text as-is. Add a PLACEHOLDER comment in the JSX source. Do not invent product names, metrics, screenshots, testimonials, or descriptions. Phase 6 is not complete until all three cards contain real assets.

12. Constraints Carried from CLAUDE.md

No Tailwind

No gradients, glow, glassmorphism, or generic SaaS cards

No fake product screenshots, invented customers, revenue, metrics, testimonials, or awards

Blob CTA buttons use organic SVG shapes — not standard border-radius pills

Desktop and mobile are equally important — mobile is not derived from desktop

No text or normal UI inside WebGL canvas

Respect prefers-reduced-motion

Inspect the relevant Figma nodes before implementing each section
