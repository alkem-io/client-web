# Contract: Glossary-Compliance Validation Test

This is the test contract for the strict CI gate (spec F3). It defines the invariant, inputs,
outputs, and failure semantics for the Vitest that enforces the glossary across CRD translations.
It extends the existing `*.parity.test.ts` convention in `src/crd/i18n/`.

---

## Invariant (the contract)

> For every CRD feature namespace, for every leaf key, for every brand token `T` in the configured
> set: **if the English (`en`) value contains `T`** (matched on word boundaries; case-insensitive
> for `template`/`templates`), **then every target-language value for that same key MUST also
> contain `T`.**

Corollary guarantees:
- The English source is authoritative; the test never invents expectations the source didn't set.
- Callout→Post is enforced transitively (English already stores "Post"/"Posts").
- The test presupposes key parity (en keys exist in every target); parity tests run alongside.

---

## Inputs

| Input | Source |
|-------|--------|
| Brand token set | `src/crd/i18n/glossary.json` (derived) or inlined config in the test (see data-model.md "Brand-Token Set") |
| English source values | `<feature>.en.json` per namespace |
| Target values | `<feature>.{nl,es,bg,de,fr}.json` per namespace |
| Allowlist (optional) | `namespace:keyPath:token` entries, each with a justification comment |

## Outputs / Failure semantics

- **Pass:** no violations → test green → CI gate open.
- **Fail:** one assertion failure per `(lang, namespace)` pair, listing each offending
  `keyPath`, the `token` expected, the English value, and the offending target value. Example:

  ```text
  Glossary violations in es / spaceSettings:
    - tabs.layout            [Layout]   en="Layout"     es="Diseño"
    - templates.pageHeader.title [templates] en="Templates" es="Plantillas"
  ```

- Failures must be **actionable**: print enough to locate and fix the key without guessing.

## Matching rules

| Token kind | Rule |
|------------|------|
| Brand nouns (Space, Spaces, Subspace, Subspaces, Post, Posts, Layout, Virtual Contributor[s]) | Case-sensitive; word-boundary match. |
| `template`, `templates` | Case-insensitive (lowercase mid-sentence, capitalized standalone). |
| Ordering | Evaluate longest token first (so "Virtual Contributors" wins over "Virtual Contributor", "Subspaces" over "Subspace", "Spaces" over "Space"). A key satisfying the longer token need not also be checked for the shorter substring it contains. |
| Word boundary | Avoid substring traps: "Space" must not match "Spacer"; "template" must not match "templated". Use `\b` / Unicode-aware boundaries; for compounds like "Space-pagina" the boundary still matches "Space". |

## Allowlist mechanism

A keyed exception map for the rare case where a natural translation legitimately omits a brand word
the English source used:

```ts
// key: `${namespace}:${keyPath}:${token}` — every entry MUST carry a reason comment
const ALLOWLIST = new Set<string>([
  // 'space:sidebar.foo:Space', // reason: NL phrasing reorders sentence, term carried by adjacent key
]);
```

Expected to be empty or near-empty. Treat a growing allowlist as a smell to revisit.

## Reference implementation sketch

Mirrors `src/crd/i18n/space/space.parity.test.ts` (recursive leaf collection), one shared test
iterating all namespaces:

```ts
import { describe, expect, it } from 'vitest';
// import all <feature>.<lang>.json, grouped by namespace

type Json = { [k: string]: Json | string };

const collectLeaves = (obj: Json, prefix = ''): Array<[string, string]> => {
  const out: Array<[string, string]> = [];
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out.push([path, v]);
    else out.push(...collectLeaves(v, path));
  }
  return out;
};

const TOKENS = [/* longest-first, from data-model.md */];

const valueHasToken = (value: string, token: string, ci: boolean) => {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}])${escaped}([^\\p{L}]|$)`, ci ? 'iu' : 'u').test(value);
};

describe('crd i18n glossary compliance', () => {
  // for each namespace × each target lang: for each [keyPath, enValue],
  //   for each token where enValue has token → expect target value also has token
  //   (unless allowlisted)
});
```

## Where it lives

`src/crd/i18n/__glossary__/glossaryCompliance.test.ts` (single shared test), or one
`<feature>.glossary.test.ts` per namespace following the local `*.parity.test.ts` pattern. Single
shared test preferred — one place to maintain the token set and allowlist. Runs in `pnpm vitest run`.
