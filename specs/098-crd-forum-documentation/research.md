# Research — CRD Forum and Documentation Pages

This document captures the technical decisions made during Phase 0 of `/speckit.plan`. The five `/speckit.clarify` clarifications were already resolved during the spec phase (see `spec.md` § Clarifications); this document records the additional Phase-0 decisions about *how* to ship the migration without breaking the rules in `CLAUDE.md`, `src/crd/CLAUDE.md`, and the project Constitution.

## Decision 1: Form-state library inside the Initiate / Update Discussion dialog

**Decision**: Use **Formik** for the discussion form state. The form lives in the integration layer (`src/main/crdPages/topLevelPages/forum/ForumDiscussionFormConnector.tsx`) and is mounted inside the CRD `ForumInitiateDiscussionDialog`'s `children` slot. The CRD dialog itself remains form-state-agnostic.

**Rationale**:

- The legacy MUI `DiscussionForm.tsx` already uses Formik + Yup for the same form (title, category, body, tags). Reusing Formik in the integration layer keeps the validation contract identical and lets us copy the existing yup schema verbatim, which lowers risk on a parity migration.
- `src/crd/CLAUDE.md` § Forbidden imports explicitly bans `formik` *inside `src/crd/`* — but the integration layer (`src/main/crdPages/`) is allowed to use Formik. This is the same pattern used by other CRD migrations that wrap MUI-era Formik forms (see `94-crd-member-settings-dialog` for the precedent of mounting integration-owned content inside a CRD dialog shell via a slot).
- The dialog's body slot keeps the CRD layer pure: the dialog only knows `open`, `onOpenChange`, header text, footer copy, and that *something* renders inside the body. The Formik form is invisible to `src/crd/`.

**Alternatives considered**:

- *Replace Formik with `react-hook-form` or hand-rolled `useState`*: rejected. Adds risk on a parity migration; would require a parallel Yup-equivalent validation layer; offers no functional gain.
- *Migrate the form into `src/crd/` as a stateless form using `value`/`onChange` per field*: rejected. The dialog has 4 fields with cross-field validation (category required, body length, title length); pushing all that state up is non-trivial and would not match the legacy MUI behavior on validation timing.

## Decision 2: Comment thread reuse on the discussion detail page

**Decision**: Reuse `src/crd/components/comment/{CommentThread,CommentInput,CommentItem,CommentReactions}.tsx` and the existing integration hook `src/main/crdPages/space/hooks/useCrdRoomComments.tsx`. The forum-flavored wrapper `DiscussionCommentsConnector.tsx` lives in `src/main/crdPages/topLevelPages/forum/` and passes `roomId = platform.forum.discussion.comments.id` into the existing hook. The hook already handles `usePostMessageMutations`, `useSubscribeOnRoomEvents`, the per-message authorization check for delete, and the `pendingDeleteId` → `ConfirmationDialog` confirmation path.

**Rationale**:

- The platform forum's `Discussion.comments` field is a `Room`, the same GraphQL type used by callouts. The same comment-mutation, subscription, and delete-confirmation contract that works for callout comments works for discussion comments without modification.
- The CRD comment components were designed in the callout-comments-refinement spec (089-crd-comments-refinement) to be room-agnostic. Reusing them is on-pattern.
- The destructive-confirmation rule in `src/crd/CLAUDE.md` § "All Deletions Must Be Confirmed" is already satisfied by the `useCrdRoomComments` hook — no new path needed.

**Alternatives considered**:

- *Build a forum-specific comment thread*: rejected. Duplicates a well-tested component; violates DRY (Constitution Arch 6.f); diverges UX between callout and forum comments for no reason.
- *Inline the comment list inside `ForumDiscussionDetail`*: rejected. Would couple the detail card to the room mutation API and break the presentation/integration separation.

## Decision 3: Iframe height + URL syncing for the Documentation page

**Decision**: Port the existing MUI page's `postMessage` protocol **verbatim** into a single `useDocumentationFrame` hook in the integration layer (`src/main/crdPages/topLevelPages/documentation/useDocumentationFrame.ts`). Same two message types (`PAGE_HEIGHT`, `PAGE_CHANGE`), same origin-prefix check, same sandbox attribute set, same scroll-to-top on `PAGE_CHANGE`, same `replace: true` navigation. The CRD `DocumentationFrame` component is purely presentational and only renders an `<iframe>` element with a forwarded ref so the hook can update the height.

**Rationale**:

- The embedded documentation site is owned by a separate repo (`alkem-io/documentation`) and ships independently; changing the protocol would require a coordinated cross-repo deploy and break currently-deployed iframe content.
- The protocol is small and stable; copy-pasting the existing logic preserves byte-for-byte parity (SC-003: "Documentation page preserves all current iframe behaviours").
- Encapsulating it in one hook (rather than spreading across the page component) keeps the side-effect surface localized, satisfying Constitution Principle IV (State & Side-Effect Isolation).

**Alternatives considered**:

- *Replace `postMessage` with `ResizeObserver` on the iframe document*: rejected. `ResizeObserver` cannot cross document boundaries, so it does not work on cross-origin iframes.
- *Use the iframe's `scrollHeight` polled on an interval*: rejected. The current `postMessage` push is more efficient; switching would degrade performance for no reason.
- *Move the `postMessage` listener into the CRD `DocumentationFrame`*: rejected. That component must remain presentation-only per `src/crd/CLAUDE.md` Golden Rule #2 (no side-effects, no `window.addEventListener`).

## Decision 4: Legacy `/documentation/*` redirect

**Decision**: Reuse the existing `src/main/documentation/RedirectDocumentation.tsx` component as-is in both the MUI and CRD branches of the toggle. It is a pure routing component (uses `useLocation`, `useNavigate` only) with zero MUI imports and zero presentation, so it sits outside the toggle's concern entirely.

**Rationale**:

- The redirect logic (`/documentation/foo` → `/docs/foo`, preserving search; suppressed when nested in another iframe) is non-visual and orthogonal to the design system being used. There is no benefit to duplicating it.
- Sharing the redirect across both branches eliminates a class of drift bugs — if the legacy URL pattern ever changes, only one place needs an update.
- No new file is created for this in the CRD path; `TopLevelRoutes.tsx` simply continues to wire `RedirectDocumentation` to the `/documentation/*` route regardless of the toggle.

**Alternatives considered**:

- *Duplicate `RedirectDocumentation` into the CRD path*: rejected. Adds a maintenance burden; one of the two copies will inevitably drift.
- *Push the redirect into the integration layer's page component*: rejected. The redirect runs on a different URL prefix from the CRD page; mixing them would couple unrelated concerns.

## Decision 5: Translation key reuse rule (codification of an Assumption)

**Decision**: Two-track translations:

1. **CRD-only strings live in new namespaces** `crd-forum` and `crd-documentation` (under `src/crd/i18n/forum/` and `src/crd/i18n/documentation/`), maintained manually / AI-assisted across all six locales (en, nl, es, bg, de, fr) per `src/crd/CLAUDE.md` § i18n. Examples: banner copy, "Initiate Discussion" button label, search placeholder, sort labels, empty-state copy, dialog field labels, accessibility labels for icon buttons, iframe `title` attribute.

2. **Long-standing platform strings already on Crowdin stay where they are** in the default `translation` namespace. Examples: `pages.forum.title`, `pages.forum.subtitle`, `common.enums.discussion-category.*`, `pages.documentation.title`, `pages.documentation.subtitle`, `components.discussion.delete-discussion`, `components.discussion.delete-comment`. The integration layer reads these via a secondary `useTranslation()` call (no namespace argument) and passes the resolved strings down as plain props (typed `string` or `ReactNode`) to CRD components. CRD components never import the default `translation` namespace.

**Rationale**:

- Crowdin owns the `translation` namespace; CRD owns its own namespaces (`src/crd/CLAUDE.md` § "Translation management"). Duplicating Crowdin-managed copy into CRD namespaces would create two sources of truth and force translators to translate the same string twice in different workflows.
- The integration layer is the natural seam: it already adapts GraphQL types into props, and adapting translated strings into props is the same pattern. CRD components stay pure (Golden Rule: no default-namespace imports inside CRD).
- The discussion category enum (`Releases`, `Platform Functionalities`, `Community Building`, `Challenge Centric`, `Help`, `Other`) is exposed to translators via Crowdin and used in many other surfaces; reusing those keys keeps category labels consistent across the app.

**Alternatives considered**:

- *Put every Forum string into `crd-forum` (full duplication)*: rejected. Doubles translator workload; risks drift between MUI and CRD copy; violates the principle of single source of truth for shared strings.
- *Use the default `translation` namespace from inside CRD components for the shared keys only*: rejected. `src/crd/CLAUDE.md` § "Critical rules" forbids importing from the default namespace inside CRD components. Even if relaxed, it would couple CRD design-system components to the application's i18n surface.

## Decision 6: Mobile category navigation (codification of Clarification Q3)

**Decision**: On viewports below the sidebar breakpoint (`md`), `ForumCategoryNav` renders a single full-width `Select` (Radix UI primitive, already in `src/crd/primitives/select.tsx`) above the discussion list, populated from the same `entries` prop as the desktop sidebar. Selecting a value calls `onCategoryChange(slug)` outward, identical to the desktop sidebar.

**Rationale**:

- A `Select` is the most familiar mobile pattern for picking one of N options; takes minimal vertical space; works well with screen readers.
- Keeping the same `entries` prop and the same `onCategoryChange(slug)` callback means the integration layer does not branch by viewport — it just renders `ForumCategoryNav` and the component picks the right rendering internally.
- Matches the spec's Clarification Q3 answer.

**Alternatives considered**:

- *Hide category nav on mobile entirely*: rejected by the user during clarification.
- *Horizontal scrollable icon row*: rejected by the user during clarification.

## Decision 7: Documentation page layout (codification of Clarification Q4)

**Decision**: The CRD Documentation page renders `<DocumentationFrame>` directly inside the CRD shell's main slot. No banner, no header band, no breadcrumb. The browser tab title is set via `usePageTitle(t('pages.documentation.title'))` exactly as the legacy MUI page does — the tab title remains useful even without an in-page banner.

**Rationale**:

- The embedded site already shows its own title; an in-page banner would create duplicate titles.
- Removes vertical chrome; gives the docs more vertical space.
- Matches the spec's Clarification Q4 answer.

## Decision 8: List visual leading edge (codification of Clarification Q1)

**Decision**: The Forum list-row leading visual is the **category icon** (resolved via the existing `DiscussionIcon` mapping in the integration layer's data mapper). The CRD `ForumDiscussionListItem` accepts `iconNode: ReactNode` as a prop. There is no per-discussion `emoji` field on the prop type; the data mapper does not parse the discussion title for emoji.

**Rationale**:

- Mirrors the existing MUI behavior (toggle on/off looks the same on this dimension).
- Avoids any title-parsing heuristic that can guess wrong.
- The `DiscussionIcon` mapping is already a single source of truth used by every consumer of forum data on the platform.
- Matches the spec's Clarification Q1 answer.

## Decision 9: Back-link target on the discussion detail page (codification of Clarification Q5)

**Decision**: The "back to all discussions" link on `ForumDiscussionDetail` uses `backHref` (a plain string prop). The integration layer's data mapper computes `backHref = '/forum/' + categorySlugFor(discussion.category)`, falling back to `/forum` if the category is missing.

**Rationale**:

- The user is most likely browsing within a specific category and wants to return there.
- Computing this in the data mapper (which already has the category enum) keeps the CRD component free of routing logic.
- Matches the spec's Clarification Q5 answer.

## Decision 10: Search/sort state lifecycle (codification of Clarification Q2)

**Decision**: Search and sort live as plain `useState` in `CrdForumPage`. They are not synced to the URL or to session storage. Navigating to a discussion detail and back resets them to defaults (search = "", sort = "newest"). Category remains in the URL slug and is preserved naturally via the URL.

**Rationale**:

- Matches existing MUI behavior — toggle on/off behaves identically on this dimension.
- No URL surface to design; no session-storage state to manage.
- Matches the spec's Clarification Q2 answer.

## Decision 11: Privilege gating placement

**Decision**: Privilege checks (`CreateDiscussion` for the Initiate button, per-discussion `Update`/`Delete` privileges for the edit/trash icons, per-message `Delete` for comment delete) live in the integration layer and are encoded as the *presence* of callbacks on the CRD components. When the integration layer omits a callback (because the viewer lacks privilege), the CRD component hides the corresponding affordance.

**Rationale**:

- Matches the existing CRD migration playbook (e.g. `MemberSettingsDialog` in 094 uses the same pattern: omit callback to hide the section).
- Keeps the CRD component free of authorization logic — it doesn't know what `CreateDiscussion` is or how to check it.
- Avoids passing redundant boolean flags alongside callbacks.

## Decision 12: Innovation Hub ribbon

**Decision**: The Innovation Hub "outside-of-space" ribbon (`useInnovationHubOutsideRibbon`) is preserved on the CRD Forum landing. It is rendered by the integration layer's `CrdForumPage` and passed as a `ribbonNode: ReactNode` slot prop on `ForumLayout`. The CRD `ForumLayout` renders the ribbon above the banner if provided.

**Rationale**:

- The ribbon is a long-standing platform feature for InnovationHubs; users in that context expect it.
- Passing it as a slot keeps the CRD layer free of `useInnovationHubOutsideRibbon` (a domain hook).

## Summary of decisions

| # | Topic | Decision |
|---|---|---|
| 1 | Form library | Formik in integration layer; CRD dialog has body slot |
| 2 | Comment thread | Reuse `src/crd/components/comment/*` + `useCrdRoomComments` |
| 3 | Iframe protocol | Port verbatim into `useDocumentationFrame` hook |
| 4 | Legacy redirect | Reuse `RedirectDocumentation` as-is for both branches |
| 5 | Translation reuse | CRD-only strings in new namespaces; shared platform strings via integration-layer secondary `useTranslation()` and passed down as props |
| 6 | Mobile category nav | Radix `Select` above the list (codifies Clarification Q3) |
| 7 | Documentation layout | No banner; iframe directly under shell (codifies Clarification Q4) |
| 8 | List leading visual | Category icon via existing `DiscussionIcon` (codifies Clarification Q1) |
| 9 | Back-link target | `/forum/<categorySlug>` from discussion's own category (codifies Clarification Q5) |
| 10 | Search/sort state | Component-local; resets on navigation (codifies Clarification Q2) |
| 11 | Privilege gating | Encoded as callback presence; CRD hides affordance when callback is undefined |
| 12 | Innovation Hub ribbon | Preserved as `ribbonNode` slot on `ForumLayout` |
