/**
 * English copy — the reference dictionary.
 *
 * Its inferred shape IS the `Messages` type, so `cs.ts` cannot compile with a
 * missing, misspelled or extra key. Arrays are used wherever the design has
 * deliberate line breaks: each locale decides its own breaks, which is what
 * keeps the condensed display headlines from re-wrapping badly in Czech.
 *
 * Brand strings (`stefanko.tech`, `Build in Public`, `Blob S`, `AI`, `UX`,
 * technology names) are intentionally identical in both locales.
 */
export const en = {
  /* The page title is NOT here: it is identical in both locales and lives in
     config.ts as SITE_TITLE. Only the description differs by language. */
  meta: {
    description:
      'From idea to product. Jan Štefko connects product thinking, AI, design and technology to turn raw ideas into real products.',
  },

  nav: {
    logoAlt: 'Stefanko.tech',
    items: {
      work: 'Work',
      buildInPublic: 'Build in Public',
      about: 'About',
      contact: 'Contact',
    },
    cta: 'Start a project',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    dialogLabel: 'Navigation',
    mainNavLabel: 'Main navigation',
    /* Shown on the switcher: the language the visitor can move TO. */
    switchLabel: 'CZ',
    /* Written in the TARGET language, so it reads to a speaker of that language. */
    switchAriaLabel: 'Přepnout do češtiny',
  },

  hero: {
    label: '01  /  RAW IDEA',
    headline: ['FROM IDEA', 'TO PRODUCT.'],
    body: [
      'I connect product thinking, AI, design and technology',
      'to turn raw ideas into real products.',
    ],
    ctaPrimary: 'Start a conversation',
    ctaSecondary: 'Explore selected work\u00A0↗',
    scrollHint: 'SCROLL TO SHAPE THE IDEA',
  },

  uncertainty: {
    label: '02  /  UNCERTAINTY',
    headline: ['AN IDEA IS ONLY', 'THE START.'],
    body: ['The first job is not to build. It is to understand what should be built.'],
    /* Six question clouds, in the order they are placed on the stage. */
    questions: ['WHO?', 'WHY?', 'WHAT?', 'FOR WHOM?', 'WHY NOW?', 'WHAT MATTERS?'],
    mobileTagline: 'QUESTIONS BEFORE CODE.',
  },

  clarity: {
    label: '03  /  CLARITY BEFORE COMPLEXITY',
    headline: ['CLARITY', 'BEFORE', 'COMPLEXITY.'],
    body: [
      'Find the real problem. Remove what does not matter.',
      'Then connect every discipline around one clear direction.',
    ],
    /* Seven labels on the ring, in connector order. */
    disciplines: [
      'PRODUCT THINKING',
      'RESEARCH',
      'AI',
      'UX',
      'DESIGN',
      'TECHNOLOGY',
      'BUSINESS',
    ],
    statement: ["I DON'T JUST WRITE CODE.", 'I CONNECT THE PIECES.'],
    note: {
      desktopLabel: 'INTERACTION',
      mobileLabel: 'MOBILE INTERACTION',
      desktopText: '3D Blob S tilts and reacts toward the cursor.',
      mobileText:
        'Blob S turns with scroll inside its own section. No hover or device orientation dependency.',
    },
  },

  decisions: {
    label: '04  /  DECISIONS',
    headline: ['PRODUCTS ARE', 'BUILT THROUGH', 'DECISIONS.'],
    body: 'What to build matters. What not to build matters just as much.',
    /* Four timeline steps, in order. */
    steps: [
      { label: 'REMOVE FRICTION', subtext: 'Make the useful path easier.' },
      { label: 'FOCUS ON VALUE', subtext: 'Protect the reason the product should exist.' },
      { label: 'BUILD LESS', subtext: 'Ship the smallest useful version.' },
      { label: 'LEARN FAST', subtext: 'Use reality to shape the next decision.' },
    ],
  },

  build: {
    label: '05  /  BUILD',
    headline: ['DESIGNED', 'TO BE USED.'],
    headlineAccent: ['BUILT', 'TO BE REAL.'],
    body: 'The idea becomes an experience people can understand, use and test.',
    /* Three stacked cards, back to front. */
    slabs: ['PROBLEM', 'EXPERIENCE', 'PRODUCT'],
  },

  proof: {
    label: '06  /  REAL PROOF',
    headline: ['PROOF LIVES', 'IN REALITY.'],
    body: 'Real products. Real progress. Real lessons.',
    /* Each card names a kind of evidence. No sub-labels: the cards carry no
       imagery yet, and a caption for an image that is not there would be a
       claim the site cannot back up. */
    featured: {
      workLabel: 'SELECTED WORK  /  01',
      headline: ['A REAL', 'DIGITAL PRODUCT'],
    },
    hardware: {
      headline: ['HARDWARE', '+ SOFTWARE'],
    },
    buildPublic: {
      headline: ['BUILD IN', 'PUBLIC'],
    },
    cta: 'Explore selected work',
  },

  finalCta: {
    label: '07  /  THE NEXT IDEA',
    headline: ['HAVE AN IDEA', 'WORTH BUILDING?'],
    body: [
      'Bring the idea, problem or opportunity.',
      "Let's find out what product should exist.",
    ],
    ctaPrimary: 'Start a conversation',
    ctaSecondary: 'Explore selected work\u00A0↗',
  },

  footer: {
    logoAlt: 'Stefanko.tech',
    tagline: 'FROM IDEA TO PRODUCT.\u00A0 /\u00A0 BUILD IN PUBLIC.',
  },
};
