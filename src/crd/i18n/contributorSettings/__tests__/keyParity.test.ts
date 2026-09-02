import { describe, expect, it } from 'vitest';
import bg from '../contributorSettings.bg.json';
import de from '../contributorSettings.de.json';
import en from '../contributorSettings.en.json';
import es from '../contributorSettings.es.json';
import fr from '../contributorSettings.fr.json';
import nl from '../contributorSettings.nl.json';

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

describe('crd-contributorSettings i18n key parity', () => {
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
