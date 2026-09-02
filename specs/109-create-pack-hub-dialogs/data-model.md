# Data Model: CRD Create Innovation Pack & Innovation Hub Dialogs (strict MUI parity)

No backend entities or schema changes. This defines the **form value/error shapes**, the **validation rules** (strict MUI parity, per Clarifications 2026-06-15), and the **mutation inputs** (from existing generated types).

## Form values & errors

### Innovation Pack (`src/crd/components/innovationPack/types.ts` — values unchanged)

```ts
type CreateInnovationPackValues = { name: string; description: string };
type CreateInnovationPackErrors = Partial<Record<keyof CreateInnovationPackValues, string>>;
```

| Field | Required | Validation (client, yup-on-submit) | Notes |
|---|---|---|---|
| `name` | **Yes** | trim, **min 3**, **max 128** (`SMALL_TEXT_LENGTH`), not blank/spaces-only | → `profileData.displayName`; reuse the shared `displayName` yup rule |
| `description` | **Yes** | non-empty, **max 8000** (`MARKDOWN_TEXT_LENGTH`) | **markdown editor**; → `profileData.description` |

### Innovation Hub (`src/crd/components/innovationHub/createInnovationHub.types.ts` — NEW)

```ts
type CreateInnovationHubValues = {
  subdomain: string;
  name: string;
  tagline: string;
  description: string;
};
type CreateInnovationHubErrors = Partial<Record<keyof CreateInnovationHubValues, string>>;
```

| Field | Required | Validation (client, yup-on-submit) | Notes |
|---|---|---|---|
| `subdomain` | **Yes** | **`^[a-z0-9-]*$`**, **min 3**, **max 25** | uniqueness server-enforced on submit |
| `name` | **Yes** | trim, **min 3**, **max 128** (`SMALL_TEXT_LENGTH`), not blank | → `profileData.displayName`; same shared rule as pack |
| `tagline` | No | **max 512** (`MID_TEXT_LENGTH`), enforced | → `profileData.tagline` |
| `description` | **Yes** | non-empty, **max 8000** (`MARKDOWN_TEXT_LENGTH`) | **markdown editor**; → `profileData.description` |

Validation lives in the connector (yup schema mirroring `useCreateSpace`/`useCreateSubspace`, codes mapped via `t('validation.*')`); the CRD component only renders `errors` and disables Create while invalid (research R4–R7). Constants from `@/core/ui/forms/field-length.constants`.

## Mutation inputs (existing generated types — no codegen)

### Pack — `CreateInnovationPackOnAccountInput`

```ts
packData: {
  accountID: string,
  profileData: { displayName: values.name, description: values.description },
}
```
`useCreateInnovationPackMutation`, `refetchQueries: ['AccountInformation','AdminInnovationPacksList','InnovationLibrary']`. The hook's signature is **unchanged** (still returns `{ id, url }` for the legacy MUI caller); the CRD connector **ignores `url` and does not navigate** (research R3 / finding I1).

### Hub — `CreateInnovationHubOnAccountInput`

```ts
hubData: {
  accountID: string,
  subdomain: values.subdomain,
  profileData: { displayName: values.name, tagline: values.tagline, description: values.description },
  type: InnovationHubType.List,   // fixed (FR-006)
  spaceListFilter: [],            // empty (FR-006)
}
```
`useCreateInnovationHubMutation`, `refetchQueries: ['AdminInnovationHubsList','AccountInformation']`.

### Markdown image upload (both)

`useMarkdownEditorIntegration({ temporaryLocation: true })` → `uploadFileOnStorageBucket` into the account bucket from the ambient `StorageConfigContextProvider`. Temporary-location uploads are server-cleaned if the form is abandoned.

## State transitions

```
idle ──(account-tab Create, entitlement OK)──▶ open/editing
editing ──(invalid on submit)──▶ Create blocked, field errors shown (validation.*)
editing ──(valid + Create)──▶ submitting (useTransition; aria-busy; no double-submit; close blocked)
submitting ──(success)──▶ closed → refetch listings → success toast   (NO navigation)
submitting ──(server error e.g. duplicate subdomain)──▶ open/editing (error shown, input preserved)
editing ──(Esc/X/outside-click, dirty)──▶ DiscardChangesDialog → discard ⇒ closed, input dropped
editing ──(Cancel / clean close)──▶ closed (no resource created)
```

Entitlement gating is **upstream** of `open`: lacking the resource entitlement opens the no-entitlement "contact us" dialog instead, and the create dialog never opens (research R10).

## Key relationships

- **Account** (user or org) owns the created **Innovation Pack** / **Innovation Hub** via `accountID` (the only owner linkage sent).
- **Entitlement** (`AccountInnovationPack` / `AccountInnovationHub`) gates creation; evaluated on the account tab, not in the dialog.
- Created resource appears in the refreshed account list; the user reaches its settings page from there (no auto-redirect).
