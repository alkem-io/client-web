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
<style>
:root { color-scheme: light dark; }
body { font-family: system-ui, sans-serif; max-width: 60rem; margin: 0 auto; padding: 1rem; line-height: 1.5; }
h2 { font-size: 1.1rem; margin-top: 2rem; }
pre { white-space: pre-wrap; overflow-wrap: anywhere; font-size: 0.8rem; padding: 0.75rem; border: 1px solid; border-radius: 4px; }
</style>
</head>
<body>
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
${dependencies.map(renderDependency).join('\n')}
</body>
</html>
`;

/**
 * Writes `third-party-licenses.html` beside the build: every package bundled into the app with its
 * licence text, plus Element Call, which is served beside the app rather than bundled into it.
 * Shared by every Vite config; runs on builds only.
 */
export const thirdPartyLicenses = () => ({
  ...license({
    thirdParty: {
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
