import { describe, expect, test } from 'vitest';
import bgJson from './space.bg.json';
import deJson from './space.de.json';
import enJson from './space.en.json';
import esJson from './space.es.json';
import frJson from './space.fr.json';
import nlJson from './space.nl.json';

/**
 * Expanded-card i18n keys — label, description, the three excerpt section
 * labels, and the footer call-to-action, in all six supported languages with full
 * key parity. Complements the generic `space.parity.test.ts` sweep with a
 * feature-scoped check plus the Dutch glossary assertion ("Subspace" stays
 * English).
 */

type Locale = {
  forms: { cardVariant: { label: string; description: string } };
  subspaces: { expandedCard: { what: string; why: string; who: string; open: string } };
};

const locales: Array<[string, Locale]> = [
  ['en', enJson as unknown as Locale],
  ['nl', nlJson as unknown as Locale],
  ['es', esJson as unknown as Locale],
  ['bg', bgJson as unknown as Locale],
  ['de', deJson as unknown as Locale],
  ['fr', frJson as unknown as Locale],
];

describe('expanded-card i18n keys', () => {
  test.each(locales)('%s declares all six keys as non-empty strings', (_lang, locale) => {
    expect(locale.forms.cardVariant.label.length).toBeGreaterThan(0);
    expect(locale.forms.cardVariant.description.length).toBeGreaterThan(0);
    expect(locale.subspaces.expandedCard.what.length).toBeGreaterThan(0);
    expect(locale.subspaces.expandedCard.why.length).toBeGreaterThan(0);
    expect(locale.subspaces.expandedCard.who.length).toBeGreaterThan(0);
    expect(locale.subspaces.expandedCard.open.length).toBeGreaterThan(0);
  });

  test('en description is the verbatim ask', () => {
    expect(enJson.forms.cardVariant.description).toBe(
      "Shows the full card with the subspace's What, Why and Who - more context, more height."
    );
  });

  test('en label is "Expanded card" (sentence case)', () => {
    expect(enJson.forms.cardVariant.label).toBe('Expanded card');
  });

  test('the nl description keeps "Subspace" in English (do-not-translate glossary)', () => {
    const description = nlJson.forms.cardVariant.description.toLowerCase();
    expect(description).toContain('subspace');
    expect(description).not.toContain('subruimte');
  });
});
