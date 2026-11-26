import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import license from 'rollup-plugin-license';
import satisfies from 'spdx-satisfies';
import packageJson from './package.json';

/**
 * Licences a bundled package may carry. A bundled package with no licence, or one outside this
 * list, fails the build. Only permissive licences belong here: adding any other licence is a
 * decision for whoever owns the list, not a build fix.
 */
const ALLOWED_LICENSES = [
  'MIT',
  'ISC',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  '0BSD',
  'Zlib',
  'CC0-1.0',
  'Unlicense',
];

/**
 * Packages whose package.json carries no SPDX id, with the licence read from the licence file
 * they ship. Keyed by exact version so an upgrade has to be checked again.
 */
const LICENSE_FROM_LICENSE_FILE = {
  'khroma@2.1.0': 'MIT',
  'stackframe@0.3.1': 'Unlicense',
};

const licenseOf = dependency =>
  LICENSE_FROM_LICENSE_FILE[`${dependency.name}@${dependency.version}`] ?? dependency.license;

const isAllowed = dependency => {
  try {
    return satisfies(licenseOf(dependency), `(${ALLOWED_LICENSES.join(' OR ')})`);
  } catch {
    // no licence, or not an SPDX expression: rejected, and the plugin names the package
    return false;
  }
};

/**
 * The plugin lists a package when one of its own modules is rendered into a chunk, so it misses
 * two kinds. Both are read here and held to the same allow-list.
 */
// direct dependencies that reach the build only as CSS
const CSS_ONLY_PACKAGES = ['tailwindcss', 'tw-animate-css'];
// direct dependencies shipped as one prebuilt file with their own dependencies inlined: the
// plugin lists the package itself, and its dependency tree is added here
const PREBUNDLED_PACKAGES = ['maplibre-gl'];

const readDependency = directory => {
  const licenseFile = readdirSync(directory).find(file => /^licen[cs]e/i.test(file));
  const dependency = {
    ...JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')),
    licenseText: licenseFile && readFileSync(join(directory, licenseFile), 'utf8'),
  };
  if (!isAllowed(dependency)) {
    throw new Error(
      `Dependency "${dependency.name}" has a license (${dependency.license}) which is not on the allow-list`
    );
  }
  return dependency;
};

// pnpm installs a package's dependencies beside it, in the node_modules directory holding its real path
const dependencyTree = (directory, found = new Map()) => {
  const { name, dependencies = {} } = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
  const siblings = join(realpathSync(directory), ...name.split('/').map(() => '..'));
  for (const dependencyName of Object.keys(dependencies)) {
    // type declarations are never bundled
    if (dependencyName.startsWith('@types/')) continue;
    const dependency = readDependency(join(siblings, dependencyName));
    const key = `${dependency.name}@${dependency.version}`;
    if (found.has(key)) continue;
    found.set(key, dependency);
    dependencyTree(join(siblings, dependencyName), found);
  }
  return found;
};

const withUnscannedDependencies = scanned => {
  const all = new Map(scanned.map(dependency => [`${dependency.name}@${dependency.version}`, dependency]));
  const unscanned = [
    ...CSS_ONLY_PACKAGES.map(name => readDependency(join('node_modules', name))),
    ...PREBUNDLED_PACKAGES.flatMap(name => [...dependencyTree(join('node_modules', name)).values()]),
  ];
  for (const dependency of unscanned) {
    const key = `${dependency.name}@${dependency.version}`;
    if (!all.has(key)) all.set(key, dependency);
  }
  return [...all.values()];
};

const ELEMENT_CALL_VERSION = packageJson.dependencies['@element-hq/element-call-embedded'];

const escapeHtml = value =>
  String(value ?? '').replace(
    /[&<>"']/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]
  );

// package.json `repository` may be `owner/repo` or `github:owner/repo` shorthand, or a `git+https:`/`git:` URL
const repositoryUrl = ({ repository }) => {
  const url = (typeof repository === 'string' ? repository : repository?.url) ?? '';
  return /^(github:)?[\w.-]+\/[\w.-]+$/.test(url)
    ? `https://github.com/${url.replace(/^github:/, '')}`
    : url.replace(/^git\+/, '').replace(/^git:\/\//, 'https://').replace(/\.git$/, '');
};

const httpUrl = dependency =>
  [dependency.homepage, repositoryUrl(dependency)].find(url => /^https?:\/\//.test(url));

const renderDependency = dependency => {
  const url = httpUrl(dependency);
  return `<section>
<h2>${escapeHtml(dependency.name)} ${escapeHtml(dependency.version)}</h2>
<p>License: ${escapeHtml(licenseOf(dependency))}${
    url ? ` &middot; <a href="${escapeHtml(url)}" rel="noopener noreferrer">${escapeHtml(url)}</a>` : ''
  }</p>
${dependency.licenseText ? `<pre>${escapeHtml(dependency.licenseText)}</pre>` : ''}
${dependency.noticeText ? `<h3>Notice</h3>\n<pre>${escapeHtml(dependency.noticeText)}</pre>` : ''}
</section>`;
};

const renderPage = dependencies => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Third-party licenses</title>
<link rel="icon" href="/favicon.ico" />
<style>
/* The platform's light theme (src/crd/styles/theme.css), inlined so the page stays self-contained. */
:root { color-scheme: light; }
body { font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #fcfdfe; color: #1d384a; margin: 0; line-height: 1.5; }
main { max-width: 60rem; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
a { color: inherit; text-underline-offset: 2px; }
a:focus-visible { outline: 2px solid rgba(29, 56, 74, 0.5); outline-offset: 2px; border-radius: 2px; }
.home { display: inline-block; }
.home img { height: 1.5rem; display: block; }
h1 { font-size: 1.5rem; }
h2 { font-size: 1.1rem; margin-top: 2rem; }
p { color: #64748b; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 0.8rem; padding: 0.75rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; }
</style>
</head>
<body>
<main>
<a class="home" href="/"><img src="/alkemio-logo.svg" alt="Alkemio" /></a>
<h1>Third-party licenses</h1>
<p>Alkemio is built with the open-source software listed below. Each package is distributed under its own license.</p>
<section>
<h2>Element Call ${escapeHtml(ELEMENT_CALL_VERSION)}</h2>
<p>The call window is Element Call, served unmodified under <code>/element-call/</code> and licensed AGPL-3.0-only
(or the Element Commercial License): see <a href="/element-call/SOURCE.html">its license and corresponding source</a>.
Its prebuilt package carries no notices for the components it bundles; they are listed in the
<a href="https://github.com/element-hq/element-call/tree/v${escapeHtml(ELEMENT_CALL_VERSION)}" rel="noopener noreferrer">upstream
element-call source at v${escapeHtml(ELEMENT_CALL_VERSION)}</a>.</p>
</section>
<section>
<h2>Source Sans Pro</h2>
<p>License: OFL-1.1 &middot; the font files are served unmodified under <code>/fonts/source-sans-pro/</code>.</p>
<pre>${escapeHtml(readFileSync('public/fonts/source-sans-pro/OFL.txt', 'utf8'))}</pre>
</section>
${withUnscannedDependencies(dependencies).map(renderDependency).join('\n')}
</main>
</body>
</html>
`;

/**
 * Writes `third-party-licenses.html` beside the build: every package bundled into the app with its
 * licence text, plus Element Call and Source Sans Pro, which are served beside the app rather than bundled into it.
 * Shared by every Vite config; runs on builds only.
 */
export const thirdPartyLicenses = () => ({
  ...license({
    thirdParty: {
      // without this the plugin keeps one version per package name: the others go unlisted and unchecked
      multipleVersions: true,
      allow: {
        test: isAllowed,
        failOnUnlicensed: true,
        failOnViolation: true,
      },
      output: { file: 'build/third-party-licenses.html', template: renderPage },
    },
  }),
  apply: 'build',
});
