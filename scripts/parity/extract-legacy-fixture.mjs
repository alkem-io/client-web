// One-time baseline extraction. Normal tests never regenerate their expected fixture.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { preserveCensusAnnotations, routeDeclarations, sourceHash } from './route-census.mjs';

const sourceCommit = '71f8ddcf7d0a97097a4de445c0ddc0c8a8ecb252';
const output = 'scripts/parity/fixtures/legacy-routes.71f8.json';
const previous = fs.existsSync(output) ? JSON.parse(fs.readFileSync(output, 'utf8')) : null;
const baselineFiles = new Set(execFileSync('git', ['ls-tree', '-r', '--name-only', sourceCommit], { encoding: 'utf8' }).trim().split('\n'));
const cache = new Map();
const read = file => {
  if (!cache.has(file)) cache.set(file, execFileSync('git', ['show', `${sourceCommit}:${file}`], { encoding: 'utf8' }));
  return cache.get(file);
};
const modules = execFileSync('git', ['grep', '-l', '-E', '<Route([ >]|$)', sourceCommit, '--', 'src/**/*.tsx'], { encoding: 'utf8' })
  .trim().split('\n').map(file => file.slice(sourceCommit.length + 1))
  .filter(file => !/\.(test|spec)\.tsx$/.test(file) && file !== 'src/crd/app/CrdApp.tsx');
const prefixes = {
  'src/core/auth/authentication/routing/IdentityRoute.tsx': [''],
  'src/main/routing/TopLevelRoutes.tsx': [''],
  'src/main/crdPages/auth/LoginCrdRoute.tsx': ['/login'],
  'src/main/crdPages/auth/SignUpCrdRoute.tsx': ['/registration'],
  'src/main/crdPages/auth/VerifyCrdRoute.tsx': ['/verify'],
  'src/domain/InnovationPack/InnovationPackRoute.tsx': ['/innovation-packs'],
  'src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx': ['/hub'],
  'src/main/crdPages/space/routing/CrdSpaceRoutes.tsx': ['/:spaceNameId'],
  'src/main/crdPages/subspace/routing/CrdSubspaceRoutes.tsx': ['/:spaceNameId/challenges/:subspaceNameId'],
  'src/main/crdPages/topLevelPages/admin/CrdAdminRoutes.tsx': ['/admin'],
  'src/main/crdPages/topLevelPages/admin/organizations/CrdAdminOrganizationsRoutes.tsx': ['/admin/organizations'],
  'src/main/crdPages/topLevelPages/admin/users/CrdAdminUsersRoutes.tsx': ['/admin/users'],
  'src/main/crdPages/topLevelPages/forum/CrdForumRoute.tsx': ['/forum'],
  'src/main/crdPages/topLevelPages/organizationPages/CrdOrganizationRoutes.tsx': ['/organization'],
  'src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes.tsx': ['/organization/:organizationNameId/settings'],
  'src/main/crdPages/topLevelPages/userPages/CrdUserRoutes.tsx': ['/user'],
  'src/main/crdPages/topLevelPages/userPages/settings/CrdUserSettingsRoutes.tsx': ['/user/me/settings', '/user/:userNameId/settings'],
  'src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx': ['/vc'],
  'src/main/crdPages/topLevelPages/vcPages/settings/CrdVCSettingsRoutes.tsx': ['/vc/:vcNameId/settings'],
};
const constants = { GUEST_SHARE_PATH: '/public/whiteboard', KNOWLEDGE_BASE_PATH: 'knowledge-base' };
for (const file of ['src/main/routing/TopLevelRoutePath.ts', 'src/domain/shared/layout/EntityPageSection.ts', 'src/core/auth/authentication/routing/IdentityRoute.tsx']) {
  const sf = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  for (const node of sf.statements.filter(ts.isEnumDeclaration)) {
    for (const member of node.members) {
      if (!member.initializer || !ts.isStringLiteral(member.initializer)) throw new Error('Unsupported enum');
      constants[`${node.name.text}.${member.name.getText(sf)}`] = member.initializer.text;
    }
  }
}
function value(node) {
  if (!node) return '';
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isJsxExpression(node)) return value(node.expression);
  if (ts.isTemplateExpression(node)) return node.head.text + node.templateSpans.map(s => value(s.expression) + s.literal.text).join('');
  const text = node.getText();
  if (text.startsWith('nameOfUrl.')) return text.slice('nameOfUrl.'.length);
  if (text === 'section.id') return '{adminSection}';
  if (Object.hasOwn(constants, text)) return constants[text];
  throw new Error(`Unknown route path expression: ${text}`);
}
function resolveModule(from, specifier) {
  const base = specifier.startsWith('@/') ? `src/${specifier.slice(2)}` : path.posix.normalize(path.posix.join(path.posix.dirname(from), specifier));
  for (const suffix of ['.tsx', '.ts', '/index.tsx', '/index.ts']) if (baselineFiles.has(base + suffix)) return base + suffix;
  return null;
}
const ignored = new Set(['Suspense', 'Loading', 'LoadingSpinner', 'Routes', 'Route', 'WithApmTransaction', 'NonIdentity', 'NoIdentityRedirect', 'NotAuthenticatedRoute', 'AdminSectionGuard']);
const routers = new Set(['CrdAdminRoutes', 'CrdUserRoutes', 'CrdVCRoutes', 'CrdOrganizationRoutes', 'InnovationPackRoute', 'CrdHubRoute', 'CrdForumRoute', 'CrdSpaceRoutes', 'SubspaceRoutes', 'UserSettingsDispatch', 'OrgSettingsDispatch', 'VcSettingsDispatch', 'CrdAdminUsersRoutes', 'CrdAdminOrganizationsRoutes']);
const admin = {
  spaces: 'CrdAdminSpacesPage', users: 'CrdAdminUsersRoutes', organizations: 'CrdAdminOrganizationsRoutes',
  'innovation-packs': 'CrdAdminInnovationPacksPage', 'innovation-hubs': 'CrdAdminInnovationHubsPage',
  'virtual-contributors': 'CrdAdminVirtualContributorsPage', authorization: 'CrdAdminGlobalRolesPage',
  'authorization-policies': 'CrdAdminAuthorizationPoliciesPage', transfer: 'CrdAdminTransferPage', licensing: 'CrdAdminLicensingPage',
};
const join = (...parts) => `/${parts.map((part, index) => {
  const trimmed = part.replace(/^\/+|\/+$/g, '');
  return index === parts.length - 1 ? trimmed : trimmed.replace(/(?:\/|^)\*$/, '');
}).filter(Boolean).join('/')}`;
const rows = [];
const routeModules = {};
const citation = (file, line, rule) => ({ file, line, rule });

for (const file of modules) {
  if (!prefixes[file]) throw new Error(`Missing legacy router mount prefix: ${file}`);
  const source = read(file);
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  routeModules[file] = routeDeclarations(file, source);
  const componentFiles = new Map();
  for (const stmt of sf.statements) {
    if (ts.isImportDeclaration(stmt) && stmt.importClause && ts.isStringLiteral(stmt.moduleSpecifier)) {
      const target = resolveModule(file, stmt.moduleSpecifier.text);
      if (stmt.importClause.name && target) componentFiles.set(stmt.importClause.name.text, target);
      const bindings = stmt.importClause.namedBindings;
      if (bindings && ts.isNamedImports(bindings) && target) for (const item of bindings.elements) componentFiles.set(item.name.text, target);
    }
    if (ts.isVariableStatement(stmt)) for (const decl of stmt.declarationList.declarations) {
      let target;
      function findImport(node) {
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && ts.isStringLiteral(node.arguments[0])) target = resolveModule(file, node.arguments[0].text);
        ts.forEachChild(node, findImport);
      }
      if (decl.initializer) findImport(decl.initializer);
      if (target) componentFiles.set(decl.name.getText(sf), target);
    }
  }
  function visit(node, ancestors = []) {
    const opening = ts.isJsxElement(node) ? node.openingElement : ts.isJsxSelfClosingElement(node) ? node : null;
    if (opening?.tagName.getText(sf) === 'Route') {
      const attr = name => opening.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.text === name);
      const localPath = value(attr('path')?.initializer);
      const element = attr('element')?.initializer;
      const tags = [];
      function collectTags(child) {
        if ((ts.isJsxElement(child) && child.openingElement.tagName.getText(sf) === 'Route') ||
          (ts.isJsxSelfClosingElement(child) && child.tagName.getText(sf) === 'Route')) return;
        if (ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) {
          const name = child.tagName.getText(sf);
          if (!ignored.has(name) && /^[A-Z]/.test(name)) tags.push(name);
        }
        ts.forEachChild(child, collectTags);
      }
      if (element) collectTags(element);
      const info = { path: localPath, tags, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1 };
      const next = [...ancestors, info];
      let nested = false;
      function hasRoute(child) {
        if (child !== node && ((ts.isJsxElement(child) && child.openingElement.tagName.getText(sf) === 'Route') || (ts.isJsxSelfClosingElement(child) && child.tagName.getText(sf) === 'Route'))) nested = true;
        ts.forEachChild(child, hasRoute);
      }
      hasRoute(node);
      if (!nested) {
        const leaf = tags.at(-1);
        const variants = localPath.includes('{adminSection}') ? Object.entries(admin) : [[null, leaf]];
        for (const [section, layout] of variants) {
          if (!layout || routers.has(layout)) continue;
          const sourceLayoutFile = componentFiles.get(layout) ?? file;
          const layoutSource = read(sourceLayoutFile);
          const declarationLine = layoutSource.split('\n').findIndex(line => new RegExp(`(?:function|const|class)\\s+${layout}\\b`).test(line)) + 1 || 1;
          for (const prefix of prefixes[file]) {
            const routePath = join(prefix, ...next.map(item => item.path)).replace('{adminSection}', section ?? '');
            const dataMapper = routePath === '/home' ? 'src/main/crdPages/dashboard/dashboardV2DataMapper.ts'
              : routePath.startsWith('/hub/') ? 'src/main/crdPages/innovationHub/dataMappers/homepageV2DataMapper.ts'
                : routePath === '/spaces' ? 'src/main/crdPages/spaces/spaceExplorerV2DataMapper.ts'
                  : routePath.includes(':spaceNameId') ? 'src/domain/space/context/spaceV2DataMapper.ts'
                    : routePath.startsWith('/user') || routePath.startsWith('/organization') || routePath.startsWith('/vc') ? 'src/domain/community/actor/actorV2DataMapper.ts'
                      : 'src/main/routing/parity/legacyProviderAdapters';
            const behaviour = [citation(file, info.line, `Mount ${layout} with the legacy route guards, enclosing layouts and element props.`)];
            if (routePath === '/spaces') behaviour.push(
              citation('src/main/crdPages/spaces/useSpaceExplorer.ts', 24, 'All/public roots use 10 items per page.'),
              citation('src/crd/components/space/SpaceExplorer.tsx', 313, 'Load more is a button; it is not infinite scroll.'),
              citation('src/main/crdPages/spaces/useSpaceExplorer.ts', 79, 'My spaces and search do not use the all/public pagination.'),
              citation('src/main/crdPages/spaces/useSpaceExplorer.ts', 133, 'Load missing root children as one batch; retain already loaded children.'),
              citation('src/main/crdPages/spaces/spaceCardDataMapper.ts', 66, 'Private subspaces retain the legacy locked card presentation.')
            );
            if (routePath.includes(':spaceNameId')) behaviour.push(citation('src/main/crdPages/space/layout/CrdSpacePageLayout.tsx', 224, 'Keep SpaceShell framing, header actions, tabs and sidebar; keep subspace layout at nested levels.'));
            if (file.endsWith('/CrdOrgSettingsRoutes.tsx')) behaviour.push(
              citation(file, 19, 'Wait for organization privileges; index selects Associates for community-only access, otherwise Profile.'),
              citation(file, 29, 'Community-only access redirects non-Associates tabs before mounting or querying them.'),
              citation(file, 85, 'The old Community URL redirects to Associates with replace.'),
              citation(file, 111, 'Authorization redirects to Associates with replace.'),
              citation(file, 125, 'Unknown settings segments return to the privilege-aware index, without a redirect loop.'),
              citation('src/main/crdPages/topLevelPages/organizationPages/useCanEditOrganizationSettings.ts', 31, 'Update grants full access; the existing Platform Support community privilege grants community-only access; neither grants no settings access.')
            );
            const id = `${file.replace(/^src\//, '').replace(/\.tsx$/, '')}:${info.line}:${prefix || '/'}${section ? `:${section}` : ''}`;
            rows.push({
              id, path: routePath, legacyLayout: layout, dataMapper, behaviour,
              source: { file, line: info.line }, legacyLayoutSource: { file: sourceLayoutFile, line: declarationLine },
              layoutChain: next.flatMap(item => item.tags).filter(tag => !routers.has(tag)),
              connectorState: routePath.includes('/about') && routePath.includes(':spaceNameId') ? 'KNOWN-pending: core-c1 L071/L072 read flags, applicationForm, membership.request and held-form validation' : 'pending new-API adapter; structural mount only',
              behaviourCoverage: routePath === '/spaces' ? 'route and explorer pagination/batching; runtime parity pending' : 'route mount; complete connector-specific behaviour before runtime parity acceptance',
            });
          }
        }
      }
      ts.forEachChild(node, child => visit(child, next));
    } else ts.forEachChild(node, child => visit(child, ancestors));
  }
  visit(sf);
}
// Space settings keep a single wildcard router entry; its legacy URL tab dispatcher
// is part of the route census as well, including the different L0/L1/L2 tab sets.
for (const parent of [...rows].filter(row => ['CrdSpaceSettingsPage', 'CrdSubspaceSettingsRoute'].includes(row.legacyLayout))) {
  const level = parent.path.includes('/opportunities/') ? 2 : parent.path.includes('/challenges/') ? 1 : 0;
  const tabs = ['about', 'layout', 'community', 'updates', 'subspaces', 'templates', 'storage', 'settings', 'account']
    .filter(tab => level === 0 || !['templates', 'storage', 'account', ...(level === 2 ? ['subspaces'] : [])].includes(tab));
  for (const tab of tabs) rows.push({
    ...parent,
    id: `${parent.id}:tab:${tab}`,
    path: `${parent.path.replace(/\/\*$/, '')}/${tab}`,
    dataMapper: 'src/main/crdPages/topLevelPages/spaceSettings/spaceSettingsV2DataMapper.ts',
    behaviour: [
      ...parent.behaviour,
      citation('src/main/crdPages/topLevelPages/spaceSettings/useSpaceSettingsTab.ts', 30, 'Select the tab from the first settings URL segment; unknown or unavailable tabs redirect to About.'),
      citation('src/main/crdPages/topLevelPages/spaceSettings/useVisibleSettingsTabs.ts', 28, 'Preserve the legacy settings tab set for the current space level.'),
    ],
    connectorState: 'pending new-API settings adapter; preserve legacy tab, permission and dirty-form behaviour',
  });
}
const fixture = {
  schemaVersion: 1, sourceCommit, routes: rows,
  policy: {
    scope: 'Legacy route/layout source census. New-API connector and runtime parity are separate obligations; pending rows never waive the gate.',
    legacyRootHash: sourceHash(read('src/root.tsx')),
    routeModules,
    baselineSources: Object.fromEntries([...cache].map(([file, source]) => [file, sourceHash(source)])),
    behaviourSources: Object.fromEntries([
      'src/main/crdPages/topLevelPages/organizationPages/settings/CrdOrgSettingsRoutes.tsx',
      'src/main/crdPages/topLevelPages/organizationPages/useCanEditOrganizationSettings.ts',
    ].map(file => [file, sourceHash(read(file))])),
    retiredComponentPattern: '(?:Page|Dialog|Panel|Container)\\.tsx$',
    retiredComponents: [
      'src/rootV2.tsx',
      'src/main/crdPages/space/v2/V2SpaceNavigation.tsx',
      'src/main/ui/layout/v2/V2CrdLayoutWrapper.tsx',
      'src/main/crdPages/dashboard/v2/V2PendingRequests.tsx',
      'src/main/crdPages/notifications/v2/V2InboxMessage.tsx',
      'src/main/crdPages/topLevelPages/userPages/settings/v2/V2OwnSettingsShell.tsx',
      'src/main/crdPages/innovationHub/CrdInnovationHubHomePage.tsx',
      'src/main/crdPages/innovationHub/routing/CrdHubRoute.tsx',
      'src/main/topLevelPages/Home/CrdHomePage.tsx',
    ],
  },
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(preserveCensusAnnotations(fixture, previous), null, 2)}\n`);
process.stdout.write(`${rows.length} route rows, ${modules.length} legacy route modules\n`);
