# Quickstart: CRD Create Innovation Pack & Innovation Hub Dialogs (strict MUI parity)

## What you're building

Two CRD-native creation dialogs at **strict MUI parity** — required **markdown** description, name **3–128**, **no post-create navigation** — wired into both account tabs, removing the MUI dialogs there.

- **Pack** — **modify** the existing CRD dialog (plain textarea → markdown editor + required-description + name validation), add a connector. **Leave `useCreateInnovationPack` unchanged** (the legacy MUI `ContributorAccountView` still consumes it); the connector just ignores `url` and doesn't navigate.
- **Hub** — **build** the dialog + connector + hook + validation schema, mirroring Create Subspace.

Both adopt the **`CrdCreateSpaceDialog` connector pattern**: storage context + Suspense + markdown integration + yup-on-submit validation + discard guard.

## Prereqs

```bash
pnpm install
# No codegen: createInnovationPack / createInnovationHub / uploadFileOnStorageBucket already generated.
localStorage.setItem('alkemio-design-version','2'); location.reload();  # render CRD account tabs
```

## Reference implementations (clone these)

| Pattern | Reference |
|---|---|
| Connector: storage context + Suspense + markdown integration | `src/main/crdPages/topLevelPages/createSpace/CrdCreateSpaceDialog.tsx` |
| Hook: mutation + refetch + yup-on-submit validation + `validation.*` mapping | `src/main/crdPages/topLevelPages/spaceSettings/subspaces/useCreateSubspace.ts`, `.../createSpace/useCreateSpace.ts` |
| Markdown editor wiring | `useMarkdownEditorIntegration({ temporaryLocation: true })` → `MarkdownUploadProps` |
| Discard guard | `useDialogCloseGuard` (see `CreateSubspaceDialog.tsx`) |
| Length constants | `SMALL_TEXT_LENGTH` (128), `MID_TEXT_LENGTH` (512), `MARKDOWN_TEXT_LENGTH` (8000) from `@/core/ui/forms/field-length.constants` |
| Pack-create wiring (legacy ref) | `src/domain/community/contributor/Account/ContributorAccountView.tsx` (drop its navigation) |
| MUI hub variables to match | `src/domain/innovationHub/CreateInnovationHub/CreateInnovationHubDialog.tsx` |

## Key files

| Concern | Path | State |
|---|---|---|
| Pack dialog (CRD) | `src/crd/components/innovationPack/CreateInnovationPackDialog.tsx` | **modify** (markdown + errors) |
| Pack types | `src/crd/components/innovationPack/types.ts` | modify props (`MarkdownUploadProps`) |
| Pack connector | `src/main/crdPages/innovationPack/CrdCreateInnovationPackDialog.tsx` | **new** |
| Pack hook | `src/main/crdPages/innovationPack/useCreateInnovationPack.ts` | **unchanged** (legacy MUI caller depends on it; connector ignores `url`) |
| Hub dialog (CRD) | `src/crd/components/innovationHub/CreateInnovationHubDialog.tsx` | **new** |
| Hub types | `src/crd/components/innovationHub/createInnovationHub.types.ts` | **new** |
| Hub connector | `src/main/crdPages/innovationHub/CrdCreateInnovationHubDialog.tsx` | **new** |
| Hub hook | `src/main/crdPages/innovationHub/useCreateInnovationHub.ts` | **new** |
| Hub validation schema | `src/main/crdPages/innovationHub/createInnovationHubSchema.ts` | **new** |
| Entry points | `CrdUserAccountTab.tsx`, `CrdOrgAccountTab.tsx` | **edit both** |
| Pack i18n | `src/crd/i18n/templates/templates.<lang>.json` (`createPack.*` + `validation.*`) | verify/extend ×6 |
| Hub i18n | `src/crd/i18n/innovationHub/innovationHub.<lang>.json` (`createHub.*` + `validation.*`) | **add ×6** |

## Build order

1. **Pack dialog** — swap `<Textarea>` for the CRD `MarkdownEditor`, accept `MarkdownUploadProps`, render `errors.name` (3–128) + `errors.description` (required); keep sticky header/footer.
2. **Pack hook** — leave unchanged (signature kept for the legacy MUI caller); the connector's `onCreated` ignores `url` and does not navigate.
3. **Pack connector** — `CrdCreateInnovationPackDialog`: storage context + Suspense + markdown integration + yup validation (clone subspace) + discard guard + close/refetch/toast.
4. **Hub types + schema + dialog + hook** — clone the pack/subspace shapes; four fields; `type: List` + empty `spaceListFilter`.
5. **Hub connector** — mirror the pack connector.
6. **i18n** — `createPack.*` (+ markdown/validation labels) parity ×6; add `createHub.*` (+ validation) ×6.
7. **Wire both account tabs** — replace the two MUI mounts with `<CrdCreateInnovationPackDialog>` / `<CrdCreateInnovationHubDialog>`; remove the `@/domain/...` imports; keep `tryCreate(...)` gates.
8. **Standalone preview** — add entries for both dialogs (mock `MarkdownUploadProps`).

## Verify

```bash
pnpm lint
pnpm vitest run src/main/crdPages/innovationHub --reporter=basic   # hub hook + schema tests
pnpm vitest run
pnpm crd:dev   # open both dialogs at :5200
```

Manual (design version `2`):
1. User tab → Create Innovation Pack → name + markdown description → Create → **no navigation**; pack listed; success toast; no MUI dialog.
2. Validation: name < 3 chars → blocked; empty description → blocked; over-length → blocked.
3. User tab → Create Innovation Hub → bad subdomain (uppercase/spaces) → format error; valid subdomain + name + description → Create → hub listed, no navigation.
4. Repeat both on an **organization** account tab → owned by the org account.
5. No-entitlement account → "contact us" dialog; create dialog does **not** open.
6. Duplicate subdomain → server error toast; dialog stays open, input preserved.
7. Type content, press Esc → discard-changes prompt.
8. 768px-tall viewport → header + Create/Cancel reachable; body (incl. markdown editor) scrolls.

## Definition of done

- Both MUI imports gone from both account tabs; `src/main/crdPages/**` has no `@mui/*` from these entry points (SC-006).
- Strict parity: required markdown description, name 3–128 via the shared validator, subdomain format, no navigation, `type: List` + empty filter.
- `createPack.*` + `createHub.*` (+ `validation.*`) present in all six languages with key parity.
- `pnpm lint` + `pnpm vitest run` green. MUI dialogs untouched, still available for legacy surfaces.
