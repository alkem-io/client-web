# Data Model: CRD Virtual Contributors Migration

**Feature**: `106-crd-virtual-contributors` | **Date**: 2026-06-09

**No backend or GraphQL schema changes.** This is a presentation-layer migration: existing generated hooks supply data; **mappers** convert GraphQL types into the plain-TypeScript prop shapes below (the only place GraphQL types meet CRD props). The one possible additive `.graphql` change is the comment-author `type`/`isVirtualContributor` field for the VC badge (D6) — flagged, not assumed.

The authoritative TypeScript interfaces live in `contracts/`. This file describes the entities, their CRD-facing shapes, validation/derivation rules, and state transitions.

---

## 1. Domain entities (read-only context — unchanged on the server)

### VirtualContributor
The central entity. Relevant fields already consumed by the live CRD layer:
- `id`, `profile { id, displayName, tagline, description, url, avatar, references[], tagsets[] }`
- `authorization.myPrivileges[]` — drives all edit/refresh/admin gating (`Update`, `Create`, `Delete`)
- `aiPersona { id, prompt[], externalConfig, promptGraph, bodyOfKnowledgeLastUpdated, engine }`
- `knowledgeBase { id, profile, calloutsSet { id }, authorization }`
- `searchVisibility`, `listedInStore`, `settings.privacy.knowledgeBaseContentVisible`
- `platformSettings.promptGraphEditingEnabled`
- `bodyOfKnowledgeType` (`alkemioSpace | alkemioKnowledgeBase | external`), `provider` (host org/user)

### AI Persona configuration
- `prompt: string` (stored as single-element array `prompt[0]`)
- `externalConfig: { apiKey?, assistantId?, model }` (apiKey never echoed back)
- `promptGraph: { nodes: PromptGraphNode[], edges: { from, to }[] }`
- `engine` ∈ {Alkemio, Expert, Guidance, LibraFlow, OpenaiAssistant, GenericOpenai}

### Body of Knowledge / Knowledge Base
- A `calloutsSet` of callouts (posts/links) with restrictions (`virtualContributorsCalloutRestrictions.ts`)
- `bodyOfKnowledgeLastUpdated` timestamp; refresh triggers re-ingestion

### Community membership / invitation
- Available VCs split into **account-owned** (`getAvailable`) and **library** (`getAvailableInLibrary`)
- Add = `onAdd(id)` (direct); Invite = `inviteContributors({ welcomeMessage, invitedContributorIds })`

### VC in-app notification
- Types: `VirtualAdminSpaceCommunityInvitation`, `SpaceAdminVirtualCommunityInvitationDeclined`
- Rendered generically via `notificationDataMapper` → `CrdNotificationItemData`

---

## 2. CRD prop shapes (new — plain TypeScript, no GraphQL types)

### 2.1 Creation Wizard (US1) — see `contracts/creationWizard.ts`

**Step machine** (reused from legacy): `initial | loadingStep | addKnowledge | existingKnowledge | externalProvider | chooseCommunity | tryVcInfo`.

- `VcCreationWizardValues` — `{ name, tagline, description, engine, bodyOfKnowledgeType, externalConfig?, avatar?, posts: VcWizardPost[], documents: VcWizardDocument[], selectedSpaceId?, selectedCommunitySpaceId? }`
- `VcWizardPost` — `{ title: string; description: string }` (1–25; title 3–`SMALL_TEXT_LENGTH`, description markdown)
- `VcWizardDocument` — `{ name: string; url: string }` (0+; name 3–`SMALL_TEXT_LENGTH`, url required)
- `VCCreationWizardViewProps` — `{ step, values, onChange, onSelectPath, onNext, onBack, onCancel, onSubmit, loading, creating, availableSpaces, availableCommunities, createdVc?, errorsByField, … }`

**Validation rules** (reuse legacy Formik/Yup): name required (3–`SMALL_TEXT_LENGTH`); at least one post for the written-knowledge path; `apiKey` required for external; `assistantId` required when `engine === OpenaiAssistant`.

### 2.2 Knowledge Base page (US2) — see `contracts/knowledgeBase.ts`

- `VcKnowledgeBaseViewProps` — `{ loading, noAccess, displayName, avatarUrl?, avatarColor, description?, canEditDescription?, onSaveDescription?: (next: string) => Promise<boolean>, descriptionMaxLength?, descriptionUpload?: MarkdownUploadProps, refresh: VcKnowledgeBaseRefresh, canAddCallout?, onAddCallout?, calloutsSlot: ReactNode, isEmpty }`
- `VcKnowledgeBaseRefresh` — `{ canRefresh: boolean; lastUpdatedValue?: string; onRefresh: () => void; refreshing: boolean }` (`lastUpdatedValue` is pre-formatted by the integration layer)
- **Description is markdown.** Rendered read-only (`MarkdownContent`) for viewers; for users with KB Create privilege it is edited **in place** — a pencil reveals the CRD `MarkdownEditor` (Save/Cancel; `descriptionMaxLength = LONG_MARKDOWN_TEXT_LENGTH`; image upload via `descriptionUpload`). Saved through the existing `updateVirtualContributor` mutation as `knowledgeBaseData.profile.description`. Reusable component: `src/crd/components/common/InlineEditMarkdown.tsx`.

### 2.3 Prompt Graph card (US4) — see `contracts/promptGraph.ts`

- `VcPromptGraphNode` — `{ name; system: boolean; inputVariables?: string[]; availableInputVariables?: string[]; prompt?: string (markdown); outputProperties: VcPromptGraphProperty[] }`. `inputVariables` is the in-use subset; `availableInputVariables` is every variable available to the node (base START vars + all upstream nodes' output properties), computed in the mapper.
- `VcPromptGraphProperty` — `{ name; type: string; optional: boolean; description: string }`
- `VcPromptGraphCardProps` — `{ nodes, onChangeNodePrompt, onChangeNodeProperties, onSave, onReset, dirty, status, editingEnabled, onToggleEditingEnabled?, canTogglePlatformSetting, toggleSaving?, labels }`
- **Rendering**: START and END are rendered as fixed read-only **bookends** framing the node accordion (they are dropped from the editable node list and preserved verbatim on save). The prompt is edited with the CRD `MarkdownEditor`. The "Input variables" section lists **all** `availableInputVariables`; those referenced in the prompt (recomputed live from the prompt text) are highlighted **green**.
- **Transitions**: per-node edits set `dirty`; Save → `status: saving → saved → idle` (1800 ms flash, mirroring existing cards); Reset → clears graph (`promptGraph: null`) then re-initialises. System nodes are read-only.

### 2.4 Add-VC preview (US3) — see `contracts/addVcToCommunity.ts`

- `VcPreviewData` — `{ id, displayName, avatarUrl?, tags: string[], description, host?: { id, displayName, avatarUrl?, href } }`
- `VirtualContributorPreviewProps` — `{ data?: VcPreviewData; loading: boolean; onBack: () => void; onAction: () => void; actionLabel: string }`
- Extend `VirtualContributorInviteDialogProps` (existing) with optional `previewSlot?: ReactNode` + `onPreview?(id)` so selection can route through preview before add/invite.

### 2.5 VC badge (US5) — see `contracts/vcBadge.ts`

- `VirtualContributorBadgeProps` — `{ label?: string; size?: 'sm' | 'md'; className?: string }` (label defaults to localized "Virtual Contributor"; term stays English per glossary).

---

## 3. State machines

### 3.1 Per-section save status (reused convention)
`idle → saving → (saved | error) → idle`. `saved` flashes for `SAVED_FLASH_MS = 1800`. Applies to the prompt-graph card and the KB description, matching `useVcProfileTabData` / `useVcSettingsTabData`.

### 3.2 Wizard progression (reused)
`initial` → path branch (`addKnowledge` | `existingKnowledge` | `externalProvider`) → `loadingStep` (during create) → `chooseCommunity` → `tryVcInfo`. Cancel from any step opens `VCWizardCancelDialog`; confirm discards in-memory values and navigates away (no partial VC persisted — FR/edge: mid-flow cancellation).

---

## 4. Authorization derivations (parity — FR-009/FR-010)

| Surface | Gate |
|---|---|
| Edit VC profile/settings, KB description, refresh BoK | `authorization.myPrivileges` includes `Update` (KB description/refresh may use `Create` on the KB) — reuse `useCanEditVcSettings` / KB privileges query |
| Prompt-graph editing | `platformSettings.promptGraphEditingEnabled` AND `Update` privilege |
| Toggle `promptGraphEditingEnabled` | platform-admin only (existing platform-settings mutation) |
| Add/invite VC to community | community admin privilege on the role set (existing `useCommunityAdmin`) |

Unauthorized users never see the controls (FR-009; SC-004).

---

## 5. i18n keys (additive)

Namespace `crd-contributorSettings` (existing): add `wizard.*`, `knowledgeBase.*`, `promptGraph.*` across **all six languages** (en, es, nl, bg, de, fr) per CRD manual-translation rules. VC-badge + add-VC strings extend `crd-community` / `crd-common`. Keep "Virtual Contributor" in English per the glossary. No Crowdin (CRD namespaces are hand-maintained).

---

## 6. Explicitly NOT modeled here (out of scope)

- Platform-admin VC conversion/transfer (excluded — `/admin/*` not toggle-gated).
- In-community VC **display** block (handled by the space-page migration).
- The already-migrated public profile, the three settings tabs, and the four already-live settings cards (visibility, BoK, prompt, external config).
