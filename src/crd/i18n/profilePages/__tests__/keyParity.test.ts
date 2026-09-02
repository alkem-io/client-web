import { describe, expect, it } from 'vitest';
import bg from '../profilePages.bg.json';
import de from '../profilePages.de.json';
import en from '../profilePages.en.json';
import es from '../profilePages.es.json';
import fr from '../profilePages.fr.json';
import nl from '../profilePages.nl.json';

type AnyObject = Record<string, unknown>;

const collectKeys = (obj: AnyObject, prefix = ''): string[] => {
  const out: string[] = [];
  for (const key of Object.keys(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out.push(...collectKeys(value as AnyObject, fullKey));
    } else {
      out.push(fullKey);
    }
  }
  return out.sort();
};

const referenceKeys = collectKeys(en as AnyObject);

describe('crd-profilePages i18n key parity', () => {
  it.each([
    ['nl', nl as AnyObject],
    ['es', es as AnyObject],
    ['bg', bg as AnyObject],
    ['de', de as AnyObject],
    ['fr', fr as AnyObject],
  ])('%s has the same key shape as en', (_lang, langObj) => {
    expect(collectKeys(langObj)).toEqual(referenceKeys);
  });
});
