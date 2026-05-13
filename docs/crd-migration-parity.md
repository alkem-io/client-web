# CRD ↔ MUI Migration Parity Map

A table-of-truth for the in-flight MUI → CRD design system migration. Each row maps a MUI page-shell or major dialog to its CRD twin and notes which React context providers must be mounted for the CRD version to match MUI's behavior.

**Read this before opening a CRD migration PR.** It's the source data for the automated parity test (`src/main/crdPages/__tests__/shellParity.test.ts`) and the page-shell provider map (`docs/page-shell-provider-map.md`).

## Why this exists

The classic CRD-migration bug: an MUI shell mounts an ambient provider (e.g. `StorageConfigContextProvider`) that downstream components depend on; the CRD twin forgets to mount it; downstream components silently degrade or throw at runtime.

Two countermeasures:

1. **This document** — manual register of pairs, refreshed when migration PRs land.
2. **`shellParity.test.ts`** — CI-enforced static AST diff that fails if the CRD shell drops a provider its MUI twin had.

## Shell parity

| Concept | MUI file | CRD file | Status | Required providers | Known gaps |
|---|---|---|---|---|---|
| Space page shell | `src/domain/space/layout/SpacePageLayout.tsx` | `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` | ✅ migrated | `StorageConfigContextProvider locationType="space"` | — |
| Space about page | `src/domain/space/about/SpaceAboutPage.tsx` | `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` | ✅ migrated | `StorageConfigContextProvider locationType="space"` | — |
| Forum page shell | `src/domain/communication/discussion/pages/ForumPage.tsx` | `src/main/crdPages/topLevelPages/forum/ForumShell.tsx` | ✅ migrated | `StorageConfigContextProvider locationType="platform"` | — |
| Discussion page | `src/domain/communication/discussion/pages/DiscussionPage.tsx` | ❓ TBD | ⏳ pending | `StorageConfigContextProvider locationType="platform"` | — |
| Memo dialog | `src/domain/collaboration/memo/MemoDialog/MemoDialog.tsx` | `src/main/crdPages/memo/CrdMemoDialog.tsx` | ✅ migrated | Inherits ambient (no self-mount) | MUI variant self-mounts `locationType="callout"` with calloutId; CRD relies on ambient `locationType="space"` — bucket targeting differs |
| Post contribution dialog | `src/domain/collaboration/calloutContributions/post/CalloutContributionDialogPost.tsx` | `src/main/crdPages/post/CrdPostContributionDialog.tsx` | ✅ migrated | Inherits ambient | MUI variant self-mounts `locationType="post"` with postId; CRD inherits ambient |
| Callout edit dialog | `src/domain/collaboration/callout/CalloutDialogs/EditCalloutDialog.tsx` | `src/main/crdPages/space/callout/CalloutFormConnector.tsx` (edit mode) | ✅ migrated | Inherits ambient | MUI self-mounts; CRD inherits |
| Callout create dialog | `src/domain/collaboration/callout/CalloutDialogs/CreateCalloutDialog.tsx` | `src/main/crdPages/space/callout/CalloutFormConnector.tsx` (create mode) | ✅ migrated | Inherits ambient | — |
| Calendar dialog | `src/domain/timeline/calendar/CalendarDialog.tsx` | ❓ TBD | ⏳ pending | `StorageConfigContextProvider locationType="space"` | — |
| VC profile page | `src/domain/community/virtualContributor/vcProfilePage/VCProfilePage.tsx` | ❓ TBD | ⏳ pending | `StorageConfigContextProvider locationType="virtualContributor"` | — |
| Organization page | `src/domain/platformAdmin/components/Organization/OrganizationPage.tsx` | ❓ TBD | ⏳ pending | `StorageConfigContextProvider locationType="organization"` | — |
| User admin profile | `src/domain/community/userAdmin/tabs/UserAdminProfilePage.tsx` | ❓ TBD | ⏳ pending | `StorageConfigContextProvider locationType="user"` | — |
| Create space | `src/domain/space/components/CreateSpace/createSpace/CreateSpace.tsx` | ❓ TBD | ⏳ pending | `StorageConfigContextProvider locationType="account"` | — |

Legend: ✅ migrated · ⏳ pending CRD twin · ❓ CRD path unknown · ⚠️ known regression

## Bucket-targeting trade-off

The MUI dialogs (memo / post / callout edit) all self-mount a `StorageConfigContextProvider` scoped to their own entity (callout / post / etc.) so image uploads land in the right bucket. The current CRD twins rely on the ambient space-shell provider, so uploads land in the space bucket regardless of which dialog opens them. This is functionally fine (server enforces auth, files don't leak across users) but differs from MUI behavior.

If a future change requires precise bucket targeting (e.g., cleanup policies that differ by location type), wrap individual CRD dialogs with a tighter provider, mirroring MUI. See `useMarkdownEditorIntegration` for the hook that consumes the ambient context.

## Adding a new row

When you migrate a new MUI shell or dialog to CRD:

1. Identify the MUI file and grep for `*Provider` JSX it mounts.
2. Add a row to the table above with the matching CRD file path.
3. If the MUI variant mounts providers your CRD variant doesn't (or vice versa), document the gap in the "Known gaps" column.
4. Add the pair to `SHELL_PAIRS` in `src/main/crdPages/__tests__/shellParity.test.ts`. Use the `allowMissingInCrd` field if a known gap is intentional.
5. Add an entry to `docs/page-shell-provider-map.md` for the new CRD shell.

## See also

- `docs/page-shell-provider-map.md` — what ambient context is available at each CRD shell level.
- `docs/agent-efficiency-grep-for-facts.md` — investigation discipline that prevents the "I forgot to grep for the provider mount" class of bug.
- `CLAUDE.md` § Investigation — terse rule, also linked from the agent grep-for-facts doc.
