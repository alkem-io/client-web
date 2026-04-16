# Iframe Whitelist Context for CRD MarkdownContent

## Problem

The CRD `MarkdownContent` component (`src/crd/components/common/MarkdownContent.tsx`) currently strips all iframes via `rehype-sanitize`'s default schema. Callout descriptions can contain embedded iframes (YouTube, Vimeo, etc.) that the server has already validated against a whitelist of allowed origins.

The old MUI renderer (`WrapperMarkdown.tsx`) supports iframes by:
1. Calling `useConfig()` to get `integration.iframeAllowedUrls` from the server
2. Passing that list to the `remarkVerifyIframe` remark plugin
3. Using `rehype-raw` with `passThrough: ['iframe']` to preserve iframe nodes

The CRD layer **cannot** call `useConfig()` — that hook imports from `@/domain/platform/config/`, which violates the CRD golden rule: no business logic, no domain imports. We need a way to deliver the whitelist into `MarkdownContent` without breaking the CRD boundary.

## Solution

Introduce a **`MarkdownConfigProvider`** React context that lives inside `src/crd/` and carries the iframe whitelist. The context is purely a data container — no fetching, no domain logic.

### Data flow

```
┌─────────────────────────────────────────────────┐
│ Main App (src/main/)                            │
│                                                 │
│  useConfig() → iframeAllowedUrls                │
│       │                                         │
│       ▼                                         │
│  <MarkdownConfigProvider                        │
│     iframeAllowedUrls={iframeAllowedUrls}       │
│  >                                              │
│    <Outlet />  (CRD pages)                      │
│  </MarkdownConfigProvider>                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ Demo App (src/crd/app/)                         │
│                                                 │
│  <MarkdownConfigProvider                        │
│     iframeAllowedUrls={[                        │
│       'https://www.youtube.com',                │
│       'https://player.vimeo.com',               │
│       ...                                       │
│     ]}                                          │
│  >                                              │
│    <CrdApp />                                   │
│  </MarkdownConfigProvider>                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ CRD Layer (src/crd/)                            │
│                                                 │
│  MarkdownContent                                │
│    │                                            │
│    ├─ useMarkdownConfig()                       │
│    │    → { iframeAllowedUrls: string[] }       │
│    │                                            │
│    ├─ remarkVerifyIframe (reused from core)      │
│    │    validates iframe src against whitelist   │
│    │                                            │
│    └─ rehype-sanitize (custom schema)           │
│         allows iframe tag + safe attributes     │
└─────────────────────────────────────────────────┘
```

### Key decisions

1. **Context lives in `src/crd/lib/`** — it's a simple context + hook, similar to `cn()`. No domain knowledge.

2. **`remarkVerifyIframe` is reused, not copied** — the existing plugin at `src/core/ui/markdown/embed/remarkVerifyIframe.ts` has no MUI or domain dependencies (only `unified` and `unist-util-visit`). CRD can import it from `@/core/ui/markdown/embed/remarkVerifyIframe` since it's pure infrastructure. If we later want full independence, we can move it to `src/crd/lib/` — but that's a future concern.

3. **Custom sanitize schema** — extend the default `rehype-sanitize` schema to allow `iframe` tags with a strict attribute whitelist: `src`, `width`, `height`, `title`, `allow`, `loading`, `frameborder`, `referrerpolicy`, `allowfullscreen`. This matches `UnifiedConverter.ts`.

4. **Graceful fallback** — if no `MarkdownConfigProvider` wraps the tree, `useMarkdownConfig()` returns `{ iframeAllowedUrls: [] }`, which means all iframes are stripped. Safe by default.

5. **Iframe styling** — iframes get responsive Tailwind classes: `max-w-full aspect-video rounded-lg` via descendant selectors on the `MarkdownContent` wrapper div.

## Scope

### In scope
- `MarkdownConfigProvider` context + `useMarkdownConfig` hook
- Update `MarkdownContent` to use `remarkVerifyIframe` + custom sanitize schema
- Wire the provider in `CrdLayoutWrapper` (main app) reading from `useConfig()`
- Wire the provider in `src/crd/app/CrdApp.tsx` (demo app) with a hardcoded list
- Tailwind styling for rendered iframes

### Out of scope
- Changing the old `WrapperMarkdown` renderer
- Modifying the `remarkVerifyIframe` plugin itself
- Adding new iframe origins to the server config
- Iframe editing in the Tiptap editor (already works independently)
