# `@excalidraw/element` shim

A minimal local stand-in that lets client-web consume
[`@alkemio/excalidraw-yjs-binding`](https://github.com/alkem-io/excalidraw-fork/tree/Yjs/packages/yjs-binding)
without dragging the whole Excalidraw editor into the binding's module graph.

## Why this exists

The binding is published (pkg.pr.new, excalidraw-fork PR #32) with two hard
dependencies on **internal Excalidraw monorepo packages that are not published to
any resolvable registry**:

- `@excalidraw/element@0.18.0`  — the binding imports one runtime value from it,
  `CaptureUpdateAction` (`packages/yjs-binding/src/apply.ts`), plus the
  `BoundElement` _type_ (`schema.ts`).
- `@excalidraw/fractional-indexing@3.3.0` — the binding imports `generateKeyBetween`
  / `generateNKeysBetween`.

`@excalidraw/fractional-indexing` is satisfied by a `pnpm.overrides` redirect to
the API-compatible public `fractional-indexing@3.2.0`.

`@excalidraw/element` is trickier: the only published artifact carrying its code is
the bundled `@alkemio/excalidraw` editor. Aliasing `@excalidraw/element` to that
bundle works for production Vite, but **breaks the Vitest run** — the editor bundle
transitively `import`s `open-color/open-color.json`, which Vitest's ESM loader
rejects ("needs an import attribute of `type: json`"). Since the binding needs only
the tiny `CaptureUpdateAction` enum, this shim provides it verbatim instead.

## Wiring (in the repo root `package.json`)

```jsonc
"pnpm": {
  "overrides": {
    "@excalidraw/element@0.18.0": "file:./vendor/excalidraw-element-shim",
    "@excalidraw/fractional-indexing@3.3.0": "npm:fractional-indexing@3.2.0"
  }
}
```

`@excalidraw/excalidraw/types` (type-only, referenced by the binding's `.d.ts`) is
mapped in `tsconfig.json` `paths` to `@alkemio/excalidraw`'s published type
declarations.

## Keeping it in sync

`CaptureUpdateAction` mirrors excalidraw-fork `packages/element/src/store.ts`. It is
a stable 3-member enum (`IMMEDIATELY` / `NEVER` / `EVENTUALLY`); if upstream changes
it, update `index.js` + `index.d.ts`.

## Removing it (follow-up)

When `@alkemio/excalidraw-yjs-binding` is republished to import its element symbols
from the published `@alkemio/excalidraw` peer (rather than the internal
`@excalidraw/*` workspace packages), this shim, both overrides, and the
`tsconfig.json` `paths` entry can all be deleted.
