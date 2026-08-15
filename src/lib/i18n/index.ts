import { en } from './messages/en';
import { cs } from './messages/cs';
import type { Locale } from './config';
import type { Messages } from './types';

const dictionaries: Record<Locale, Messages> = { en, cs };

/** Copy for one locale. Called from Server Components, so only the active
 *  dictionary ends up in the payload sent to the browser. */
export function getMessages(locale: Locale): Messages {
  return dictionaries[locale];
}

export type { Messages };
export * from './config';
