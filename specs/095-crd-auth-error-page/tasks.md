# Tasks: CRD — Unauthorized / Forbidden Error Page

**Input**: Design documents from `/specs/095-crd-auth-error-page/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/forbidden-page-props.md, quickstart.md

**Tests**: Three Vitest unit tests (T011, T015, T020) cover the non-trivial routing logic per Constitution Principle V ("Tests covering non-trivial logic ... mandatory evidence in the PR description") and Engineering Workflow #4 ("Missing evidence blocks merge"). The CRD presentational component itself is purely declarative — no automated test is added for it (T009 has zero branching). Manual QA tasks (T016, T021, T024) reference scenarios in `quickstart.md`. The full Vitest suite is re-run during Polish (T025) to catch regressions.

**Organization**: Tasks are grouped by user story so each can be implemented and verified independently. Foundational work (the predicate, the layout refactor, the i18n keys, and the auth-agnostic CRD page itself) is shared by both stories and lands first.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story label (US1, US2) — only on user-story-phase tasks

## Path Conventions

This is a single-project React 19 SPA. All paths are repo-relative (rooted at the repository top — i.e., the directory containing `package.json`, `CLAUDE.md`, and `specs/`). Per the repository's `**/*.md` documentation guideline, spec documents reference files relative to the repo root so they remain portable across worktrees and contributors. The constitution hierarchy applies as usual: `CLAUDE.md` (project) > `src/crd/CLAUDE.md` (design-system layer) > this spec.

- Presentational layer: `src/crd/components/error/`
- Integration layer: `src/main/crdPages/error/`
- CRD i18n: `src/crd/i18n/error/`
- i18n namespace registry: `src/core/i18n/config.ts`
- Layout shell: `src/main/ui/layout/CrdLayoutWrapper.tsx`
- Boundary consumer: `src/root.tsx`
- Routing toggle: `src/main/routing/TopLevelRoutes.tsx`

**Risks & mitigations**: (a) hooks-rule violations when `usePageTitle` runs in branches that fall through to the MUI fallback — mitigated by extracting the CRD branch into its own component so its hooks only run when that branch renders; (b) leaking MUI/Apollo imports into `src/crd/` — mitigated by the explicit forbidden-imports list in `contracts/forbidden-page-props.md` §1; (c) parity drift for the `/restricted` Sentry breadcrumb — mitigated by mirroring `src/core/routing/Restricted.tsx`'s `logInfo` call verbatim and by the toggle-off regression check in Phase 5.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the working environment is ready. No new dependencies, no codegen.

- [X] T001 Confirm `pnpm install` is current and `pnpm lint` + `pnpm vitest run` pass on the freshly checked-out `095-crd-auth-error-page` branch — establishes a clean baseline before any changes land.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Land the layout-children refactor, the route predicate, the CRD presentational page, and the i18n keys. Both user stories depend on all of these existing first.

**⚠️ CRITICAL**: No user-story implementation work should land before Phase 2 tasks complete; otherwise integration code will reference non-existent translation keys, the predicate, or the modified `CrdLayoutWrapper` signature.

### Translations (parallel — six independent files)

The English values mirror the existing MUI strings verbatim per FR-025. For nl, es, bg the existing MUI translations are reused (sourced from `src/core/i18n/<lang>/translation.<lang>.json`'s `pages.unauthorized.header` / `pages.unauthorized.subheader`). For de and fr, MUI today still has the English fallback in source — provide proper translations for CRD per the CRD i18n process (the Crowdin pipeline does not touch CRD).

| Lang | `forbidden.title` | `forbidden.description` | `forbidden.actions.goHome` | `forbidden.actions.goBack` |
|------|-------------------|-------------------------|----------------------------|----------------------------|
| en   | `"Access Restricted"` | `"The page you're trying to access is not available for you."` | `"Go to Home"` | `"Go back"` |
| nl   | `"Beperkte toegang"` | `"De pagina die je probeert te openen, is niet beschikbaar voor jou."` | `"Naar startpagina"` | `"Terug"` |
| es   | `"Acceso restringido"` | `"La página a la que intentas acceder no está disponible para ti."` | `"Ir al inicio"` | `"Atrás"` |
| bg   | `"Достъпът е ограничен"` | `"Страницата, до която се опитвате да получите достъп, не е достъпна за вас."` | `"Към началото"` | `"Назад"` |
| de   | `"Zugriff eingeschränkt"` | `"Die Seite, die Sie aufrufen möchten, ist für Sie nicht verfügbar."` | `"Zur Startseite"` | `"Zurück"` |
| fr   | `"Accès restreint"` | `"La page à laquelle vous essayez d'accéder n'est pas disponible pour vous."` | `"Aller à l'accueil"` | `"Retour"` |

The JSON shape for every language file is identical:

```jsonc
{
  "forbidden": {
    "title": "<value from table>",
    "description": "<value from table>",
    "actions": {
      "goHome": "<value from table>",
      "goBack": "<value from table>"
    }
  }
}
```

- [X] T002 [P] Create `src/crd/i18n/error/error.en.json` with the four `forbidden.*` keys and English values from the table above.
- [X] T003 [P] Create `src/crd/i18n/error/error.nl.json` with the four `forbidden.*` keys and Dutch values from the table above.
- [X] T004 [P] Create `src/crd/i18n/error/error.es.json` with the four `forbidden.*` keys and Spanish values from the table above.
- [X] T005 [P] Create `src/crd/i18n/error/error.bg.json` with the four `forbidden.*` keys and Bulgarian values from the table above.
- [X] T006 [P] Create `src/crd/i18n/error/error.de.json` with the four `forbidden.*` keys and German values from the table above.
- [X] T007 [P] Create `src/crd/i18n/error/error.fr.json` with the four `forbidden.*` keys and French values from the table above.

### Namespace registration

- [X] T008 Register the new `crd-error` namespace in `src/core/i18n/config.ts`. Add a top-level entry to the namespaces map (next to `crd-dashboard`, `crd-search`, etc.) with six lazy imports:
  ```ts
  'crd-error': {
    en: () => import('@/crd/i18n/error/error.en.json'),
    es: () => import('@/crd/i18n/error/error.es.json'),
    nl: () => import('@/crd/i18n/error/error.nl.json'),
    bg: () => import('@/crd/i18n/error/error.bg.json'),
    de: () => import('@/crd/i18n/error/error.de.json'),
    fr: () => import('@/crd/i18n/error/error.fr.json'),
  },
  ```
  Do NOT change any other entry. Depends on T002–T007 (the JSON files must exist before the imports resolve).

### CRD presentational component

- [X] T009 Create `src/crd/components/error/CrdForbiddenPage.tsx` per the contract in `contracts/forbidden-page-props.md` §1. Named export `CrdForbiddenPage` with prop type `CrdForbiddenPageProps`. Render: a `lucide-react` `ShieldAlert` icon (`aria-hidden="true"`) at the top, an `<h1>` containing `title`, a paragraph containing `description`, a primary `Button` from `@/crd/primitives/button` (`autoFocus`, `type="button"`, `onClick={onGoHome}`, label `goHomeLabel`), and (if `showGoBack` is true and `onGoBack` is defined) a secondary `Button` (`type="button"`, `variant="secondary"` or equivalent CRD secondary variant, `onClick={onGoBack}`, label `goBackLabel`). Layout: a centered single-card column using Tailwind tokens — match the visual treatment of other CRD empty / error states. **Forbidden imports**: nothing from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, or `formik`. Allowed imports: `@/crd/primitives/*`, `@/crd/lib/utils` (`cn`), `lucide-react`, and React itself. **Do NOT call `useTranslation`** — all strings come from props.

### Layout shell — additive `children` prop refactor

- [X] T010 Modify `src/main/ui/layout/CrdLayoutWrapper.tsx` to accept an optional `children?: ReactNode` prop on both the inner content function and the exported `CrdLayoutWrapper`. Inside the inner content body, replace the bare `<Outlet />` with `{children ?? <Outlet />}`. Update the function signature to `function CrdLayoutWrapper({ children }: { children?: ReactNode })` and forward `children` through `BreadcrumbsProvider` to the inner content function. Add `import type { ReactNode } from 'react';` if not already imported. Do NOT change any of the hook calls, prop computations, or the surrounding `MarkdownConfigProvider` / `CrdSearchOverlay` / `CrdPendingMembershipsDialog` block. All current call sites in `TopLevelRoutes.tsx` pass no `children` and continue to render `<Outlet />` — this is a non-breaking additive change.

### Predicate + unit test

- [X] T011 [P] Create `src/main/crdPages/error/isCrdRoute.ts` per the contract in `contracts/forbidden-page-props.md` §4. Named export `isCrdRoute(pathname: string): boolean`. Implementation: (a) strip query string and hash from `pathname` (split on `?` and `#`, keep the part before each); (b) strip a single trailing slash if present; (c) return `false` for `''` and `'/'`; (d) return `true` for `/home`, `/spaces`, `/restricted`; (e) return `true` if `pathname` starts with `/public/whiteboard/`; (f) extract the first path segment (`pathname.split('/')[1]`); if it is non-empty and NOT included in `reservedTopLevelRoutePaths` from `@/main/routing/TopLevelRoutePath`, return `true` (Space tree); (g) otherwise return `false`. Use plain string operations only — do not import `path-to-regexp`, `react-router`, or any other matcher library.
- [X] T012 [P] Create `src/main/crdPages/error/isCrdRoute.test.ts` (Vitest). Cover at minimum: empty string → `false`; `/` → `false`; `/home` → `true`; `/home/` → `true`; `/spaces` → `true`; `/spaces?foo=bar` → `true`; `/restricted` → `true`; `/restricted?origin=/somewhere` → `true`; `/public/whiteboard/abc123` → `true`; `/admin` → `false`; `/admin/users` → `false`; `/innovation-library` → `false`; `/user/me` → `false`; `/forum` → `false`; `/welcome-space` → `true` (Space tree); `/welcome-space/challenges/foo` → `true` (Space tree, nested); `/welcome-space?tab=overview` → `true` (Space tree with query); `/landing` → `false` (reserved); `/identity` → `false` (reserved). Use `describe` / `it` (or `test`) per Vitest convention.
- [X] T012a [P] Create `src/main/crdPages/error/hasInAppHistory.ts` — a thin wrapper around `window.history.length` so consumer code does not access the browser API directly (Constitution IV: "Any direct DOM manipulation or browser API usage requires justification and wrappers to preserve testability"). Named export `hasInAppHistory(): boolean` whose body is exactly `return typeof window !== 'undefined' && window.history.length > 1;`. Add a sibling test file `hasInAppHistory.test.ts` covering: (a) when `window.history.length === 1` → returns `false`; (b) when `window.history.length === 2` → returns `true`; (c) when `window` is undefined (mock via `vi.stubGlobal('window', undefined)`) → returns `false`. The helper has no other call sites; its sole consumers are `CrdAwareErrorComponent` (T013) and `CrdRestrictedRoute` (T017), which import and call it instead of touching `window.history` directly. T015 (T013's test) and T019 (T017's test) mock this module via `vi.mock('@/main/crdPages/error/hasInAppHistory')` rather than mocking `window.history`.

**Checkpoint**: All six i18n files exist and are registered; `CrdForbiddenPage` renders standalone with mock props; `CrdLayoutWrapper` accepts `children`; `isCrdRoute` returns the correct boolean for every tested pathname. The integration layer can now consume these in Phase 3 and 4.

---

## Phase 3: User Story 1 — Authenticated user hits a forbidden CRD page (Priority: P1) 🎯 MVP

**Goal**: When the boundary catches `NotAuthorizedError` for an authenticated user on a CRD route (with the toggle on), the CRD forbidden page is rendered inside `CrdLayoutWrapper` instead of the MUI `Error403` inside `TopLevelLayout`. Recovery actions: "Go to Home" (primary) and "Go back" (secondary, hidden when no in-app history).

**Independent Test**: With CRD toggle on, sign in as a user with no access to a known-private Space, navigate directly to that Space's URL. Verify the CRD forbidden page is shown inside CRD chrome (not MUI `TopLevelLayout`), with primary "Go to Home" and secondary "Go back" buttons. See `quickstart.md` Stories 1 and 1b.

### Implementation for User Story 1

- [X] T013 [US1] Create `src/main/crdPages/error/CrdAwareErrorComponent.tsx` per the contract in `contracts/forbidden-page-props.md` §2. Named export `CrdAwareErrorComponent`. Inside the function: (a) call `const { t } = useTranslation('crd-error');`; (b) call `const navigate = useNavigate();` from `@/core/routing/useNavigate`; (c) call `const crdEnabled = useCrdEnabled();` from `@/main/crdPages/useCrdEnabled`; (d) compute `const isCrd = isCrdRoute(props.pathname ?? '');` from `@/main/crdPages/error/isCrdRoute`; (e) compute `const showGoBack = hasInAppHistory();` from `@/main/crdPages/error/hasInAppHistory`; (f) call `usePageTitle(t('forbidden.title'));` from `@/core/routing/usePageTitle` (this fires unconditionally — `usePageTitle` only updates the tab title when its argument changes); (g) if `crdEnabled && isCrd && props.isNotAuthorized === true`, return:
  ```tsx
  <CrdLayoutWrapper>
    <CrdForbiddenPage
      title={t('forbidden.title')}
      description={t('forbidden.description')}
      goHomeLabel={t('forbidden.actions.goHome')}
      goBackLabel={t('forbidden.actions.goBack')}
      onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
      onGoBack={showGoBack ? () => navigate(-1) : undefined}
      showGoBack={showGoBack}
    />
  </CrdLayoutWrapper>
  ```
  (h) otherwise, return the existing MUI fallback verbatim:
  ```tsx
  <TopLevelLayout>
    <Error40X {...props} />
  </TopLevelLayout>
  ```
  Imports: `useTranslation` from `react-i18next`; `useNavigate` from `@/core/routing/useNavigate`; `useCrdEnabled` from `@/main/crdPages/useCrdEnabled`; `isCrdRoute` from `@/main/crdPages/error/isCrdRoute`; `hasInAppHistory` from `@/main/crdPages/error/hasInAppHistory`; `usePageTitle` from `@/core/routing/usePageTitle`; `CrdLayoutWrapper` from `@/main/ui/layout/CrdLayoutWrapper`; `CrdForbiddenPage` from `@/crd/components/error/CrdForbiddenPage`; `TopLevelLayout` from `@/main/ui/layout/TopLevelLayout`; `Error40X` from `@/core/pages/Errors/Error40X`; `TopLevelRoutePath` from `@/main/routing/TopLevelRoutePath`. Depends on T008, T009, T010, T011, T012a.
- [X] T014 [US1] Modify `src/root.tsx` to use the new `CrdAwareErrorComponent`. Replace the inline arrow:
  ```tsx
  <Error40XBoundary
    errorComponent={errorState => (
      <TopLevelLayout>
        <Error40X {...errorState} />
      </TopLevelLayout>
    )}
  >
  ```
  with:
  ```tsx
  <Error40XBoundary
    errorComponent={errorState => <CrdAwareErrorComponent {...errorState} />}
  >
  ```
  Add `import { CrdAwareErrorComponent } from '@/main/crdPages/error/CrdAwareErrorComponent';` near the existing `Error40XBoundary` import. Remove the now-unused `TopLevelLayout` and `Error40X` imports IF and ONLY IF they have no other call site in `root.tsx` (they may not — verify by searching the file). Do NOT change any other provider or wrapper. Depends on T013.

### Tests for User Story 1

- [X] T015 [P] [US1] Create `src/main/crdPages/error/CrdAwareErrorComponent.test.tsx` (Vitest + React Testing Library). Mock `useCrdEnabled`, `useNavigate`, `useTranslation`, `usePageTitle`, `hasInAppHistory` (via `vi.mock('@/main/crdPages/error/hasInAppHistory')`), and the i18n module loader so the test can drive the routing decision in isolation. Cover at minimum: (a) `crdEnabled=true, pathname='/welcome-space', isNotAuthorized=true` → renders `<CrdForbiddenPage>` (assert by `getByRole('heading', { level: 1 })` text matching the mocked `forbidden.title`); (b) `crdEnabled=true, pathname='/admin', isNotAuthorized=true` → renders MUI fallback (assert NO heading with the mocked CRD title text; assert presence of `Error40X` markers, e.g., the MUI `pages.unauthorized.header` text via the actual `Error40X` render or a stubbed marker); (c) `crdEnabled=false, pathname='/welcome-space', isNotAuthorized=true` → renders MUI fallback; (d) `crdEnabled=true, pathname='/welcome-space', isNotFound=true` (NOT authorized) → renders MUI fallback (CRD 404 is out of scope per the spec); (e) `pathname=undefined` → does not crash, renders MUI fallback; (f) when CRD branch renders and `hasInAppHistory()` is mocked to `false`, the secondary "Go back" button is NOT in the DOM and `showGoBack` is `false`; when `hasInAppHistory()` is mocked to `true`, the secondary button IS in the DOM. Depends on T013.
- [ ] T016 [US1] Manual QA per `specs/095-crd-auth-error-page/quickstart.md` Stories 1 and 1b. **Repeat the Story 1 walkthrough on three representative private CRD route shapes** (per SC-001): (1) a top-level private Space (`/<spaceNameId>`); (2) a private Subspace inside a Space (`/<spaceNameId>/challenges/<subspaceNameId>` or whatever the project's nested-Space URL is); (3) a no-privilege admin route (`/admin/...`) that is NOT a CRD-enabled route — confirms that on this route the MUI fallback renders, NOT the CRD page (per the predicate logic in T011 / FR-015 edge case). For each route, verify the CRD page (or MUI fallback) renders correctly, the recovery actions work, and the tab title is correct. In addition to the per-route checks: (a) verify focus moves to the primary button on render (FR-026); (b) verify `<h1>` is announced by VoiceOver as "Access Restricted, heading level 1" (FR-027); (c) verify the icon is NOT announced (`aria-hidden="true"`, FR-028); (d) verify the tab title becomes "Access Restricted | Alkemio" within ~100ms of the forbidden render (FR-022 / SC-007). Depends on T014.

**Checkpoint**: User Story 1 is fully functional. The throw-path on a CRD route renders the CRD page; the throw-path on an MUI route or with the toggle off still renders MUI `Error403` exactly as on `develop`. No regression in the MUI `Error40XBoundary` contract.

---

## Phase 4: User Story 2 — Direct visit to `/restricted` renders the CRD page when CRD is enabled (Priority: P2)

**Goal**: When the user (authenticated or anonymous — the route is auth-agnostic per Clarification Q4) visits `/restricted` and the CRD toggle is on, the CRD forbidden page is rendered. The same Sentry breadcrumb (`logInfo('Attempted access to: ${origin}')`) the MUI `Restricted.tsx` emits today fires unchanged. When the toggle is off, the existing MUI `Restricted` component renders unchanged.

**Independent Test**: With CRD toggle on, visit `http://localhost:3001/restricted?origin=/some/page`. Verify the CRD page renders inside CRD chrome and the Sentry breadcrumb fires with `Attempted access to: /some/page`. Toggle CRD off and reload — the existing MUI `Error403` renders inside `TopLevelLayout`. See `quickstart.md` Stories 2 and 2b.

### Implementation for User Story 2

- [X] T017 [US2] Create `src/main/crdPages/error/CrdRestrictedRoute.tsx` per the contract in `contracts/forbidden-page-props.md` §3. Named export `CrdRestrictedRoute`. Function body mirrors `src/core/routing/Restricted.tsx` for the Sentry / APM parity, then renders the CRD shell. Specifically: (a) `useTransactionScope({ type: 'authentication' })` from `@/core/analytics/SentryTransactionScopeContext`; (b) `const params = useQueryParams();` from `@/core/routing/useQueryParams` and `const origin = params.get('origin');`; (c) `useEffect(() => { logInfo('Attempted access to: ${origin}'); }, [origin]);` with `logInfo` from `@/core/logging/sentry/log` — exact mirror of `Restricted.tsx:13-15`; (d) `const { t } = useTranslation('crd-error');`; (e) `const navigate = useNavigate();`; (f) `const showGoBack = hasInAppHistory();` from `@/main/crdPages/error/hasInAppHistory`; (g) `usePageTitle(t('forbidden.title'));`; (h) return:
  ```tsx
  <CrdLayoutWrapper>
    <CrdForbiddenPage
      title={t('forbidden.title')}
      description={t('forbidden.description')}
      goHomeLabel={t('forbidden.actions.goHome')}
      goBackLabel={t('forbidden.actions.goBack')}
      onGoHome={() => navigate(`/${TopLevelRoutePath.Home}`)}
      onGoBack={showGoBack ? () => navigate(-1) : undefined}
      showGoBack={showGoBack}
    />
  </CrdLayoutWrapper>
  ```
  Imports: `useEffect` from `react`; `useTranslation` from `react-i18next`; `useTransactionScope` from `@/core/analytics/SentryTransactionScopeContext`; `useQueryParams` from `@/core/routing/useQueryParams`; `logInfo` from `@/core/logging/sentry/log`; `useNavigate` from `@/core/routing/useNavigate`; `hasInAppHistory` from `@/main/crdPages/error/hasInAppHistory`; `usePageTitle` from `@/core/routing/usePageTitle`; `CrdLayoutWrapper` from `@/main/ui/layout/CrdLayoutWrapper`; `CrdForbiddenPage` from `@/crd/components/error/CrdForbiddenPage`; `TopLevelRoutePath` from `@/main/routing/TopLevelRoutePath`. Do NOT branch on auth state; do NOT add any `<Navigate>` redirect. Depends on T008, T009, T010, T012a.
- [X] T018 [US2] Modify `src/main/routing/TopLevelRoutes.tsx` to toggle the `/restricted` route between MUI and CRD handlers. (a) Add `import { CrdRestrictedRoute } from '@/main/crdPages/error/CrdRestrictedRoute';` next to the existing `import { Restricted } from '@/core/routing/Restricted';`. (b) Locate the `<Route path={`/${TopLevelRoutePath.Restricted}`} element={...}>` block (currently renders `<WithApmTransaction>...<Restricted /></WithApmTransaction>`). (c) Replace its `<Restricted />` child with `{crdEnabled ? <CrdRestrictedRoute /> : <Restricted />}`. The `crdEnabled` constant already exists at the top of the `TopLevelRoutes` function (`const crdEnabled = useCrdEnabled();`). Keep `<WithApmTransaction>` wrapping the conditional unchanged. Do NOT change any other route. Depends on T017.

### Tests for User Story 2

- [X] T019 [P] [US2] Create `src/main/crdPages/error/CrdRestrictedRoute.test.tsx` (Vitest + React Testing Library). Mock `logInfo` (via `vi.mock('@/core/logging/sentry/log')`), `useTransactionScope`, `useQueryParams`, `useNavigate`, `useTranslation`, `usePageTitle`, and `hasInAppHistory` (via `vi.mock('@/main/crdPages/error/hasInAppHistory')`). Cover: (a) `useQueryParams.get('origin')` returns `/some/page` → `logInfo` is called exactly once with `'Attempted access to: /some/page'`; (b) `useQueryParams.get('origin')` returns `null` → `logInfo` is called exactly once with `'Attempted access to: null'`; (c) the rendered tree contains the heading text from the mocked `forbidden.title`; (d) primary button has the mocked `forbidden.actions.goHome` label and clicking it calls `navigate('/home')`; (e) `useTransactionScope` is called once with `{ type: 'authentication' }`; (f) when `hasInAppHistory()` is mocked to `true`, the secondary "Go back" button is in the DOM; when mocked to `false`, it is not. Depends on T017.
- [ ] T020 [P] [US2] (Optional but recommended for the toggle path) Add a small unit test inside the existing `TopLevelRoutes` test file (or create one if absent) that asserts: with `useCrdEnabled` mocked to `true`, the `/restricted` route renders `CrdRestrictedRoute`; with it mocked to `false`, the same route renders `Restricted`. If the existing `TopLevelRoutes` has no test file, this task is optional — note that omission in the PR description and rely on T021 for manual verification.
- [ ] T021 [US2] Manual QA per `specs/095-crd-auth-error-page/quickstart.md` Stories 2 and 2b. Plus: (a) **Sentry parity check** — open the Sentry dev tools / breadcrumb panel; navigate to `/restricted?origin=/foo` with CRD toggle on, confirm the breadcrumb message is exactly `Attempted access to: /foo`; toggle CRD off, reload the same URL, confirm the breadcrumb is byte-for-byte identical (SC-008). (b) **Anonymous direct visit** — sign out, visit `/restricted` with CRD toggle on; confirm the CRD page renders with no redirect to sign-in (FR-021, Q4 clarification). Depends on T018.

**Checkpoint**: User Story 2 is fully functional. The `/restricted` route renders the CRD page when the toggle is on (regardless of auth state), the existing MUI `Restricted` page when the toggle is off. The Sentry signal is byte-for-byte identical to MUI's.

---

## Phase 4b: User Story 3 — `/required` page CRD migration (Priority: P2)

**Goal**: When an anonymous user is redirected to `/required` (or visits it directly) with the CRD toggle on, the page renders the CRD-styled "Access Restricted — please sign in" page inside CRD layout chrome, with sign-in / return-as-guest actions wired through real `<a href>` anchors. Toggle off, the existing MUI `AuthRequiredPage` renders unchanged.

**Independent Test**: With CRD toggle on, sign out, navigate to a private Space deep link (e.g., `/<private-space>`). The upstream redirect lands you on `/required?returnUrl=<encoded-original>`. Verify (a) the CRD chrome and CRD card render, (b) the "Sign in / Sign up" anchor's `href` is the existing login URL with `returnUrl` preserved verbatim, (c) the "Return to dashboard as guest" anchor's `href` is an absolute URL pointing at the configured platform domain's home, (d) clicking sign-in completes the login flow and returns to the original URL. See `quickstart.md` Story 3.

### Implementation for User Story 3

- [X] T028 [US3] Extend `src/crd/i18n/error/error.en.json` with an `authRequired` sibling to `forbidden`, containing keys `title`, `description`, `descriptionContinued`, `actions.signIn`, `actions.or`, `actions.returnAsGuest`. English values per the `data-model.md` §9 table. Mirror the same keys (with translated values) in `error.nl.json`, `error.es.json`, `error.bg.json`, `error.de.json`, `error.fr.json`. No new namespace is created — the keys live alongside the existing `forbidden` group in the existing `crd-error` namespace (FR-043).
- [X] T029 [US3] Create `src/crd/components/error/CrdAuthRequiredPage.tsx` per `contracts/forbidden-page-props.md` §13. Named export `CrdAuthRequiredPage` with prop type `CrdAuthRequiredPageProps`. Render: a `lucide-react` `ShieldAlert` icon (`aria-hidden="true"`) at the top, an `<h1>` containing `title` (using `text-page-title`), two stacked `<p>` elements containing `description` and `descriptionContinued` (using `text-body text-muted-foreground`), a primary `Button asChild={true}` wrapping an `<a href={signInHref}>` with label `signInLabel`, a `<span class="text-caption text-muted-foreground">` containing `orLabel`, and a secondary `Button asChild={true} variant="outline"` wrapping an `<a href={returnAsGuestHref}>` with label `returnAsGuestLabel`. Forbidden imports: nothing from `@mui/*`, `@emotion/*`, `@apollo/client`, `@/core/apollo/*`, `@/domain/*`, `@/core/auth/*`, `react-router-dom`, or `formik`. Allowed imports: `@/crd/primitives/button`, `@/crd/lib/utils` (`cn`), and `lucide-react` (`ShieldAlert`). Do NOT call `useTranslation` — all strings come from props.
- [X] T030 [US3] Create `src/main/crdPages/error/CrdAuthRequiredRoute.tsx` per `contracts/forbidden-page-props.md` §14. Named export `CrdAuthRequiredRoute`. Function body: (a) `useTransactionScope({ type: 'authentication' })`; (b) `const { t } = useTranslation('crd-error');`; (c) `const returnUrl = useQueryParams().get(PARAM_NAME_RETURN_URL) ?? undefined;` (`PARAM_NAME_RETURN_URL` from `@/core/auth/authentication/constants/authentication.constants`); (d) `const { locations } = useConfig();` (from `@/domain/platform/config/useConfig`); (e) `const signInHref = buildLoginUrl(returnUrl);` (from `@/main/routing/urlBuilders`); (f) `const domain = locations?.domain ? \`https://${locations.domain}\` : '';`; (g) `const returnAsGuestHref = \`${domain}/${TopLevelRoutePath.Home}\`;`; (h) `usePageTitle(t('authRequired.title'));`; (i) return `<CrdLayoutWrapper><CrdAuthRequiredPage … /></CrdLayoutWrapper>` with all eight string props sourced from `t('authRequired.*')`.
- [X] T031 [US3] Modify `src/core/auth/authentication/routing/IdentityRoute.tsx`. Add imports `import { CrdAuthRequiredRoute } from '@/main/crdPages/error/CrdAuthRequiredRoute';` and `import { useCrdEnabled } from '@/main/crdPages/useCrdEnabled';`. At the top of the function body, add `const crdEnabled = useCrdEnabled();`. Replace the existing `<Route path={\`${IdentityRoutes.Required}\`} element={<AuthRequiredPage />} />` with `<Route path={\`${IdentityRoutes.Required}\`} element={crdEnabled ? <CrdAuthRequiredRoute /> : <AuthRequiredPage />} />`. Do NOT change any other route. The legacy `AuthRequiredPage` import remains.

### Tests for User Story 3

- [ ] T032 [P] [US3] (Optional but recommended) Create `src/main/crdPages/error/CrdAuthRequiredRoute.test.tsx` (Vitest + React Testing Library). Mock `useTransactionScope`, `useQueryParams`, `useConfig`, `useTranslation`, `usePageTitle`, and `buildLoginUrl` (via `vi.mock('@/main/routing/urlBuilders')`). Cover: (a) when `useQueryParams.get('returnUrl')` returns `/welcome-space`, `buildLoginUrl` is called once with `/welcome-space` and the rendered primary anchor's `href` matches the mocked return value; (b) when `useQueryParams.get('returnUrl')` returns `null`, `buildLoginUrl` is called once with `undefined`; (c) when `useConfig().locations?.domain === 'app.alkem.io'`, the secondary anchor's `href` is `https://app.alkem.io/home`; (d) when `useConfig().locations` is undefined, the secondary anchor's `href` is `/home` (no domain prefix); (e) `useTransactionScope` is called once with `{ type: 'authentication' }`.
- [ ] T033 [US3] Manual QA per `specs/095-crd-auth-error-page/quickstart.md` Story 3. Verify: (a) anonymous user on a private CRD Space deep link is silently redirected to `/required?returnUrl=<encoded>`; (b) the CRD chrome and CRD card render (no MUI `TopLevelLayout`); (c) primary action's `href` preserves `returnUrl` verbatim; (d) secondary action's `href` is the absolute home URL with `https://${domain}` prefix; (e) clicking sign-in completes the login flow and returns to the originally-requested URL; (f) toggle CRD off, reload `/required`, confirm the MUI `AuthRequiredPage` renders unchanged.

**Checkpoint**: User Story 3 is fully functional. The `/required` route renders the CRD page when the toggle is on (regardless of auth state), the existing MUI `AuthRequiredPage` when the toggle is off. The `returnUrl` round-trip is preserved end-to-end and the platform-home URL construction matches the MUI implementation byte-for-byte.

---

## Phase 5: Cross-cutting validation against the toggle-off regression path

**Purpose**: Verify the MUI fallback path is fully preserved end-to-end across every entry point. This is per FR-030 / SC-003 and warrants its own checkpoint because it covers code paths the user-story tests do not exercise individually.

- [ ] T022 With CRD toggle OFF (`localStorage.removeItem('alkemio-crd-enabled')`), reproduce all flows from `quickstart.md` and confirm zero visual / behavioral regression vs. production `develop` for: (a) authenticated user on private Space → MUI `Error403` inside `TopLevelLayout`; (b) anonymous user on private Space → silent redirect to `/required?returnUrl=...` → MUI `AuthRequiredPage` inside `TopLevelLayout`; (c) `NonAdminRedirect` → `/restricted` → MUI `Error403`; (d) direct visit to `/restricted` → MUI `Error403` + `logInfo('Attempted access to: ${origin}')`; (e) direct visit to `/required` → MUI `AuthRequiredPage` (US3 toggle-off check); (f) unrelated boundary error (e.g., a route that throws `NotFoundError`) → MUI `Error404`. Compare each render side-by-side with a fresh checkout of `develop` (or visit `develop` deployed elsewhere) to confirm pixel-level parity.
- [ ] T022a **Post-sign-in `returnUrl` round-trip on three CRD routes** (per SC-009). With CRD toggle ON, complete this flow end-to-end on each of the three representative CRD route shapes: (1) a top-level private Space (`/<spaceNameId>`); (2) a private Subspace (`/<spaceNameId>/<subspace-segment>`); (3) a no-privilege admin route (`/admin/<some-admin-page>`). For each: (a) sign out; (b) paste the deep link into the URL bar; (c) confirm the silent redirect lands on `/required?returnUrl=<encoded-original-url>`; (d) complete sign-in with credentials that DO grant access to the resource; (e) confirm you land back on the originally-requested URL with the actual page content (not the forbidden page) rendering correctly. For the admin case, where the test user does NOT have admin privilege even when signed in, instead confirm you land back on the URL and then see the CRD forbidden page (authenticated branch) — exactly matching the spec edge case "Sign-in returns to a page the now-authenticated user *still* can't access". This task verifies that this feature did not break the existing `useRestrictedRedirect` / `UrlResolverProvider` upstream redirect behavior on any CRD route shape.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Lint / type / test the full surface, validate bundle behavior, and run the quickstart end-to-end.

- [X] T023 Run `pnpm lint` from the repo root and resolve any TypeScript / Biome / ESLint findings introduced by this branch's diff. The React Compiler ESLint rule is the critical one (`react-compiler/react-compiler`) — confirm no manual `useMemo` / `useCallback` / `React.memo` was introduced in any new file.
- [X] T024 Run `pnpm vitest run --reporter=basic` from the repo root and confirm all 57+ existing test files plus the three new files (`isCrdRoute.test.ts`, `CrdAwareErrorComponent.test.tsx`, `CrdRestrictedRoute.test.tsx`) pass. Total expected runtime ≤ ~12s.
- [X] T025 Run `pnpm build` from the repo root and confirm the production build completes without new warnings beyond the existing chunk-size advisories. Then run `pnpm analyze` and inspect `build/stats.html`: confirm `CrdForbiddenPage`, `CrdAwareErrorComponent`, `CrdRestrictedRoute` land in CRD-related chunks, and that `Error403` / `Error40X` / `TopLevelLayout` are still in their existing MUI chunks unchanged (SC-004). Note any unexpected chunk migrations in the PR description.
- [ ] T026 Run the full `quickstart.md` checklist end-to-end in the dev server (`pnpm start`) for both toggle states. Record screenshots of: (a) the CRD forbidden page on a private Space deep link (Story 1); (b) the CRD forbidden page at `/restricted` (Story 2); (c) the MUI `Error403` in the toggle-off case (regression). Attach screenshots to the PR description per Engineering Workflow #4.
- [ ] T027 [P] Sweep the spec / plan / contracts for any documentation drift introduced during implementation. If any wording diverged (e.g., a slightly different action label was actually shipped, or the i18n namespace name changed), update `specs/095-crd-auth-error-page/spec.md`, `plan.md`, `data-model.md`, or `contracts/forbidden-page-props.md` to match the shipped code. The doc set MUST be self-consistent at merge time.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks both user stories.
- **User Story 1 (Phase 3)**: Depends on Phase 2 (specifically T008, T009, T010, T011).
- **User Story 2 (Phase 4)**: Depends on Phase 2 (same set: T008, T009, T010, T011). Independent of User Story 1 — can be implemented in parallel.
- **Toggle-off Regression (Phase 5)**: Depends on Phase 3 AND Phase 4 (verifies both stories preserved the MUI path).
- **Polish (Phase 6)**: Depends on Phase 5.

### Within-phase dependencies

- T008 depends on T002–T007 (i18n files must exist before namespace registration imports them).
- T012a depends on nothing else in Phase 2 (it is a self-contained helper + its test).
- T013 depends on T008, T009, T010, T011, T012a.
- T014 depends on T013.
- T015 depends on T013.
- T017 depends on T008, T009, T010, T012a.
- T018 depends on T017.
- T019 depends on T017.
- T021 depends on T018.
- T022a depends on T014 + T018 (both flows need to be live to verify the round-trip end-to-end).

### Parallel opportunities

- T002, T003, T004, T005, T006, T007 — six independent translation files, fully parallel within Phase 2.
- T011, T012, T012a — predicate, its test, and the `hasInAppHistory` helper+test all target different files; fully parallel within Phase 2 (they share no dependencies).
- After Phase 2 completes, **Phase 3 and Phase 4 can run fully in parallel** if two developers are available — they touch disjoint files (`CrdAwareErrorComponent.tsx` + `root.tsx` vs. `CrdRestrictedRoute.tsx` + `TopLevelRoutes.tsx`).
- T015 (US1 test) and T019 (US2 test) — different files, fully parallel after their respective implementations land.
- T020 — parallel with T019 if it touches a different test file; sequential if it edits an existing TopLevelRoutes test file.
- T022 and T022a — can run in parallel: T022 verifies toggle-off regression, T022a verifies toggle-on round-trip; disjoint test setups.
- T027 — parallel with T026 (different surfaces).

---

## Parallel Example: Foundational i18n + predicate

```bash
# Six translation files can land in parallel in Phase 2:
Task: "Create src/crd/i18n/error/error.en.json with the four forbidden.* keys"
Task: "Create src/crd/i18n/error/error.nl.json with the four forbidden.* keys"
Task: "Create src/crd/i18n/error/error.es.json with the four forbidden.* keys"
Task: "Create src/crd/i18n/error/error.bg.json with the four forbidden.* keys"
Task: "Create src/crd/i18n/error/error.de.json with the four forbidden.* keys"
Task: "Create src/crd/i18n/error/error.fr.json with the four forbidden.* keys"

# Predicate + its test can run alongside i18n work:
Task: "Create src/main/crdPages/error/isCrdRoute.ts (predicate)"
Task: "Create src/main/crdPages/error/isCrdRoute.test.ts (Vitest unit test)"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup (T001).
2. Complete Phase 2: Foundational (T002–T012).
3. Complete Phase 3: User Story 1 (T013–T016).
4. **STOP and VALIDATE**: Test User Story 1 independently — the throw-path on a private Space already shows the CRD page; the existing `/restricted` flow continues to render the MUI page (toggle-off path is untouched until Phase 4).
5. Deploy / demo if ready.

### Incremental Delivery

1. Phase 1 + 2 → Foundation ready.
2. Add User Story 1 (Phase 3) → throw-path delivered → MVP ready.
3. Add User Story 2 (Phase 4) → `/restricted` route delivered.
4. Run Phase 5 toggle-off regression.
5. Polish (Phase 6) → ready for PR / merge.

### Parallel Team Strategy

With two developers:

1. Dev A and Dev B collaboratively complete Phase 1 and Phase 2 (the i18n files alone are 6 parallel tasks).
2. Once Phase 2 is done:
   - Dev A: Phase 3 (User Story 1).
   - Dev B: Phase 4 (User Story 2).
3. Both meet at Phase 5 to run the regression check together.
4. Polish split between them.

---

## Notes

- [P] tasks = different files, no dependencies.
- [Story] label maps task to specific user story for traceability.
- This feature has no GraphQL operations — `pnpm codegen` is not required at any point.
- This feature has no new dependencies — `pnpm install` is not required at any point.
- All commits MUST be signed (project rule).
- Verify tests fail before implementing them (TDD discipline) where the test order in this list permits — for T012, the test can be written before T011 lands (the predicate signature is fixed by the contract in §4).
- Commit after each task or after each logical group (e.g., all six translation files in one commit, the predicate + its test in another, etc.).
- Stop at any checkpoint to validate the story independently in the dev server.
- Avoid: vague task scope, accidentally importing MUI inside `src/crd/`, accidentally importing `react-router-dom` or `@/core/auth/*` inside `src/crd/`, manual `useMemo` / `useCallback` / `React.memo` in any new file.
