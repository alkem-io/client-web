import { describe, expect, it } from 'vitest';
import bg from '../taskBoard.bg.json';
import de from '../taskBoard.de.json';
import en from '../taskBoard.en.json';
import es from '../taskBoard.es.json';
import fr from '../taskBoard.fr.json';
import nl from '../taskBoard.nl.json';

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

describe('crd-taskBoard i18n key parity', () => {
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
