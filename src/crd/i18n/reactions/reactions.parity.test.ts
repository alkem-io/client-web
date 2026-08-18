import { describe, expect, it } from 'vitest';
import bgJson from './reactions.bg.json';
import deJson from './reactions.de.json';
import enJson from './reactions.en.json';
import esJson from './reactions.es.json';
import frJson from './reactions.fr.json';
import nlJson from './reactions.nl.json';

type Json = { [key: string]: Json | string };

const collectKeyPaths = (obj: Json, prefix = ''): string[] => {
  const paths: string[] = [];
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      paths.push(path);
    } else {
      paths.push(...collectKeyPaths(value, path));
    }
  }
  return paths;
};

const enKeys = new Set(collectKeyPaths(enJson as Json));

const cases: Array<[string, Json]> = [
  ['nl', nlJson as Json],
  ['es', esJson as Json],
  ['bg', bgJson as Json],
  ['de', deJson as Json],
  ['fr', frJson as Json],
];

describe('crd-reactions i18n parity', () => {
  it.each(cases)('%s has exactly the keys en.json declares (no missing, no orphans)', (_lang, langJson) => {
    const langKeys = new Set(collectKeyPaths(langJson));
    const missing: string[] = [];
    const extra: string[] = [];
    for (const k of enKeys) {
      if (!langKeys.has(k)) missing.push(k);
    }
    // Also flag keys that exist ONLY in this locale — a removed English key must
    // not linger as an orphaned translation.
    for (const k of langKeys) {
      if (!enKeys.has(k)) extra.push(k);
    }
    if (missing.length > 0 || extra.length > 0) {
      throw new Error(
        `Key mismatch in ${_lang}:` +
          `\nMissing:\n  - ${missing.join('\n  - ')}` +
          `\nUnexpected:\n  - ${extra.join('\n  - ')}`
      );
    }
    expect(missing).toEqual([]);
    expect(extra).toEqual([]);
  });
});
