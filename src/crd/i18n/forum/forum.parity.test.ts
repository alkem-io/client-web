import { describe, expect, it } from 'vitest';
import bgJson from './forum.bg.json';
import deJson from './forum.de.json';
import enJson from './forum.en.json';
import esJson from './forum.es.json';
import frJson from './forum.fr.json';
import nlJson from './forum.nl.json';

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

describe('crd-forum i18n parity', () => {
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
});
