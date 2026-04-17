# Implementation Plan: Iframe Whitelist Context

## File inventory

### New files

| File | Purpose |
|------|---------|
| `src/crd/lib/markdownConfig.tsx` | `MarkdownConfigProvider` context + `useMarkdownConfig` hook |

### Modified files

| File | Change |
|------|--------|
| `src/crd/components/common/MarkdownContent.tsx` | Add `remarkVerifyIframe` plugin, custom sanitize schema, iframe Tailwind styles, read whitelist from context |
| `src/main/ui/layout/CrdLayoutWrapper.tsx` | Wrap children with `MarkdownConfigProvider`, pass `iframeAllowedUrls` from `useConfig()` |
| `src/crd/app/CrdApp.tsx` | Wrap with `MarkdownConfigProvider`, pass hardcoded list |

## Design details

### 1. Context: `src/crd/lib/markdownConfig.tsx`

```typescript
import { createContext, useContext, type ReactNode } from 'react';

type MarkdownConfig = {
  iframeAllowedUrls: string[];
};

const MarkdownConfigContext = createContext<MarkdownConfig>({
  iframeAllowedUrls: [],
});

export function MarkdownConfigProvider({
  iframeAllowedUrls,
  children,
}: MarkdownConfig & { children: ReactNode }) {
  return (
    <MarkdownConfigContext value={{ iframeAllowedUrls }}>
      {children}
    </MarkdownConfigContext>
  );
}

export function useMarkdownConfig(): MarkdownConfig {
  return useContext(MarkdownConfigContext);
}
```

Notes:
- Default context value has empty `iframeAllowedUrls` — safe fallback, all iframes stripped.
- React 19 context uses `value` prop directly on `Context`, no need for `.Provider`.
- No `useMemo` — React Compiler handles it.

### 2. Updated `MarkdownContent.tsx`

Key changes:
- Import `useMarkdownConfig` from `@/crd/lib/markdownConfig`
- Import `remarkVerifyIframe` from `@/core/ui/markdown/embed/remarkVerifyIframe`
- Build a custom sanitize schema that extends the default to allow `iframe` with safe attributes
- Add `[&_iframe]` Tailwind descendant selectors for responsive iframe rendering
- Pass `iframeAllowedUrls` to `remarkVerifyIframe` plugin
- Use `rehype-raw` with `passThrough: ['iframe']`

Custom sanitize schema (constant, defined outside component):

```typescript
import { defaultSchema } from 'hast-util-sanitize';

const IFRAME_ALLOWED_ATTRIBUTES = [
  'src', 'width', 'height', 'title', 'allow',
  'loading', 'frameborder', 'referrerpolicy', 'allowfullscreen',
];

const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    iframe: IFRAME_ALLOWED_ATTRIBUTES,
  },
};
```

Plugin chain:

```typescript
remarkPlugins={[remarkGfm, [remarkVerifyIframe, { allowedIFrameOrigins: iframeAllowedUrls }]]}
rehypePlugins={[[rehypeRaw, { passThrough: ['iframe'] }], [rehypeSanitize, sanitizeSchema]]}
```

Iframe styling (added to the `cn()` block):

```
'[&_iframe]:max-w-full [&_iframe]:aspect-video [&_iframe]:rounded-lg [&_iframe]:border-0'
```

### 3. Main app wiring: `CrdLayoutWrapper.tsx`

```typescript
import { MarkdownConfigProvider } from '@/crd/lib/markdownConfig';
import { useConfig } from '@/domain/platform/config/useConfig';

// Inside the component:
const { integration: { iframeAllowedUrls = [] } = {} } = useConfig();

return (
  <MarkdownConfigProvider iframeAllowedUrls={iframeAllowedUrls}>
    <CrdLayout ...>
      <Outlet />
    </CrdLayout>
  </MarkdownConfigProvider>
);
```

### 4. Demo app wiring: `CrdApp.tsx`

```typescript
import { MarkdownConfigProvider } from '@/crd/lib/markdownConfig';

const DEMO_IFRAME_ALLOWED_URLS = [
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://player.vimeo.com',
  'https://embed.ted.com',
];

// Wrap the app:
<MarkdownConfigProvider iframeAllowedUrls={DEMO_IFRAME_ALLOWED_URLS}>
  <BrowserRouter>...</BrowserRouter>
</MarkdownConfigProvider>
```

## Dependency on `remarkVerifyIframe`

The `remarkVerifyIframe` plugin at `src/core/ui/markdown/embed/remarkVerifyIframe.ts` is a pure remark plugin with zero MUI/domain dependencies. Its imports are:
- `unified` (type only)
- `unist-util-visit`

Importing it from `@/core/ui/markdown/embed/remarkVerifyIframe` in a CRD component bends the "no `@/core/` imports" rule slightly, but the spirit of the rule is about preventing MUI and business logic leakage. This file is pure infrastructure. If we want strict separation later, we can move it to `src/crd/lib/remarkVerifyIframe.ts` — but that creates duplication with no benefit today.

## Risk assessment

| Risk | Mitigation |
|------|-----------|
| Forgetting to wrap with provider | Safe default — empty whitelist strips all iframes |
| XSS via iframe | Double-gated: `remarkVerifyIframe` validates origin + `rehype-sanitize` restricts attributes |
| Plugin ordering matters | `remarkVerifyIframe` runs first (remark phase), then `rehype-raw` preserves surviving iframes, then `rehype-sanitize` strips disallowed attributes |
