import type { en } from './messages/en';

/**
 * The shape of one locale's copy, inferred from the English dictionary.
 *
 * English is the reference: adding, renaming or removing a key there is a
 * compile error in `cs.ts` until the Czech copy follows. Values stay widened to
 * `string` / `string[]`, so a locale is free to use a different number of
 * display-headline lines where its words need it.
 */
export type Messages = typeof en;
