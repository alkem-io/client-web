# Migrating a Page from MUI to CRD

## What is CRD?

CRD (Client Re-Design) is the new design system replacing MUI. It's built on shadcn/ui + Tailwind CSS + Radix UI. The migration is incremental — MUI pages and CRD pages coexist, and the split happens at the route level.

The prototype in `prototype/` (generated from Figma Make) is the design reference. CRD components are production-ready versions of prototype components, with i18n, accessibility, and real data instead of mocks.

## Architecture at a Glance

```
root.tsx
  ├── NotificationsGate (global)
  │   ├── CRD enabled  → CrdNotificationsPanelConnector (shadcn dialog)
  │   └── CRD disabled → InAppNotificationsDialog (MUI dialog)
  │
  └── TopLevelRoutes.tsx
      ├── MUI routes  → TopLevelLayout (existing MUI header/footer)
      └── CRD routes  → CrdLayoutWrapper → CrdLayout (CRD header/footer)
           (gated by       └── <Outlet /> → Your page
            UserSettings
            .designVersion)
```

CRD pages get a completely different shell — CRD header, CRD footer, Tailwind styling. MUI pages are untouched. Global dialogs (notifications) are handled at `root.tsx` level and work on all pages regardless of layout.

During migration, CRD routes are gated behind a **per-user `UserSettings.designVersion`** preference on the server (`1` = MUI, `2` = CRD; default `1`). Deployed environments always render the old MUI pages until the user opts in. The **Design Version switch lives in the user menu of both shells** — `PlatformNavigationUserMenu` (MUI) and `UserMenu` (CRD) — so a user starting on MUI can flip to CRD from their avatar dropdown without leaving the app. Developers/QA can also seed the toggle from the browser console.

## Feature Toggle

The toggle is read at boot from `localStorage('alkemio-design-version')` in `src/main/crdPages/useCrdEnabled.ts` and consumed by route dispatchers (`TopLevelRoutes.tsx`). The localStorage value is kept in sync with the server-side `UserSettings.designVersion` by `useDesignVersionSync.ts`; the user-menu switch (`useDesignVersionToggle.ts`) writes both the server preference and the localStorage mirror, then hard-reloads so the boot path picks up the new shell.

**Enable CRD pages via the UI:**
Click your avatar in the top-right header (available in both the MUI and CRD shells) → flip the **Design Version** switch. The page reloads and the preference persists to your account.

**Enable via browser console** (dev / QA seed):
```js
localStorage.setItem('alkemio-design-version', '2');
location.reload();
```

**Disable CRD pages** (back to MUI):
Toggle the switch in the user menu, or via console:
```js
localStorage.setItem('alkemio-design-version', '1');
location.reload();
```

The legacy `alkemio-crd-enabled` key is auto-migrated to `alkemio-design-version` on first load — no manual cleanup needed.

Both page versions are lazy-loaded — the unused chunk is never fetched, so there is no bundle penalty.

When migration is complete and all CRD pages are validated, remove the toggle: delete `useCrdEnabled.ts` + `useDesignVersionToggle.ts` + `useDesignVersionSync.ts`, remove conditional routing in `TopLevelRoutes.tsx`, remove `NotificationsGate` from `root.tsx`, delete old MUI page files from `src/main/topLevelPages/`.

## The Three Layers

Every CRD page has three distinct layers. Understanding the boundary between them is the most important concept.

### 1. CRD Components (`src/crd/`)

Pure presentational components. They:
- Receive all data as **props** (plain TypeScript, never GraphQL types)
- Receive all behavior as **callback props** (`onClick`, `onSubmit`, etc.)
- Use **Tailwind** for styling, **lucide-react** for icons
- Use `useTranslation('crd-<feature>')` for UI labels
- Know nothing about GraphQL, routing, auth, or the host app

Think of them as a component library that could be used by a completely different application.

### 2. Integration Layer (`src/main/crdPages/<page>/`)

The glue between the app and CRD components. This layer:
- Calls data hooks (GraphQL queries)
- Maps GraphQL types to CRD component props via a **data mapper**
- Renders CRD components with the mapped data
- Must NOT import from `@mui/*` or `@emotion/*`

### 3. Route Wiring (`TopLevelRoutes.tsx`)

Connects the URL to the page component, wrapped in `CrdLayoutWrapper` for the CRD shell.

## Step-by-Step Migration

### Step 1: Port Primitives

Check if the page needs shadcn/ui primitives not yet in `src/crd/primitives/`. If so, port them from `prototype/src/app/components/ui/`.

- Update the `cn()` import to `@/crd/lib/utils`
- Verify zero MUI imports

### Step 2: Build CRD Components

Create presentational components in `src/crd/components/<domain>/`.

**Hard rules:**
- Zero `@mui/*` imports
- Props are plain TypeScript (never `CalloutModelLightExtended` or similar)
- All `on*` handlers are props — the component never navigates, calls APIs, or changes app state
- Use `<a href>` for links, not `react-router-dom`
- Icons from `lucide-react` only
- All text uses `t()` — no hardcoded strings
- WCAG 2.1 AA: interactive elements are `<a>`/`<button>`, icon buttons have `aria-label`, focus indicators are visible

**Porting from prototype:**
The prototype uses hardcoded data and inline styles. When porting:
- Replace mock data with props
- Convert inline styles to Tailwind classes (see conversion table in `src/crd/CLAUDE.md`)
- Add i18n via `useTranslation('crd-<feature>')`
- Add accessibility attributes

### Step 3: Create the Data Mapper

Create `src/main/crdPages/<page>/dataMapper.ts`. This is the **only file** where GraphQL types meet CRD prop types.

```typescript
// Example: maps GraphQL space data to SpaceCardData
export function mapSpaceToCardData(space: SpaceWithParent): SpaceCardData {
  return {
    id: space.id,
    name: space.about.profile.displayName,
    description: space.about.profile.tagline ?? '',
    href: space.about.profile.url,
    isPrivate: !space.about.isContentPublic,
    // ... map all fields
  };
}
```

### Step 4: Create the Page Component

Create `src/main/crdPages/<page>/Page.tsx`:

```typescript
const MyPage = () => {
  const { data, loading } = useMyDataHook();
  const mappedData = mapToCardData(data);

  return <MyCrdComponent items={mappedData} loading={loading} />;
};
```

The data hook can be imported from the existing MUI page or copied — the GraphQL layer is shared.

### Step 5: Wire the Route (with Feature Toggle)

In `TopLevelRoutes.tsx`, add both lazy imports and a conditional route based on the toggle:

```typescript
// CRD (new) version
const CrdMyPage = lazyWithGlobalErrorHandler(
  () => import('@/main/crdPages/myPage/MyPage')
);
// MUI (old) version — stays until migration is validated
const MuiMyPage = lazyWithGlobalErrorHandler(
  () => import('@/main/topLevelPages/myPage/MyPage')
);
```

Then in the JSX, add a conditional block (the `crdEnabled` value comes from `useCrdEnabled()` already called in the component):

```tsx
{crdEnabled ? (
  <Route element={<NonIdentity><CrdLayoutWrapper /></NonIdentity>}>
    <Route path="/my-page" element={
      <WithApmTransaction path="/my-page">
        <Suspense fallback={<Loading />}><CrdMyPage /></Suspense>
      </WithApmTransaction>
    } />
  </Route>
) : (
  <Route path="/my-page" element={
    <NonIdentity>
      <WithApmTransaction path="/my-page">
        <Suspense fallback={<Loading />}><MuiMyPage /></Suspense>
      </WithApmTransaction>
    </NonIdentity>
  } />
)}
```

The old MUI page files stay in `src/main/topLevelPages/` and are the default. The CRD version only renders when the toggle is on.

### Step 6: Add Translations

See [translations.md](./translations.md) for the full guide. Short version:

1. Create `src/crd/i18n/<feature>.en.json` (+ other languages)
2. Register namespace in `src/core/i18n/config.ts`
3. Register types in `@types/i18next.d.ts`
4. Use `useTranslation('crd-<feature>')` in components

**Do-not-translate platform terms.** A set of brand terms — **Space, Subspace, Post (= Callout), template, Layout, Virtual Contributor** (and plurals) — must stay in **English**; only the surrounding sentence is translated and inflected around them (e.g. `Space-leden`, `subspace-template`). **For now this is enforced for Dutch (`nl`) only** — es/bg/de/fr still translate these terms and are expected to follow later. Watch the Dutch disambiguation traps: `Berichten` = "Messages" (not Post), `werkruimte` = "workspace", `Oproep voor whiteboards` = "Call for whiteboards" — these stay translated. The authoritative list, rationale, per-language localized forms, and validation approach live in **`specs/101-translation-glossary/`** (`glossary.md` / `glossary.json`). See also the "Do-not-translate platform terms (glossary)" section in `src/crd/CLAUDE.md`.

## Key Considerations

### CSS Isolation

Tailwind is loaded globally but scoped via `.crd-root` — MUI pages outside this scope are unaffected. CRD pages must never import MUI, ensuring no MUI CSS is loaded for CRD routes.

### Visual Fallbacks: Avatars & Banners (`pickColorFromId`)

When migrating a page that displays spaces (or any entity with an avatar / card banner), do **not** wire `getDefaultSpaceVisualUrl` into the data mapper as a fallback for missing images, and do **not** use static default-visual placeholder JPEGs. CRD has its own deterministic colour fallback that gives every space a stable accent colour derived from its id.

The single shared helper lives at `@/crd/lib/pickColorFromId`. Use it in your mapper:

```typescript
import { pickColorFromId } from '@/crd/lib/pickColorFromId';

export const mapMyEntityToCardData = (entity): MyCardData => ({
  id: entity.id,
  name: entity.profile.displayName,
  href: entity.profile.url,
  avatarUrl: entity.profile.avatar?.uri,
  // Leave undefined when no real banner exists — the component will render
  // the deterministic gradient, not a stock placeholder image.
  bannerUrl: entity.profile.cardBanner?.uri || undefined,
  avatarColor: pickColorFromId(entity.id),
});
```

**Prop naming convention:** Space-domain components (`SpaceCard`, `SpaceSettingsHeader`, `StackedAvatars`) use `avatarColor`. Dashboard/common components (`CompactSpaceCard`, `SpaceHierarchyCard`, `PendingInvitationCard`, `PendingApplicationCard`) use `color`. Composite components like `SubspaceHeader` use semantic names (`subspaceColor`, `parentColor`). Match the prop name expected by the target component.

The CRD component receives the colour prop and:

- Renders an **avatar fallback** via the `AvatarFallback` primitive, which natively accepts a `color` prop and applies `backgroundGradient()` internally — producing a gradient background with `text-white` initials when `avatarUrl` is missing.
- Renders a **banner fallback** as a `135deg` linear gradient (`color → color-mix(in srgb, color 70%, black)`) via the `backgroundGradient()` utility when `bannerUrl` is missing.

A real image always wins — the colour is purely a fallback.

**Where to apply the colour vs. where to leave the muted treatment:**

| Use the deterministic colour | Stick to the muted / prototype treatment |
|---|---|
| Display avatars (size-8+, e.g. invitation cards, dialogs, panel rows) | Sidebar resource items (`size-6` list rows) and the left-sidebar subspaces list (`SubspacesSection`) — these show the **real `avatarUrl`** when present, falling back to grey initials (no `pickColorFromId`) when missing |
| Card banners and banner fallback areas | Initials label tiles inside compact cards (CompactSpaceCard's name-row tile uses `bg-primary`) |

The rule of thumb: prominent display avatars and banner areas get the colour; small list rows show the real avatar when available and otherwise stay muted grey (no deterministic accent) so the layout doesn't feel busy.

**Components currently consuming the colour prop:**
`SpaceCard` (`avatarColor`), `SpaceHeader` (`color`), `SubspaceHeader` (`subspaceColor`, `parentColor`), `SpaceSettingsHeader` (`avatarColor`), `SpaceHierarchyCard` (`color`), `CompactSpaceCard` (`color`), `PendingInvitationCard` (`color`), `PendingApplicationCard` (`color`), `StackedAvatars` (`avatarColor`), `SidebarResourceItem` (`avatarColor`, optional), `EventDetailView` (`resolveColor` callback), `AvatarFallback` primitive (`color`).

See `src/crd/CLAUDE.md` (section "Deterministic Accent Colors") for the full data flow.

### Typography: Semantic Tokens, Not Raw Classes

CRD uses semantic typography tokens defined in `src/crd/styles/typography.css`. Each token bundles font-size, line-height, font-weight, and letter-spacing into a single Tailwind utility. **Do not use raw Tailwind typography combos** — use these tokens instead.

**Token reference (14 tokens):**

Two hero tokens (`text-display`, `text-hero`) are **fluid via `clamp()`** — they scale smoothly with the viewport, no breakpoint composition needed.

| Token | Size | Weight | Tracking | Use for |
|-------|------|--------|----------|---------|
| `text-display` | `clamp(30px, 4vw, 48px)` | 700 | -0.025em | Largest hero on the platform — detail dialogs (fluid) |
| `text-hero` | `clamp(22px, 3vw, 32px)` | 700 | -0.025em | Profile / Space / User / Organization / VC hero pages (fluid). **Replaces `text-profile-title` for public-profile heroes.** |
| `text-page-title` | 24px | 700 | -0.015em | Standard page headings — settings, list pages (`<h1>`) |
| `text-section-title` | 20px | 600 | — | Section headings (`<h2>`) |
| `text-subsection-title` | 18px | 600 | — | Subsection headings, dialog body titles, **feed-tier card titles** (PostCard, SpaceGridCard) |
| `text-subheader` | 16px | 500 | — | 16px tier between `text-body` and `text-subsection-title` — settings/form labels, RadioGroup options, dialog body text, empty-state titles, comfortable-reading wizard paragraphs. Override weight with `font-normal` / `font-semibold` / `font-bold`. |
| `text-card-title` | 14px | 600 | — | **Compact-tier** card titles (SpaceCard, OrganizationCard) |
| `text-body` | 14px | 400 | — | Body text, descriptions |
| `text-body-emphasis` | 14px | 500 | — | Form labels, link text, list-item emphasis |
| `text-control` | 14px | 500 | — | UI-chrome in single-line controls — menu items, dropdown rows, select triggers, inputs, button labels, tab triggers. Tighter leading (1.25) than body so rows stay compact. |
| `text-caption` | 12px | 400 | — | Timestamps, metadata, helper text |
| `text-label` | 12px | 600 | 0.05em | Uppercase section headers in **main content** (compose with `uppercase`) |
| `text-sidebar-label` | 11px | 600 | 0.05em | Uppercase section headers in **sidebars** — denser vertical rhythm than `text-label` (compose with `uppercase`) |
| `text-badge` | 10px | 600 | 0.04em | Badges, tiny meta tags, "LEADS"-style chips |

**When porting from the prototype** (Figma Make output uses raw classes), apply these replacements:

| Prototype / raw Tailwind | Replace with |
|--------------------------|-------------|
| `text-4xl font-bold` or `text-3xl md:text-4xl font-bold` | `text-display` |
| `text-3xl font-bold` (standalone) | `text-hero` |
| `text-2xl font-bold tracking-tight` or `text-2xl font-bold` | `text-page-title` |
| `text-2xl font-semibold` | `text-page-title font-semibold` |
| `text-xl font-bold` | `text-section-title font-bold` |
| `text-xl font-semibold` or `text-xl` | `text-section-title` |
| `text-lg font-bold` (e.g. PostCard feed-tier title) | `text-subsection-title font-bold` |
| `text-lg font-semibold` or `text-lg font-medium` or `text-lg` | `text-subsection-title` |
| `text-base font-bold` | `text-subheader font-bold` |
| `text-base font-semibold` | `text-subheader font-semibold` |
| `text-base font-medium` | `text-subheader` (default weight matches — drop modifier) |
| `text-base` (standalone) | `text-subheader font-normal` |
| `text-[length:var(--text-base)]` (any weight) | `text-subheader` (+ weight modifier as needed) |
| `text-sm font-semibold` or `text-sm font-bold` | `text-card-title` (+ `font-bold` if needed) |
| `text-sm font-medium` on labels, form text, inline emphasis | `text-body-emphasis` |
| `text-sm font-medium` on buttons, menu rows, tab triggers, dropdown rows | `text-control` |
| `text-sm`, `text-sm leading-relaxed`, `text-sm leading-normal` (prose) | `text-body` |
| `text-xs italic` or `text-xs font-medium` or `text-xs` | `text-caption` (+ modifier) |
| `text-xs uppercase tracking-wider` (any weight) in main content | `text-label uppercase` (drop `tracking-wider` — token supplies 0.05em) |
| Inline `style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' / '0.05em' }}` (sidebar headers) | `className="text-sidebar-label uppercase"` |
| `text-[10px] font-medium` or `text-[10px] font-semibold` or `text-[9px]` | `text-badge` |
| Inline `clamp(22px, 3vw, 32px)` or similar fluid hero | `text-hero` (or `text-display` for the larger range) |
| Dynamic conditional weight (`style={{ fontWeight: hasUnread ? 600 : 400 }}`) | `cn('text-body', hasUnread && 'font-semibold')` — token for size/leading/tracking, conditional className for the weight switch |

Tokens compose with Tailwind modifiers: `text-section-title md:text-page-title`, `text-body text-destructive`, `text-subsection-title font-bold`.

**Leave-alone list** (don't tokenize these):

- shadcn `Input.tsx` / `Textarea.tsx` `text-base md:text-sm` — iOS-zoom-prevention (mobile inputs under 16px trigger viewport zoom on focus).
- Rare/edge sizes (`text-[7px]`, `text-[8px]`, `text-[13px]`, etc.) — chart axes, document-preview mocks, design debt. Decide individually.
- Conditional **size** patterns (`fontSize: isFloating ? '12px' : 'var(--text-base)'`) — only conditional weight tokenizes cleanly.
- 14px uppercase patterns (`text-sm uppercase tracking-wider`) — no matching token. Rare; leave inline.

Full audit, decisions, and migration rulebook: `specs/042-crd-space-page/typography/fonts.md`

### Global Dialogs (Messages, Notifications)

**Messages**: The MUI Messages dialog is rendered in `root.tsx` and shared across all routes. CRD pages trigger it via `onMessagesClick` callback prop.

**Notifications**: Handled globally in `root.tsx` via `NotificationsGate`, which renders either the CRD `NotificationsPanel` or the MUI `InAppNotificationsDialog` based on the CRD toggle. Both are lazy-loaded — only one is ever fetched. The bell icon click (from either CRD Header or MUI AppBar) sets `InAppNotificationsContext.setIsOpen(true)` and the correct dialog opens on any page. The CRD component doesn't know about the toggle — it just calls a callback prop.

### Share Dialog

CRD has a fully-ported Share dialog at `src/crd/components/common/ShareDialog.tsx`. It replaces the MUI `src/domain/shared/components/ShareDialog/ShareDialog.tsx` for CRD-rendered entities (callouts, etc.). Two consumption patterns:

**Self-contained (icon button + dialog)** — `src/crd/components/common/ShareButton.tsx` renders a 32 px ghost icon button that owns its own open state. Used by `CrdWhiteboardView`, `CrdPublicWhiteboardPage`. Just pass `url`:

```typescript
<ShareButton url={whiteboardShareUrl} disabled={!whiteboardShareUrl} />
```

**Controlled** — `<ShareDialog>` directly, when the trigger lives elsewhere (a context menu, a header button, multiple buttons sharing one dialog). The parent owns `open` state:

```typescript
const [shareOpen, setShareOpen] = useState(false);
<ShareDialog open={shareOpen} onOpenChange={setShareOpen} url={url} />
```

**Share on Alkemio sub-flow.** The dialog supports view-switching: when you pass a `shareOnAlkemioSlot?: ReactNode`, an outlined "Share on Alkemio" button appears below the URL row. Clicking it switches the dialog body to the slot (and the header gains a Back arrow). The slot is the consumer's place to mount a form that calls `useShareLinkWithUserMutation`. CRD ships `src/crd/forms/UserSelector.tsx` (a multi-select user picker built from `Avatar` + `Input`, no Formik / `cmdk` / popover) for the picker UI; the form integration lives in the consumer layer (e.g. `src/main/crdPages/space/callout/CalloutShareOnAlkemioForm.tsx`).

For a callout-like entity with multiple Share triggers (3-dots menu + dialog header + reactions bar), lift the `shareOpen` state to a parent and pass `() => setShareOpen(true)` down to each trigger so they share one dialog instance. Don't mount one dialog per trigger.

i18n keys live in `src/crd/i18n/common/common.<lang>.json` under `share.*` and `share.alkemio.*`.

### Data Hooks Are Shared

The GraphQL data layer doesn't change. Existing hooks from MUI pages can be reused directly. Only the view layer is replaced.

### URL Construction

Every URL the CRD layer hands to `useNavigate`, an `<a href>`, or any other navigation API **must** come from `@/main/routing/urlBuilders`. Do not template paths inline in CRD pages, integration hooks, or data mappers.

**The rule, in three parts:**

1. **Read URLs off the entity.** Every primary entity (`User`, `Organization`, `Space`, `VirtualContributor`, …) exposes a canonical `profile.url` field. That is the public-profile URL for that entity. Use it directly — don't reconstruct it from `nameID` / slug fragments. On the User side, prefer `useUserPageRouteContext().profileUrl`, which already collapses `/user/me` → `/user/me` correctly via `getProfileUrl`. On the Org side, read `organization.profile.url`.

2. **Compose with a builder.** When you need a derived URL (a settings tab, an account sub-page, a community link), call a builder from `urlBuilders.ts` rather than concatenating strings yourself:

   ```typescript
   // GOOD
   import { buildSettingsTabUrl } from '@/main/routing/urlBuilders';
   navigate(buildSettingsTabUrl(profileUrl, 'profile'));

   // BAD — inline template, hand-built nameID path
   navigate(`/user/${userSlug}/settings/profile`);
   navigate(`${profileUrl}/settings/profile`); // also bad — bypasses the central seam
   ```

3. **Add a builder when none fits.** If the URL shape you need isn't covered, add a new exported function to `urlBuilders.ts` (or extend an existing one) and use that. One central place, one diff to find on rename, one place tests can stub. New shapes earn a new builder — never a one-off inline template "just here".

**Why this matters.** URL shapes change (the `nameID` → slug rename is exactly this kind of change in flight on the User vertical). Inline templates scatter the rename across every page; a centralized builder limits the blast radius to one file. The same applies to subdomain handling, query-param conventions, and `/me` redirection — all already live in `urlBuilders.ts` and `useUserRouteContext`. Don't reinvent them.

**Anti-patterns to flag in review:**
- `\`/user/${something}/...\`` or `\`/organization/${something}/...\`` anywhere outside `src/main/routing/`
- A locally-named `userSlug` / `organizationSlug` variable held only to plug into a template — usually a sign the call site should be reading `profile.url` instead
- A `profileSlug` / `userNameId` parameter on a hook whose only purpose is URL building — pass `profileUrl` and route through a builder

### Standalone Preview

Run `pnpm crd:dev` to see CRD components with mock data on `localhost:5200`. No backend needed. Useful for iterating on design without the full app running.

### Don't Over-Migrate

Only migrate what's asked. The existing MUI page continues to work and is the default (toggle OFF). CRD is an alternative gated behind the toggle, not a replacement that needs to happen all at once.

### Old MUI Files Stay in the Codebase

When migrating a page, **do not delete** the old MUI page files from `src/main/topLevelPages/`. They remain as the default rendering path until the toggle is removed. Both versions coexist — lazy loading ensures only the active version's chunk is fetched.

## File Layout Example

```
src/crd/components/space/
├── SpaceCard.tsx              # CRD presentational component
└── SpaceExplorer.tsx          # CRD composite (search, filters, card grid)

src/crd/i18n/
├── layout/                    # Header/footer translations
│   └── layout.en.json (+ .es, .nl, .bg, .de, .fr)
└── exploreSpaces/             # Space explorer translations
    └── exploreSpaces.en.json (+ .es, .nl, .bg, .de, .fr)

src/main/crdPages/
├── useCrdEnabled.ts           # Feature toggle hook (reads UserSettings.designVersion via localStorage mirror, default OFF)
└── spaces/
    ├── SpaceExplorerPage.tsx      # CRD page component (calls hook, renders CRD)
    ├── spaceCardDataMapper.ts     # GraphQL → CRD prop mapping
    └── useSpaceExplorer.ts        # Data hook (GraphQL queries)

src/main/topLevelPages/topLevelSpaces/   # Old MUI page (rendered when toggle is OFF)
├── SpaceExplorerPage.tsx
├── SpaceExplorerView.tsx
├── useSpaceExplorer.ts
└── useSpaceExplorerViewState.ts
```
