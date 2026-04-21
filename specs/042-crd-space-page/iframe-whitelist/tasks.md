# Tasks: Iframe Whitelist Context

## Task list

### T1: Create `MarkdownConfigProvider` context and `useMarkdownConfig` hook

**File:** `src/crd/lib/markdownConfig.tsx` (new)

Create a React context that carries `{ iframeAllowedUrls: string[] }` with a safe default (empty array). Export `MarkdownConfigProvider` (component) and `useMarkdownConfig` (hook).

**Acceptance criteria:**
- Context defaults to `{ iframeAllowedUrls: [] }` when no provider wraps the tree
- Uses React 19 `<Context value={...}>` pattern (no `.Provider`)
- No `useMemo` / `useCallback`
- Zero domain/MUI/Apollo imports

---

### T2: Update `MarkdownContent` to support whitelisted iframes

**File:** `src/crd/components/common/MarkdownContent.tsx` (modify)

**Changes:**
1. Import `useMarkdownConfig` from `@/crd/lib/markdownConfig`
2. Import `remarkVerifyIframe` from `@/core/ui/markdown/embed/remarkVerifyIframe`
3. Import `defaultSchema` from `hast-util-sanitize` for custom sanitize config
4. Define `IFRAME_ALLOWED_ATTRIBUTES` constant and `sanitizeSchema` (outside component, module-level)
5. Call `useMarkdownConfig()` to read `iframeAllowedUrls`
6. Update `remarkPlugins` to include `[remarkVerifyIframe, { allowedIFrameOrigins: iframeAllowedUrls }]`
7. Update `rehypePlugins` to use `[rehypeRaw, { passThrough: ['iframe'] }]` and `[rehypeSanitize, sanitizeSchema]`
8. Add iframe Tailwind descendant selectors: `[&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border-0`

**Acceptance criteria:**
- Iframes from whitelisted origins render correctly
- Iframes from non-whitelisted origins are stripped
- Iframes without HTTPS are stripped
- Iframes with `sandbox` attribute are stripped
- Non-iframe markdown still renders identically
- No MUI/domain imports (only `@/core/ui/markdown/embed/remarkVerifyIframe` which is pure infrastructure)

**Blocked by:** T1

---

### T3: Wire `MarkdownConfigProvider` in `CrdLayoutWrapper`

**File:** `src/main/ui/layout/CrdLayoutWrapper.tsx` (modify)

Wrap the CRD layout tree with `MarkdownConfigProvider`, passing `iframeAllowedUrls` from `useConfig().integration.iframeAllowedUrls`.

**Acceptance criteria:**
- All CRD pages receive the iframe whitelist from the server
- Fallback to `[]` if `integration` or `iframeAllowedUrls` is undefined

**Blocked by:** T1

---

### T4: Wire `MarkdownConfigProvider` in demo app

**File:** `src/crd/app/CrdApp.tsx` (modify)

Wrap the demo app with `MarkdownConfigProvider` using a hardcoded list of common iframe origins (YouTube, Vimeo, TED).

**Acceptance criteria:**
- Demo app renders iframes from the hardcoded origins
- No server dependency

**Blocked by:** T1

---

## Dependency graph

```
T1 ──┬──→ T2
     ├──→ T3
     └──→ T4
```

T2, T3, T4 can be done in parallel once T1 is complete. In practice T2+T3+T4 are all small — they can be a single commit.
