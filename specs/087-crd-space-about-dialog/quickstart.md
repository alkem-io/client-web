# Quickstart — CRD Space About Dialog

This document gets a developer up and running on `087-crd-space-about-dialog` and provides the manual test matrix derived from the spec's acceptance scenarios.

---

## 1. Setup

```bash
# From repo root
git checkout 087-crd-space-about-dialog
pnpm install                       # if dependencies have changed
pnpm start                         # dev server on http://localhost:3001
```

Backend must be running locally at `http://localhost:3000` (Traefik) for GraphQL queries to succeed.

## 2. Enable the CRD design system

In the browser console on `http://localhost:3001`:

```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

Or use the in-app Admin UI: **Administration → Platform Settings → Design System → CRD (New Design)**.

To revert to MUI:

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

## 3. Where to edit

| Concern | File |
|---|---|
| Dialog chrome | `src/crd/components/space/SpaceAboutDialog.tsx` |
| About content + section icons + edit pencils + dual host position | `src/crd/components/space/SpaceAboutView.tsx` |
| Apply/join button state machine | `src/crd/components/space/SpaceAboutApplyButton.tsx` |
| Community guidelines block + nested "Read more" dialog | `src/crd/components/space/CommunityGuidelinesBlock.tsx` |
| Apply form dialog | `src/crd/components/community/ApplicationFormDialog.tsx` |
| Application submitted confirmation | `src/crd/components/community/ApplicationSubmittedDialog.tsx` |
| Parent application prompt | `src/crd/components/community/PreApplicationDialog.tsx` |
| Parent join prompt | `src/crd/components/community/PreJoinParentDialog.tsx` |
| Invitation acceptance | `src/crd/components/dashboard/InvitationDetailDialog.tsx` *(reused, no edits)* |
| English translations (CRD) | `src/crd/i18n/space/space.en.json` |
| Other locale translations | `src/crd/i18n/space/space.{nl,es,bg,de,fr}.json` |
| Integration / wiring | `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` |
| Apply form connector (GraphQL + mutation) | `src/main/crdPages/space/about/ApplyDialogConnector.tsx` |
| Invitation detail connector (GraphQL + mutation) | `src/main/crdPages/space/about/InvitationDetailConnector.tsx` |

## 4. Reused domain hooks (do not modify)

| Hook | Path |
|---|---|
| `useApplicationButton` | `src/domain/access/ApplicationsAndInvitations/useApplicationButton.ts` |
| `useDirectMessageDialog` | `src/domain/communication/messaging/DirectMessaging/useDirectMessageDialog.tsx` |
| `useCommunityGuidelinesQuery` | `src/core/apollo/generated/apollo-hooks.ts` |
| `useApplicationDialogQuery` | `src/core/apollo/generated/apollo-hooks.ts` |
| `useApplyForEntryRoleOnRoleSetMutation` | `src/core/apollo/generated/apollo-hooks.ts` |
| `useInvitationActions` | `src/domain/community/invitations/useInvitationActions.ts` |
| `useInvitationHydrator` | `src/domain/community/pendingMembership/PendingMemberships.ts` |
| `useBackWithDefaultUrl` | `src/core/routing/useBackToPath.ts` |
| `useSpace` | `src/domain/space/context/useSpace.ts` |
| `useCurrentUserContext` | `src/domain/community/userCurrent/useCurrentUserContext.ts` |
| `useNavigate` | `src/core/routing/useNavigate.ts` |
| Helpers | `isApplicationPending`, `getMessageType`, `pickColorFromId`, `buildSettingsUrl`, `buildLoginUrl`, `buildSignUpUrl` |

## 5. CRD primitives reference

```ts
// Source: src/crd/primitives/
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/crd/primitives/dialog';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/crd/primitives/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Separator } from '@/crd/primitives/separator';

// CRD common
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { LoadingSpinner } from '@/crd/components/common/LoadingSpinner';
import { cn } from '@/crd/lib/utils';

// Icons (lucide)
import { X, Pencil, Flag, Users, Shield, ExternalLink, Lock, MapPin, Plus, User, Loader2 } from 'lucide-react';
```

---

## 6. Manual test matrix

Test at `http://localhost:3001/<spaceUrlName>/about` after toggling CRD on. Each row maps to acceptance scenarios in [spec.md](./spec.md).

### View (User Story 1 — P1)

| Scenario | Setup | Expected |
|---|---|---|
| Full data | Space with all fields populated | All sections render in order: title, tagline, description, location, metrics, leads/host, why, who, guidelines, references |
| Time-to-interactive | Cold-load `/<space>/about` with CRD toggle on, DevTools Performance panel open | Dialog opens and primary call-to-action is interactive within 1 second of route navigation on a typical broadband connection (mirrors SC-003) |
| Sparse data | Space missing why / who / references | Missing sections omitted; no empty placeholders |
| Close — X | Click X | Dialog closes; navigates to previous page |
| Close — Esc | Press Esc | Dialog closes; navigates to previous page |
| Close — backdrop | Click outside dialog | Dialog closes; navigates to previous page |
| Direct URL — has read | Open `/spaceX/about` directly | Closing navigates to space home |
| Direct URL — no read | Open `/spaceX/about` directly while not a member of a private space | Lock icon visible; closing steps history back two entries; falls back to platform Home if no history |
| Long content | Description >> viewport height | Body scrolls inside dialog; sticky header stays put |
| Mobile (≤360 px) | Resize viewport | Content scrolls; close button stays accessible; no overlap |

### Apply / Join states (User Story 2 — P1)

| State | Trigger | Expected |
|---|---|---|
| Member | Authenticated member | No apply button visible |
| `canJoinCommunity` | Authenticated, can join | "Join" button → opens CRD `ApplicationFormDialog` in `mode='join'` (no questions, single confirm) |
| `canJoinCommunity` confirm | Click confirm in join dialog | Join mutation fires; dialog closes; user lands on space |
| `canApplyToCommunity` | Authenticated, must apply | "Apply" button → opens CRD `ApplicationFormDialog` in `mode='apply'` |
| Submit valid apply | Fill required fields and submit | `applyForEntryRoleOnRoleSet` fires; on success → `ApplicationSubmittedDialog` opens |
| Submit invalid apply | Try to submit with required missing | Submit button stays disabled; per-field error appears after first submit attempt or after blur |
| Mutation failure (apply / join) | Backend returns error | Error toast appears; flow dialog stays open; user can retry |
| Application pending | User has pending app | "Application pending" disabled |
| `canAcceptInvitation` | User has pending invitation | "Accept invitation" → opens CRD `InvitationDetailDialog` |
| Accept invitation | Click Accept | Invitation accepted; dialog closes; user navigates to space |
| Reject invitation | Click Reject | Invitation rejected; About dialog state updates |
| Subspace + parent not joined | Authenticated viewing subspace whose parent user hasn't joined | "Join" or "Apply" → opens `PreJoinParentDialog` / `PreApplicationDialog` with link to parent |
| Unauthenticated | Logged out | "Sign in to apply" + helper text; click → navigates to `buildLoginUrl(...)` |

### Lock icon (User Story 1 / FR-006)

| Scenario | Trigger | Expected |
|---|---|---|
| No read privilege | View private space without membership | Lock icon visible next to title |
| Tooltip | Hover or focus the lock icon | Tooltip shows explanatory text + "Learn how to apply" link |
| Programmatic apply trigger | Click "Learn how to apply" inside tooltip | Apply button is programmatically clicked → opens appropriate flow surface |

### Edit affordances (User Story 4 — P2)

| Scenario | Trigger | Expected |
|---|---|---|
| Privileged user | `permissions.canUpdate === true` | Pencil icons next to Description, Why, Who, References, Guidelines |
| Non-privileged user | `permissions.canUpdate === false` | No pencil icons |
| Description pencil | Click | Navigates to `buildSettingsUrl(profileUrl) + '/about#description'` |
| Why pencil | Click | Navigates to `.../about#why` |
| Who pencil | Click | Navigates to `.../about#who` |
| References pencil | Click | Navigates to `.../about` |
| Guidelines pencil | Click | Navigates to `.../community` |

### Host & leads (User Story 3 — P2)

| Scenario | Setup | Expected |
|---|---|---|
| Has leads | Space has at least one lead user or organization | Leads render in dedicated leads area; host renders **after references** with "Contact host" link attached |
| No leads | Space has no leads | Host renders **in place of leads** with "Contact host" link attached |
| Contact host — authenticated | Click "Contact host" while signed in | MUI `DirectMessageDialog` opens with host pre-addressed |
| Contact host — unauthenticated | Click "Contact host" while signed out | Navigates to `buildSignUpUrl(...)` with current path preserved |
| Contact host — submit message | Send a message via the dialog | Message dispatched; success toast |
| Contact host — failure | Backend errors | Error toast; dialog remains open |

### Community Guidelines (User Story 5 — P3)

| Scenario | Setup | Expected |
|---|---|---|
| Has guidelines | `description` non-empty | Truncated preview + "Read more" button |
| Read more | Click "Read more" | Nested dialog opens with full description + references |
| Esc on inner dialog | Press Esc | Only inner dialog closes; outer About dialog stays at same scroll |
| No guidelines, edit privilege | `description` empty + `canEdit` | "Admins only" caption + edit pencil shown |
| No guidelines, no edit | `description` empty + `!canEdit` | Section omitted entirely |
| Loading guidelines | Initial load | Brief loading state; no flash of empty content |

### Level-aware section titles (FR-018, FR-024)

| Scenario | Setup | Expected |
|---|---|---|
| L0 space | `space.level === 'L0'` | Why / Who titles use `t('context.L0.why.title')` / `t('context.L0.who.title')` |
| L1/L2 navigation while CRD on | Navigate to `/<space>/challenges/<sub>/about` | Legacy MUI subspace dialog renders (CRD About is L0-exclusive) |

### i18n (FR-019, SC-007)

For each of `en`, `nl`, `es`, `bg`, `de`, `fr`:

1. Switch language via the layout language selector.
2. Open the About dialog.
3. Verify all section labels, button labels, helper text render in the chosen language (English values acceptable as placeholders for now).

### Permission downgrade / upgrade mid-session (Edge case)

| Scenario | Setup | Expected |
|---|---|---|
| Granted in another tab | Member promoted in tab B; tab A has dialog open | Next user interaction in tab A reflects updated state via natural Apollo cache refresh |
| Revoked by admin | Role removed by admin | Next user interaction surfaces lock state without manual reload |

### Regression — MUI fallback (FR-002, FR-023, SC-002)

```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

Open `/<space>/about`:

- Legacy MUI `SpaceAboutDialog` renders unchanged.
- All MUI behaviors work identically to before this branch.

Then re-enable and confirm CRD renders.

---

## 7. Static checks

```bash
pnpm lint                                     # TypeScript + Biome + ESLint
pnpm vitest run                               # Full test suite
pnpm vitest run src/crd/components/space      # Targeted (if you add tests)
```

CRD MUI-cleanliness audit:

```bash
# Should print nothing
grep -rn "@mui\|@emotion" \
  src/crd/components/space/SpaceAbout* \
  src/crd/components/space/CommunityGuidelinesBlock.tsx \
  src/crd/components/community/
```

Integration-layer MUI-cleanliness audit (only the reused `directMessageDialog` is permitted):

```bash
# Acceptable matches: zero, OR only references via the useDirectMessageDialog hook
grep -rn "@mui\|@emotion" src/main/crdPages/space/about/
```

Hardcoded-string audit:

```bash
# Should print nothing other than imports / type names
grep -rn "TODO\|FIXME" \
  src/crd/components/space/SpaceAboutDialog.tsx \
  src/crd/components/space/SpaceAboutView.tsx \
  src/crd/components/space/SpaceAboutApplyButton.tsx \
  src/crd/components/space/CommunityGuidelinesBlock.tsx \
  src/crd/components/community/
```

## 8. Accessibility checklist (FR-020 / FR-021 / SC-006)

Test with keyboard only and a screen reader (VoiceOver / NVDA):

- [ ] Tab order proceeds: lock icon → close → join button → contact host → edit pencils → guidelines "Read more" → references → host card.
- [ ] Esc closes the dialog (and only the innermost when a nested dialog is open).
- [ ] Focus visibly rings every interactive element.
- [ ] Lock icon is keyboard-focusable; tooltip opens on focus + Enter.
- [ ] Screen reader announces dialog title via `DialogTitle` and tagline via `DialogDescription`.
- [ ] All section headings render as semantic `<h2>`.
- [ ] Apply form: each textarea has a persistent `<label>`; required fields announce as required; errors announce via `role="alert"`.
- [ ] All icon-only buttons have explicit `aria-label`.
- [ ] Decorative icons have `aria-hidden="true"`.

## 9. Definition of Done

- [ ] All 11 verification scenarios in spec pass.
- [ ] Static checks all green (`pnpm lint`, `pnpm vitest run`).
- [ ] CRD MUI-cleanliness audit returns empty.
- [ ] Integration-layer MUI-cleanliness audit shows only `useDirectMessageDialog` reference (no direct MUI imports).
- [ ] All 6 locale files updated with new keys.
- [ ] Manual test matrix executed for at least one happy-path and one failure-path of each user story.
- [ ] Accessibility checklist passed.
- [ ] PR description includes constitution-check reference and Complexity Tracking justification.
