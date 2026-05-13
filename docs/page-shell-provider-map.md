# CRD Page-Shell Provider Map

Single lookup for the question: *"My new CRD dialog/page consumes an ambient context — is it already mounted at the shell I'll render under?"*

If yes, just consume it. If no, mount it inside your component or push it up to the appropriate shell.

## Why this exists

CRD shells are page-level layouts that wrap their `<Outlet />` (route children) with ambient React context providers. Components rendered under the shell can consume these providers without re-mounting. The classic failure mode: a sibling shell forgets to mount a provider its peers have, downstream components silently degrade (when an optional-variant hook is used) or throw at runtime (when a strict hook is used).

This map prevents drift by making the contract explicit.

## CRD shells and what they provide

### `CrdSpacePageLayout`
`src/main/crdPages/space/layout/CrdSpacePageLayout.tsx`

Mounted under: `/spaces/:spaceNameId/*`

| Provider | Scope | Notes |
|---|---|---|
| `StorageConfigContextProvider` | `locationType="space"`, `spaceId={spaceId}` | Image uploads from any descendant land in the space bucket |

### `CrdSpaceAboutPage`
`src/main/crdPages/space/about/CrdSpaceAboutPage.tsx`

Mounted under: `/spaces/:spaceNameId/about`

| Provider | Scope | Notes |
|---|---|---|
| `StorageConfigContextProvider` | `locationType="space"`, `spaceId={space.id}` | Same shape as space layout — about page is sometimes routed outside the main shell |

### `ForumShell`
`src/main/crdPages/topLevelPages/forum/ForumShell.tsx`

Mounted under: `/forum/*`

| Provider | Scope | Notes |
|---|---|---|
| `StorageConfigContextProvider` | `locationType="platform"` | Forum content uploads to the global platform bucket — no space scope |

## What's NOT mounted at the shell level (yet)

These providers exist in the MUI tree but have no CRD shell-level equivalent yet. If your component depends on them, mount them yourself or wait for the migration to land.

- `InnovationFlowStateContextProvider` — MUI mounts at `SpacePageLayout`; CRD does not. Innovation-flow-aware CRD components currently fetch their own data.
- `CharacterCountContextProvider` — MUI mounts inside specific dialogs (e.g. `MemoDialog`); not a shell-level provider in either tree.
- `CalloutDetailsContext` / `WhiteboardContext` — domain-specific, scoped to specific routes; mount inside the dialog/page that needs them.

## Decision tree

```
Does my CRD component need an ambient context?
├── No → don't worry about this doc
└── Yes
    ├── Is it in the table above for the shell I'm under?
    │   └── Yes → just consume it via the strict hook
    └── No
        ├── Is it shell-wide (every page under this shell needs it)?
        │   └── Yes → push the provider up to the shell, update this doc + crd-migration-parity.md
        └── No (only this dialog/page needs it)
            └── Mount it inside your component, don't pollute the shell
```

## See also

- `docs/crd-migration-parity.md` — MUI ↔ CRD pair table with status and gaps.
- `src/main/crdPages/__tests__/shellParity.test.ts` — automated drift detection.
- The strict-hook lesson: defensive `useOptionalXxx` variants hide missing providers. Prefer strict hooks + verified shell coverage.
