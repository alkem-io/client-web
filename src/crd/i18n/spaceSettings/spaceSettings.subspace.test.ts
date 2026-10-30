import i18next from 'i18next';
import { describe, expect, it } from 'vitest';
import bgJson from './spaceSettings.bg.json';
import deJson from './spaceSettings.de.json';
import enJson from './spaceSettings.en.json';
import esJson from './spaceSettings.es.json';
import frJson from './spaceSettings.fr.json';
import nlJson from './spaceSettings.nl.json';

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

const getValue = (obj: Json, path: string): string | undefined => {
  const value = path.split('.').reduce<Json | string | undefined>((node, key) => {
    return node && typeof node === 'object' ? node[key] : undefined;
  }, obj);
  return typeof value === 'string' ? value : undefined;
};

const SUFFIX = '_subspace';
const subspaceKeys = collectKeyPaths(enJson as Json).filter(path => path.endsWith(SUFFIX));

const locales: Array<[string, Json]> = [
  ['en', enJson as Json],
  ['nl', nlJson as Json],
  ['es', esJson as Json],
  ['bg', bgJson as Json],
  ['de', deJson as Json],
  ['fr', frJson as Json],
];

// Spec 045 FR-042 / SC-012: subspace (L1 / L2) copy is selected via i18next context.
describe('crd-spaceSettings subspace variants', () => {
  it('declares the FR-042 variants', () => {
    expect(subspaceKeys.length).toBeGreaterThan(0);
  });

  it.each(locales)('%s has every subspace variant next to its base key', (_lang, json) => {
    const problems = subspaceKeys.flatMap(path => {
      const base = path.slice(0, -SUFFIX.length);
      return [
        ...(getValue(json, path) ? [] : [`missing ${path}`]),
        ...(getValue(json, base) ? [] : [`missing base ${base}`]),
      ];
    });
    expect(problems).toEqual([]);
  });

  it.each(
    locales.filter(([lang]) => lang !== 'en')
  )('%s translates every subspace variant and its base copy (no English left behind)', (_lang, json) => {
    const untranslated = subspaceKeys
      .flatMap(path => [path, path.slice(0, -SUFFIX.length)])
      .filter(path => getValue(json, path) === getValue(enJson as Json, path));
    expect(untranslated).toEqual([]);
  });

  it('only mentions a "space" in English when it is the parent or top-level space', () => {
    const offenders = subspaceKeys.filter(path => {
      const value = getValue(enJson as Json, path) ?? '';
      return /\bspace\b/i.test(value.replace(/(parent|top-level) space/gi, ''));
    });
    expect(offenders).toEqual([]);
  });

  it('resolves the variant for the subspace context and falls back to the base key', async () => {
    const i18n = i18next.createInstance();
    await i18n.init({ lng: 'en', resources: { en: { 'crd-spaceSettings': enJson } } });
    // Untyped on purpose: the test probes keys (and contexts) the typed `t` would reject.
    const translate = i18n.t.bind(i18n) as unknown as (key: string, options: Record<string, unknown>) => string;
    const t = (key: string, options?: Record<string, unknown>) =>
      translate(key, { ns: 'crd-spaceSettings', ...options });

    expect(t('about.name.title')).toBe('Space Name');
    expect(t('about.name.title', { context: undefined })).toBe('Space Name');
    expect(t('about.name.title', { context: 'subspace' })).toBe('Subspace Name');
    expect(t('settings.membership.hostOrgTrust', { host: 'Acme', context: 'subspace' })).toBe(
      'Allow members of Acme to join this Subspace without an application.'
    );
    // A key without a `_subspace` variant keeps its base copy.
    expect(t('about.who.description', { context: 'subspace' })).toBe(t('about.who.description'));
  });
});
