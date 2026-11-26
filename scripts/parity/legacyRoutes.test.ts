// @vitest-environment node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import fixture from './fixtures/legacy-routes.71f8.json';
import { checkRouteCensus, preserveCensusAnnotations, retiredPageFiles } from './route-census.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const legacySources = new Map<string, string>();
const legacy = (file: string) => {
  if (!legacySources.has(file))
    legacySources.set(
      file,
      execFileSync('git', ['show', `${fixture.sourceCommit}:${file}`], { cwd: root, encoding: 'utf8' })
    );
  return legacySources.get(file)!;
};

describe('71f8 legacy routes are the page specification', () => {
  it('keeps every route declaration, enclosing layout, guard and element props', () => {
    expect(checkRouteCensus(fixture, read, legacy)).toEqual([]);
    expect(Object.keys(fixture.policy.routeModules)).toHaveLength(19);
    expect(fixture.sourceCommit).toBe('71f8ddcf7d0a97097a4de445c0ddc0c8a8ecb252');
    expect(fixture.routes).toHaveLength(152);
    expect(fixture.routes.some(row => row.path.includes('/*/'))).toBe(false);
    for (const legacyPath of [
      '/spaces',
      '/home',
      '/:spaceNameId/about',
      '/:spaceNameId/challenges/:subspaceNameId/about',
      '/:spaceNameId/challenges/:subspaceNameId/opportunities/:subsubspaceNameId/about',
      '/user/me/settings/notifications',
      '/organization/:organizationNameId/settings/community',
      '/organization/:organizationNameId/settings/associates',
      '/organization/:organizationNameId/settings/authorization',
      '/vc/:vcNameId/settings/profile',
      '/admin/users/:userId/edit',
    ]) {
      expect(
        fixture.routes.some(row => row.path === legacyPath),
        legacyPath
      ).toBe(true);
    }
  });

  it('keeps historical citations valid when an adapter becomes shorter, without hiding route drift', () => {
    const hook = 'src/main/crdPages/spaces/useSpaceExplorer.ts';
    const current = (file: string) => (file === hook ? 'export default () => null;' : read(file));
    expect(checkRouteCensus(fixture, current, legacy)).toEqual([]);
    expect(checkRouteCensus(fixture, current).some(finding => finding.startsWith('Invalid legacy citation:'))).toBe(
      true
    );
    const changed = 'src/main/routing/TopLevelRoutes.tsx';
    expect(read(changed)).toContain('<CrdSpaceRoutes />');
    expect(
      checkRouteCensus(
        fixture,
        file => (file === changed ? read(file).replace('<CrdSpaceRoutes />', '<Replacement />') : current(file)),
        legacy
      )
    ).toContain(`Legacy route/layout changed: ${changed}`);
    const bad = {
      ...fixture,
      routes: fixture.routes.map(row =>
        row.path === '/spaces' ? { ...row, source: { ...row.source, line: 999999 } } : row
      ),
    };
    expect(checkRouteCensus(bad, current, legacy).some(finding => finding.startsWith('Invalid legacy citation:'))).toBe(
      true
    );
  });

  it('keeps the historical census while refusing expansion beyond issued root, Space and Kratos runtime', () => {
    const route = 'src/main/routing/TopLevelRoutes.tsx';
    expect(Object.keys(fixture.runtimeIncrement.routeModules)).toEqual([
      route,
      'src/core/auth/authentication/routing/IdentityRoute.tsx',
      'src/main/crdPages/auth/LoginCrdRoute.tsx',
      'src/main/crdPages/auth/SignUpCrdRoute.tsx',
    ]);
    // c2-space-pages (WP-C2, spaces 2026-11-26): CrdSpaceRoutes is the 71f8 route table again, mounted at
    // ':spaceNameId/*' in TopLevelRoutes as at 71f8, so it carries no runtime override.
    expect(checkRouteCensus(fixture, read, legacy)).not.toContain(
      'Legacy route/layout changed: src/main/crdPages/space/routing/CrdSpaceRoutes.tsx'
    );
    const changed = (file: string) =>
      file === route ? read(file).replace('path={TopLevelRoutePath.Spaces}', 'path="other"') : read(file);
    expect(checkRouteCensus(fixture, changed, legacy)).toContain(`Legacy route/layout changed: ${route}`);
    expect(fixture.runtimeIncrement.scope).toContain('0served');
  });

  it('rejects changing the issued login route even when the replacement uses an existing route', () => {
    const route = 'src/core/auth/authentication/routing/IdentityRoute.tsx';
    const changed = (file: string) =>
      file === route ? read(file).replace('path={IdentityRoutes.Login}', 'path={IdentityRoutes.SignUp}') : read(file);
    expect(checkRouteCensus(fixture, changed, legacy)).toContain(`Legacy route/layout changed: ${route}`);
  });

  it('rejects a missing legacy citation even when it points to line one', () => {
    const missing = 'src/main/crdPages/missingLegacyPage.tsx';
    const row = fixture.routes[0];
    const changed = {
      ...fixture,
      routes: [{ ...row, source: { file: missing, line: 1 } }, ...fixture.routes.slice(1)],
    };
    expect(
      checkRouteCensus(changed, read, file => {
        if (file === missing) throw Object.assign(new Error('Missing legacy file'), { code: 'ENOENT' });
        return legacy(file);
      })
    ).toContain(`Invalid legacy citation: ${row.id}: ${missing}:1`);
  });

  it('keeps the retired hub route as history and rejects restoring its current module', () => {
    const route = 'src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx';
    expect(fixture.policy.retiredComponents).toContain(route);
    expect(fixture.policy.retiredComponents).toContain('src/main/crdPages/innovationHub/CrdInnovationHubHomePage.tsx');
    expect(fixture.policy.retiredComponents).toContain('src/main/topLevelPages/Home/CrdHomePage.tsx');
    expect(checkRouteCensus(fixture, file => (file === route ? legacy(file) : read(file)), legacy)).toContain(
      `Retired route module still present: ${route}`
    );
  });

  it('rejects a removed legacy route', () => {
    const file = 'src/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsRoutes.tsx';
    expect(
      checkRouteCensus(fixture, name =>
        name === file ? read(name).replace('path="security"', 'path="removed"') : read(name)
      )
    ).toContain(`Legacy route/layout changed: ${file}`);
  });

  it('rejects replacing a legacy layout even when its URL stays the same', () => {
    const file = 'src/main/routing/TopLevelRoutes.tsx';
    expect(read(file)).toContain('<App />');
    expect(
      checkRouteCensus(fixture, name =>
        name === file ? read(name).replace('<App />', '<V2SpacePage />') : read(name)
      )
    ).toContain(`Legacy route/layout changed: ${file}`);
  });

  it('mounts the original root and TopLevelRoutes rather than the retired V2 pages', () => {
    expect(read('src/index.tsx')).toContain("import Root from './root'");
    expect(read('src/index.tsx')).not.toContain('RootV2');
    expect(read('src/root.tsx')).toContain('<TopLevelRoutes />');
  });

  it('rejects drift in the privilege-aware settings redirect before a restricted tab can query', () => {
    const file = 'src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes.tsx';
    expect(
      checkRouteCensus(fixture, name =>
        name === file
          ? read(name).replace(
              "accessMode === 'community-only' ? 'associates'",
              "accessMode === 'community-only' ? 'profile'"
            )
          : read(name)
      )
    ).toContain(`Legacy route behaviour changed: ${file}`);
    expect(
      checkRouteCensus(fixture, name =>
        name === file
          ? read(name).replace(
              'path="community" element={<Navigate to="../associates"',
              'path="community" element={<Navigate to="../profile"'
            )
          : read(name)
      )
    ).toContain(`Legacy route/layout changed: ${file}`);
  });

  it('uses the same fixture to forbid replacement V2 pages, dialogs, panels and shells', () => {
    expect(retiredPageFiles(root, fixture)).toEqual([]);
  });

  it('rejects a newly added replacement page through the shared deletion policy', () => {
    const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'client2-parity-policy-'));
    try {
      const folder = path.join(temporaryRoot, 'src', 'example', 'v2');
      fs.mkdirSync(folder, { recursive: true });
      for (const name of ['ReplacementPage', 'ReplacementContainer'])
        fs.writeFileSync(path.join(folder, `${name}.tsx`), `export const ${name} = () => null;`);
      fs.writeFileSync(path.join(temporaryRoot, 'src/rootV2.tsx'), 'export const RootV2 = () => null;');
      fs.writeFileSync(path.join(folder, 'V2ConfigProvider.tsx'), 'export const V2ConfigProvider = () => null;');
      expect(retiredPageFiles(temporaryRoot, fixture)).toEqual([
        'src/example/v2/ReplacementContainer.tsx',
        'src/example/v2/ReplacementPage.tsx',
        'src/rootV2.tsx',
      ]);
    } finally {
      fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  });

  it('preserves pending evidence across regeneration without reviving historical provider claims', () => {
    const result = preserveCensusAnnotations(fixture, {
      ...fixture,
      routes: fixture.routes.map(row => ({
        ...row,
        connectorState: `pending detailed evidence: ${row.path}`,
        evidence: { state: 'pending1440/390' },
      })),
    });
    expect(result.routes.every(row => row.connectorState === `pending detailed evidence: ${row.path}`)).toBe(true);
    expect(result.routes.every(row => row.evidence.state === 'pending1440/390')).toBe(true);
    expect(result.historicalEvidence).toEqual(fixture.historicalEvidence);
    expect('nativeDependencies' in fixture).toBe(false);
    expect(
      fixture.routes.every(row => /pending/i.test(row.connectorState) && !/\bserved\b/i.test(row.connectorState))
    ).toBe(true);
  });

  it('records about/apply as pending instead of accepting a missing legacy flow', () => {
    const rows = fixture.routes.filter(
      row => row.path.includes(':spaceNameId') && row.path.endsWith('/about') && !row.path.includes('/settings/')
    );
    expect(rows).toHaveLength(3);
    for (const row of rows) expect(row.connectorState).toContain('KNOWN-pending: core-c1 L071/L072');
  });

  it('keeps historical annotations byte-stable on the first and subsequent regeneration', () => {
    const { historicalEvidence, ...baseline } = fixture;
    const previous = {
      ...baseline,
      sourceCommit: 'fed85e3fea9dc8daf0e777589d3236472e8271a6',
      nativeDependencies: historicalEvidence.nativeDependencies,
      annotationSourceCommit: '320228189ed758e1ba21d95b66cd9607e695f221',
    };
    const first = preserveCensusAnnotations(fixture, previous);
    const second = preserveCensusAnnotations(fixture, first);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });
});
