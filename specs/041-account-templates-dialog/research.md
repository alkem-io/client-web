# Research: Account Templates in Template Picker Dialog

**Date**: 2026-04-03 | **Branch**: `041-account-templates-dialog`

## R1: How does the existing template picker dialog work?

**Decision**: Extend `ImportTemplatesDialog` with a third section for account templates, following the existing two-section pattern.

**Rationale**: The dialog (`src/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog.tsx`) already manages two template sources — Space templates (eager) and Platform templates (lazy). Each section uses `ImportTemplatesDialogGallery` with optional `children` for section headers. Adding a third section follows the established pattern without architectural changes.

**Key findings**:
- `ImportTemplatesDialog` renders sections conditionally based on boolean flags
- `ImportTemplatesDialogGallery` is a reusable gallery component that accepts `templates`, `loading`, and `children` (header) props
- Space templates load eagerly when the dialog opens; Platform templates load lazily behind a link click
- Auto-load effect: if Space templates are empty, Platform templates load automatically
- Template data uses `AnyTemplateWithInnovationPack` type: `{ template: AnyTemplate; innovationPack?: TemplateInnovationPack }`
- 9+ invocation points across the app (Space creation, Post, Whiteboard, Callout, Innovation Flow, Admin)

**Alternatives considered**:
- Creating a separate dialog for account templates — rejected because all template selection should happen in one place
- Using a tab-based UI instead of sections — rejected because it changes the existing UX pattern and hides templates behind extra clicks

## R2: How to obtain the account context for fetching templates?

**Decision**: Accept `accountId` as an optional prop on `ImportTemplatesDialog`; callers obtain it from `useCurrentUserContext()` or pass it explicitly.

**Rationale**: The `useCurrentUserContext()` hook (from `src/domain/community/userCurrent/useCurrentUserContext.ts`) already provides `accountId: string | undefined` from the authenticated user. However, the dialog itself should not call `useCurrentUserContext()` directly — it should receive `accountId` as a prop to maintain testability and allow callers to specify which account's templates to show (e.g., Space creation passes the destination account).

**Key findings**:
- `CurrentUserProvider` (`src/domain/community/userCurrent/CurrentUserProvider/CurrentUserProvider.tsx`) queries `me.user.account.id` and exposes it via context
- Space creation (`src/domain/space/components/CreateSpace/createSpace/CreateSpace.tsx`) resolves account: `accountId ?? currentUserAccountId`
- `CurrentUserModel` includes `accountId`, `accountPrivileges`, and `accountEntitlements`
- Account context is always available for authenticated users

**Alternatives considered**:
- Calling `useCurrentUserContext()` inside the dialog — rejected because the dialog is a domain component that should receive data via props; the account might differ from the current user's account in some contexts
- Deriving account from the Space context — rejected because Space creation doesn't have a Space yet, and the dialog is used in both Space and non-Space contexts

## R3: What GraphQL query structure is needed for account templates?

**Decision**: Create a new query `ImportTemplateDialogAccountTemplates` that fetches templates from all innovation packs within an account, mirroring the Platform templates query structure.

**Rationale**: The existing schema supports `lookup.account(ID: $accountId).innovationPacks[].templatesSet.templates`. The query must traverse account -> innovation packs -> templates sets -> templates, then flatten into a single list. The query shape mirrors `ImportTemplateDialogPlatformTemplates` to produce the same `AnyTemplateWithInnovationPack` output type.

**Key findings**:
- `Account.innovationPacks: Array<InnovationPack>` — direct field, no pagination
- `InnovationPack.templatesSet: TemplatesSet` — each pack has one templates set
- `TemplatesSet.templates: Array<Template>` — all templates in the set (can also use typed fields like `spaceTemplates`, `postTemplates`)
- Existing queries fetch counts only (`AccountInformation`, `AccountResourcesInfo`); no existing query fetches full template content from account
- The Platform templates query returns `{ template, innovationPack }` pairs — the account query should do the same for consistency
- `TemplateProfileInfo` fragment provides the needed display data (id, displayName, description, tags, visual, url, type)

**Alternatives considered**:
- Using `templatesSet.spaceTemplates` / `postTemplates` typed fields — rejected because the dialog filters by `templateType` client-side (the existing pattern), and using `templates` with the `TemplateProfileInfo` fragment is consistent with the Space templates query
- Fetching all account innovation packs in one query with all template types, then filtering client-side — this IS the chosen approach, matching how Space templates work
- Creating a dedicated server-side query for "account templates by type" — rejected as it requires backend changes; client-side filtering from the existing schema is sufficient

## R4: Section ordering and eager vs. lazy loading

**Decision**: Account templates load eagerly. Section order is context-dependent:
- **Space creation** (no Space templates): Account templates (1st), Platform templates (2nd/lazy)
- **Within a Space** (Post, Callout, etc.): Space templates (1st/eager), Account templates (2nd/eager), Platform templates (3rd/lazy)

**Rationale**: Per spec FR-008, account templates must load eagerly (same as Space templates). The ordering ensures the most relevant templates appear first — Space templates are curated for the specific space, account templates are the facilitator's own templates, and Platform templates are the broadest collection.

**Key findings**:
- The `canUseSpaceTemplates` boolean (line 69) already distinguishes "within a Space" vs "Space creation" context
- When `canUseSpaceTemplates` is false (Space creation), Space templates section is hidden entirely
- Platform templates have a lazy-load link that is shown when `canUseSpaceTemplates && enablePlatformTemplates && !loadPlatformTemplates`
- The auto-load effect currently triggers Platform templates when Space templates are empty
- Account templates should participate in the auto-load decision: if both Space and Account templates are empty, auto-load Platform templates

**Alternatives considered**:
- Making account templates lazy (behind a link like Platform templates) — rejected per spec FR-008
- Always showing Account templates first regardless of context — rejected per user clarification: within a Space, Space templates come first because they're curated for that specific space

## R5: How to handle the `selectedTemplate` search across all sections?

**Decision**: Extend the `selectedTemplate` lookup to include account templates in the search array.

**Rationale**: The current code (line 133-137) searches `[...templates, ...platformTemplates]` for `selectedTemplateId`. Account templates must be added to this search so a previously selected account template renders correctly at the top of the dialog.

**Key findings**:
- Current: `[...(templates || []), ...(platformTemplates || [])].find(...)`
- New: `[...(templates || []), ...(accountTemplates || []), ...(platformTemplates || [])].find(...)`

**Alternatives considered**: None — this is a straightforward extension.

## R6: Impact on existing callers of ImportTemplatesDialog

**Decision**: Add `accountId?: string` to `ImportTemplatesOptions`. Existing callers that don't pass `accountId` simply won't show the account templates section (graceful degradation).

**Rationale**: The `ImportTemplatesOptions` interface (line 27-40 of ImportTemplatesDialog.tsx) is the shared options type used by all callers. Adding an optional `accountId` field means no existing caller breaks. Callers that want account templates pass the account ID; others continue working unchanged.

**Key findings**:
- `ImportTemplatesOptions` is used by: `ImportTemplatesDialogProps`, `CreateCalloutDialog`, `SpaceAdminTemplatesPage`, `InnovationFlowSettingsDialog`, `SetDefaultTemplateDialog`, `SpaceTemplateSelector`, `PostTemplateSelector`, `WhiteboardTemplateSelector`, `WhiteboardDialogTemplatesLibrary`
- Most callers have access to account context via `useCurrentUserContext()` or parent props
- `SpaceAdminTemplatesPage` uses `disableSpaceTemplates: true` and `enablePlatformTemplates: true` — it may or may not need account templates

**Alternatives considered**:
- Auto-detecting account ID inside the dialog via `useCurrentUserContext()` — rejected per R2 rationale (testability, flexibility)
- Adding a boolean `enableAccountTemplates` flag — rejected because `accountId` presence already serves as the enable flag (if `accountId` is provided and non-empty, show account templates)
