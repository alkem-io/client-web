import { describe, expect, it } from 'vitest';
import bgJson from './error.bg.json';
import deJson from './error.de.json';
import enJson from './error.en.json';
import esJson from './error.es.json';
import frJson from './error.fr.json';
import nlJson from './error.nl.json';

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

describe('crd-error i18n parity', () => {
  it.each(cases)('%s has every key that en.json declares', (lang, langJson) => {
    const langKeys = new Set(collectKeyPaths(langJson));
    const missing: string[] = [];
    for (const k of enKeys) {
      if (!langKeys.has(k)) missing.push(k);
    }
    if (missing.length > 0) {
      throw new Error(`Missing keys in ${lang}: \n  - ${missing.join('\n  - ')}`);
    }
    expect(missing).toEqual([]);
  });

  it('declares the notFound.* keys in en.json', () => {
    expect(enKeys.has('notFound.title')).toBe(true);
    expect(enKeys.has('notFound.description')).toBe(true);
    expect(enKeys.has('notFound.actions.goHome')).toBe(true);
    expect(enKeys.has('notFound.actions.goBack')).toBe(true);
  });
});
