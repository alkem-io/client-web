import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, test } from 'vitest';

// Repo root, four levels up from `src/main/crdPages/__tests__/`.
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');

type ShellPair = {
  mui: string;
  crd: string;
  /**
   * Providers that the MUI shell mounts but the CRD shell legitimately does not.
   * Use sparingly — every entry here is a known parity gap that must be tracked
   * in `docs/crd-migration-parity.md`.
   */
  allowMissingInCrd?: string[];
};

// Source of truth: docs/crd-migration-parity.md. When you migrate a new shell,
// add a row there AND add a pair here.
const SHELL_PAIRS: ShellPair[] = [
  {
    mui: 'src/domain/space/layout/SpacePageLayout.tsx',
    crd: 'src/main/crdPages/space/layout/CrdSpacePageLayout.tsx',
  },
  {
    mui: 'src/domain/space/about/SpaceAboutPage.tsx',
    crd: 'src/main/crdPages/space/about/CrdSpaceAboutPage.tsx',
  },
  {
    mui: 'src/domain/communication/discussion/pages/ForumPage.tsx',
    crd: 'src/main/crdPages/topLevelPages/forum/ForumShell.tsx',
  },
];

// Providers that are MUI-specific by design (Emotion, MUI theme machinery).
// CRD shells will never mount these — Tailwind + shadcn don't need them.
const MUI_ONLY_PROVIDERS = new Set<string>([
  'ThemeProvider',
  'StyledEngineProvider',
  'CacheProvider',
  'CssVarsProvider',
  'CssBaseline',
]);

// Match opening JSX tags whose name ends in `Provider`. Self-closing or
// open-with-children both start with `<Name`. We don't try to parse JSX
// fully — for the parity check the existence of the tag is sufficient.
const PROVIDER_TAG = /<([A-Z][A-Za-z0-9]*Provider)\b/g;

const extractProviders = (relPath: string): Set<string> => {
  const absPath = resolve(REPO_ROOT, relPath);
  const source = readFileSync(absPath, 'utf8');
  const providers = new Set<string>();
  for (const match of source.matchAll(PROVIDER_TAG)) {
    providers.add(match[1]);
  }
  return providers;
};

describe('CRD ↔ MUI page-shell parity', () => {
  for (const pair of SHELL_PAIRS) {
    test(`CRD shell mounts every provider its MUI twin mounts: ${pair.crd}`, () => {
      const muiProviders = extractProviders(pair.mui);
      const crdProviders = extractProviders(pair.crd);

      const ignored = new Set([...MUI_ONLY_PROVIDERS, ...(pair.allowMissingInCrd ?? [])]);
      const expected = [...muiProviders].filter(name => !ignored.has(name));
      const missing = expected.filter(name => !crdProviders.has(name));

      // If this fails: the MUI shell mounts a provider the CRD twin doesn't.
      // Either mount it in the CRD shell, or — if the omission is intentional —
      // add the provider name to `allowMissingInCrd` for this pair AND document
      // the gap in docs/crd-migration-parity.md.
      expect(missing, `CRD shell ${pair.crd} is missing providers present in MUI ${pair.mui}`).toEqual([]);
    });
  }
});
