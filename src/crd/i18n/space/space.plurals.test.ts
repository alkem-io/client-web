import { createInstance } from 'i18next';
import { beforeAll, describe, expect, test } from 'vitest';
import bgJson from './space.bg.json';
import deJson from './space.de.json';
import enJson from './space.en.json';
import esJson from './space.es.json';
import frJson from './space.fr.json';
import nlJson from './space.nl.json';

// The attachment-limit refusal is a plural pair. Resolve it through a real
// i18next instance, the way the composer calls it, so a broken suffix or a
// missing {{count}} placeholder shows up per locale.
const locales = [
  ['en', enJson],
  ['nl', nlJson],
  ['es', esJson],
  ['bg', bgJson],
  ['de', deJson],
  ['fr', frJson],
] as const;

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: Object.fromEntries(locales.map(([lang, json]) => [lang, { 'crd-space': json }])),
    interpolation: { escapeValue: false },
  });
});

describe('comments.attachments.errorTooMany plural forms', () => {
  test.each(locales)('%s resolves the count into the many form and the one form on its own', (lang, json) => {
    const t = i18n.getFixedT(lang, 'crd-space');
    const many = t('comments.attachments.errorTooMany', { count: 10 });
    const one = t('comments.attachments.errorTooMany', { count: 1 });

    expect(many).toContain('10');
    expect(many).not.toContain('{{');
    expect(one).toBe(json.comments.attachments.errorTooMany_one);
    expect(one).not.toContain('{{');
    expect(one).not.toBe(many);
  });
});
