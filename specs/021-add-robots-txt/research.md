# Research: Add robots.txt to the Platform

**Feature**: 021-add-robots-txt | **Date**: 2026-03-11

## 1. Build-time Generation Pattern

**Decision**: Extend `buildConfiguration.js` to generate `public/robots.txt` alongside `public/env-config.js`.

**Rationale**: The script already loads all `VITE_APP_*` environment variables via `dotenv-flow`, writes to `public/`, and runs before every `build` and `start` command (see `package.json` scripts). Adding robots.txt generation here requires zero new infrastructure.

**Alternatives considered**:
- **Vite plugin**: Would require a custom plugin; more complex than a simple `writeFile` call in existing script.
- **Runtime generation (server middleware)**: Not applicable — this is a static SPA served by Nginx/CDN. No server-side rendering.
- **Multiple static files with conditional copy**: Error-prone; env-var-driven generation is cleaner and matches existing patterns.

## 2. Environment Detection Mechanism

**Decision**: New `VITE_APP_ROBOTS_ALLOW_INDEXING=true` environment variable. When `true`, generate production rules; otherwise, disallow all (fail-safe).

**Rationale**: Simple boolean flag. Fail-safe design means any misconfiguration (missing var, typo, empty string) results in blocking crawlers. Only explicit `true` enables indexing.

**Alternatives considered**:
- **Reuse `NODE_ENV`**: Too coarse — `NODE_ENV=production` is used for build optimizations, not deployment target. A staging build might use `NODE_ENV=production` for performance while still needing crawlers blocked.
- **`VITE_APP_ENVIRONMENT` string matching**: More complex parsing; introduces risk of typos in environment names.

## 3. robots.txt Content (RFC 9309 Compliance)

**Decision**: Two variants:

### Production (VITE_APP_ROBOTS_ALLOW_INDEXING=true)

```text
User-agent: *
Allow: /
Disallow: /admin
```

### Non-production (default)

```text
User-agent: *
Disallow: /
```

**Rationale**:
- Production allows all paths except `/admin` (admin panel should not be indexed).
- Non-production blocks everything to prevent SEO pollution.
- No `Sitemap:` directive per spec — deferred until sitemap exists.
- Format follows RFC 9309 exactly: `User-agent` directive followed by `Allow`/`Disallow` directives.

**Alternatives considered**:
- **Listing specific allowed paths**: Overly restrictive; platform routes change frequently. `Allow: /` with targeted disallows is standard practice.
- **Multiple user-agent blocks**: Unnecessary unless specific bots need different treatment. One `User-agent: *` block is sufficient.

## 4. Content Type Handling

**Decision**: No special handling needed. Vite's dev server and production web servers (Nginx) serve `.txt` files as `text/plain` by default.

**Rationale**: The robots.txt file has a `.txt` extension. Standard web servers already map this to `text/plain` content type. No custom MIME type configuration required.

## 5. Testing Strategy

**Decision**: Extract the robots.txt content generation into a pure function, unit-test it with Vitest.

**Rationale**: The generation logic is simple (string output based on boolean input), making it easy to test in isolation. The file-writing concern stays in `buildConfiguration.js` and doesn't need testing (it's the same `writeFile` pattern already used and proven).

**Alternatives considered**:
- **Integration test with actual file system**: Overkill for a string template function.
- **E2E test requesting /robots.txt**: Valuable but requires deployed environment; can be done as part of manual QA or CI smoke test.

## 6. .gitignore Consideration

**Decision**: Add `public/robots.txt` to `.gitignore`.

**Rationale**: Generated files should not be committed. Existing patterns: `public/meta.json` is explicitly listed in `.gitignore` (line 17), and `public/env-config.js` is covered by the glob `public/*config.js` (line 34). Adding `/public/robots.txt` explicitly follows the `meta.json` pattern.
