import type { Messages } from '../types';

/**
 * Czech copy.
 *
 * Typed as `Messages`, so it cannot drift from the English structure.
 *
 * The copy is adapted, not translated word for word: headlines keep the short,
 * two-second-readable rhythm of the English originals rather than their literal
 * wording, and several line breaks differ on purpose because Czech words are
 * longer and the condensed display type has a fixed measure.
 *
 * Untranslated on purpose: `stefanko.tech`, `Build in Public`, `Blob S`, `AI`,
 * `UX`, `research`, `hardware`, `software`, `screenshot` — brand strings and
 * terms Czech product people use in English.
 */
export const cs: Messages = {
  meta: {
    description:
      'Od nápadu k produktu. Jan Štefko propojuje produktové myšlení, AI, design a technologie a mění nejasné nápady ve skutečné produkty.',
  },

  nav: {
    logoAlt: 'Stefanko.tech',
    items: {
      work: 'Projekty',
      buildInPublic: 'Build in Public',
      about: 'O mně',
      contact: 'Kontakt',
    },
    cta: 'Začít projekt',
    openMenu: 'Otevřít menu',
    closeMenu: 'Zavřít menu',
    dialogLabel: 'Navigace',
    mainNavLabel: 'Hlavní navigace',
    languageGroupLabel: 'Jazyk',
    switchAriaLabel: 'Switch to English',
  },

  hero: {
    label: '01  /  NÁPAD',
    headline: ['OD NÁPADU', 'K PRODUKTU.'],
    /* Three deliberate lines: the Czech sentence is longer than the English one
       and a two-line split leaves a one-word orphan inside the 520 px measure.
       The breaks collapse into one flowing paragraph below 992 px. */
    body: [
      'Propojuji produktové myšlení, AI, design',
      'a technologie a měním nejasné nápady',
      've skutečné produkty.',
    ],
    ctaPrimary: 'Pojďme si promluvit',
    ctaSecondary: 'Vybrané projekty\u00A0↗',
    scrollHint: 'SCROLLUJTE A TVARUJTE NÁPAD',
  },

  uncertainty: {
    label: '02  /  NEJASNOST',
    headline: ['NÁPAD JE JEN', 'ZAČÁTEK.'],
    body: ['Prvním úkolem není stavět, ale pochopit, co se vlastně má postavit.'],
    questions: ['KDO?', 'PROČ?', 'CO?', 'PRO KOHO?', 'PROČ TEĎ?', 'NA ČEM ZÁLEŽÍ?'],
    mobileTagline: 'OTÁZKY PŘED KÓDEM.',
  },

  clarity: {
    label: '03  /  JASNO PŘED SLOŽITOSTÍ',
    headline: ['JASNO', 'PŘED', 'SLOŽITOSTÍ.'],
    body: [
      'Najít skutečný problém. Odstranit to, na čem nezáleží.',
      'Pak propojit všechny disciplíny kolem jednoho jasného směru.',
    ],
    disciplines: [
      'PRODUKTOVÉ MYŠLENÍ',
      'RESEARCH',
      'AI',
      'UX',
      'DESIGN',
      'TECHNOLOGIE',
      'BYZNYS',
    ],
    statement: ['NEPÍŠU JEN KÓD.', 'PROPOJUJI ČÁSTI.'],
    note: {
      desktopLabel: 'INTERAKCE',
      mobileLabel: 'INTERAKCE NA MOBILU',
      desktopText: '3D Blob S se naklání a reaguje na pohyb kurzoru.',
      mobileText:
        'Blob S se otáčí podle scrollu ve své sekci. Bez hoveru a bez závislosti na natočení zařízení.',
    },
  },

  decisions: {
    label: '04  /  ROZHODNUTÍ',
    headline: ['PRODUKTY', 'VZNIKAJÍ', 'ROZHODNUTÍMI.'],
    body: 'Záleží na tom, co postavíte. Stejně tak na tom, co nepostavíte.',
    steps: [
      { label: 'ODSTRANIT TŘENÍ', subtext: 'Zjednodušit to, co má smysl.' },
      /* "Focus on value" — two words, so the cloud label stays on one line
         like the other three, as it does in English. */
      { label: 'DRŽET SE HODNOTY', subtext: 'Chránit důvod, proč produkt existuje.' },
      { label: 'STAVĚT MÉNĚ', subtext: 'Vydat nejmenší užitečnou verzi.' },
      { label: 'UČIT SE RYCHLE', subtext: 'Realita určí další rozhodnutí.' },
    ],
  },

  build: {
    label: '05  /  TVORBA',
    headline: ['NAVRŽENO', 'PRO LIDI.'],
    headlineAccent: ['POSTAVENO', 'DOOPRAVDY.'],
    body: 'Z nápadu se stává zkušenost, kterou lidé chápou, používají a testují.',
    slabs: ['PROBLÉM', 'ZKUŠENOST', 'PRODUKT'],
  },

  proof: {
    label: '06  /  SKUTEČNÝ DŮKAZ',
    headline: ['DŮKAZ ŽIJE', 'V REALITĚ.'],
    body: 'Skutečné produkty. Skutečný pokrok. Skutečná poučení.',
    featured: {
      workLabel: 'VYBRANÁ PRÁCE  /  01',
      /* Three lines on purpose: "DIGITÁLNÍ PRODUKT" on one line overflows the
         card at the mobile display size. */
      headline: ['SKUTEČNÝ', 'DIGITÁLNÍ', 'PRODUKT'],
    },
    hardware: {
      headline: ['HARDWARE', '+ SOFTWARE'],
    },
    buildPublic: {
      /* "Build in Public" is a brand phrase and stays in English. */
      headline: ['BUILD IN', 'PUBLIC'],
    },
    cta: 'Prohlédnout projekty',
  },

  finalCta: {
    label: '07  /  DALŠÍ NÁPAD',
    headline: ['STOJÍ VÁŠ NÁPAD', 'ZA POSTAVENÍ?'],
    body: [
      'Přineste nápad, problém nebo příležitost.',
      'Pojďme zjistit, jaký produkt má vzniknout.',
    ],
    ctaPrimary: 'Pojďme si promluvit',
    ctaSecondary: 'Vybrané projekty\u00A0↗',
  },

  footer: {
    logoAlt: 'Stefanko.tech',
    tagline: 'OD NÁPADU K PRODUKTU.\u00A0 /\u00A0 BUILD IN PUBLIC.',
  },
};
