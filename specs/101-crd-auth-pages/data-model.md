# Data Model: CRD Authentication Pages

**Branch**: `101-crd-auth-pages`
**Date**: 2026-05-20

## Purpose

This is a UI-migration feature. There is no new persistent data, no new GraphQL operations, and no new backend entity. The "data model" here is the **set of prop-type contracts** that flow between three layers: the live Kratos backend, the integration layer in `src/main/crdPages/auth/`, and the presentational CRD components in `src/crd/components/auth/`. Defining these shapes precisely is the heart of the migration because it is the boundary where Kratos types are translated into plain TypeScript.

The canonical TypeScript declarations live in [`contracts/flow-descriptor.ts`](./contracts/flow-descriptor.ts) and [`contracts/crd-auth-components.ts`](./contracts/crd-auth-components.ts). This document is the human-readable companion.

---

## Layers

```text
┌─────────────────────────────────────────────────────────────────┐
│  Kratos backend                                                 │
│  Returns: LoginFlow | RegistrationFlow | RecoveryFlow |         │
│           VerificationFlow (from @ory/kratos-client)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼  (Apollo / fetch — already wired)
┌─────────────────────────────────────────────────────────────────┐
│  src/main/crdPages/auth/  (INTEGRATION LAYER)                   │
│  • useKratosFlow(...) → raw Kratos flow                         │
│  • flowDescriptorAdapter(flow) → KratosFlowDescriptor (plain TS)│
│  • Wires return-URL, analytics, cooldown, accepted-terms        │
└───────────────────────────────┬─────────────────────────────────┘
                                │  KratosFlowDescriptor + callbacks
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/crd/components/auth/  (DESIGN-SYSTEM LAYER)                │
│  • CrdKratosFlow                                                │
│  • SignInCard / SignUpCard / RegistrationCard / …               │
│  • SocialProviderButton, AuthCardHeader, OrContinueWithDivider  │
│  Pure UI; no Kratos imports; props are plain TS.                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Entity 1 — `KratosFlowDescriptor`

The single most important type in this feature. It is what the adapter emits and what every CRD form-rendering component consumes.

**Purpose**: A plain-TypeScript, library-agnostic projection of a Kratos `LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow` that contains exactly the information the CRD form needs to render — no more, no less.

**Lifecycle**: Constructed per render in the integration layer. Never persisted. Never sent over the wire. Lives only in memory between the adapter call and the component render.

**Shape**:

```ts
type KratosFlowDescriptor = {
  flowType: 'login' | 'registration' | 'recovery' | 'verification';
  action: string;                 // form POST URL (from flow.ui.action)
  method: 'POST' | 'GET';         // form method (from flow.ui.method)

  // Top-level flow messages (e.g., "Email sent", "Account locked")
  messages: KratosMessage[];

  // Inputs the form must render, already bucketed by their semantic group
  groups: {
    hidden: KratosHiddenInputNode[];        // CSRF, flow-id, traits.picture, etc.
    default: KratosTextInputNode[];         // text inputs (email, first/last name)
    password: KratosTextInputNode[];        // password / code inputs
    rest: KratosTextInputNode[];            // anything not categorised
    submit: KratosSubmitButtonNode[];       // primary submit button(s)
    oidc: KratosOidcButtonNode[];           // social provider buttons, pre-sorted
    passkey: KratosPasskeyButtonNode[];     // passkey trigger buttons
    passkeyCredentials: KratosTextNode[];   // existing-passkey-credentials informational rows
  };
};
```

**Field-level details**:

```ts
type KratosMessage = {
  id: number;                     // Kratos message id (for special-case handling, e.g. lockout 9000429)
  type: 'info' | 'error' | 'success';
  text: string;                   // already-translated text from the backend
};

type KratosHiddenInputNode = {
  name: string;                   // e.g. "csrf_token", "traits.picture"
  value: string;
};

type KratosTextInputNode = {
  name: string;                   // e.g. "traits.email", "password", "code"
  type: 'text' | 'email' | 'password' | 'tel';
  label: string;                  // server-supplied or i18n-resolved label
  required: boolean;
  disabled: boolean;
  value: string;                  // current value (e.g., on validation re-render)
  messages: KratosMessage[];      // per-field errors / hints
  autocomplete?: string;          // e.g. "current-password", "new-password", "email"
};

type KratosSubmitButtonNode = {
  name: string;                   // e.g. "method"
  value: string;                  // e.g. "password", "code"
  label: string;                  // e.g. "Sign in", "Continue"
  disabled: boolean;
};

type KratosOidcButtonNode = {
  name: string;                   // e.g. "provider"
  value: string;                  // e.g. "linkedin", "microsoft"
  label: string;                  // backend-supplied label (fallback if no customisation)
  disabled: boolean;
  customisation?: SocialProviderCustomisation;   // see Entity 2
};

type KratosPasskeyButtonNode = {
  name: string;
  value: string;
  label: string;
  disabled: boolean;
  trigger: 'oryPasskeyLogin' | 'oryPasskeyLoginAutocompleteInit' | 'oryPasskeyRegistration' | 'oryPasskeySettingsRegistration';
  // Adapter pre-resolves the trigger; the CRD layer does not touch window.__oryPasskey*.
};

type KratosTextNode = {
  // Informational text rows (e.g., "You have a passkey registered")
  text: string;
};
```

**Adapter invariants**:

- For every `node` in `flow.ui.nodes`, exactly one bucket receives it.
- OIDC nodes are pre-sorted by `customisation?.sortOrder ?? Infinity`.
- Passkey nodes are pre-resolved with their trigger flavour.
- Hidden inputs of type `hidden` go to `hidden`, regardless of group.
- Unknown groups fall back to `rest` (graceful degradation, see Risk in plan.md).

---

## Entity 2 — `SocialProviderCustomisation`

**Purpose**: The icon + label + ordering for a known OIDC provider. Today this map lives inside `KratosSocialButton.tsx` in the MUI layer. This feature extracts it to a shared, MUI-free module so both shells use the same data.

**Shape**:

```ts
type SocialProviderCustomisation = {
  providerKey: string;            // matches Kratos node.attributes.value: 'linkedin', 'microsoft', 'github', 'apple', 'cleverbase'
  iconSrc: string;                // path to the SVG asset under /public/
  i18nLabelKey: string;           // 'crd-auth:auth.providers.linkedin', etc. (fallback to node.label)
  sortOrder: number;              // lower renders first
};
```

**Source of truth**: `src/main/crdPages/auth/socialProviderCustomizations.ts`. The MUI `KratosSocialButton.tsx` is refactored to import this same map (still inside the MUI layer, importing from an integration-layer shared module is fine because the integration layer has no MUI/CRD opinion).

**Why this is a separate entity**: it answers the question "should the CRD layer know about LinkedIn vs. Microsoft?" — no, it should not. It receives `iconSrc` and `label` already resolved.

---

## Entity 3 — Per-screen card view models

Each `*Card` CRD component receives a small view-model in addition to the optional `KratosFlowDescriptor`. These are the "page-level state" the integration layer knows about but the design system does not.

### `SignInCardProps`

```ts
type SignInCardProps = {
  descriptor: KratosFlowDescriptor;     // a `login` flow
  signUpHref: string;                   // route to /identity/sign_up
  forgotPasswordHref: string;           // route to /identity/recovery
  onProviderClick?: (providerKey: string) => void;   // for analytics
  onSubmitAttempt?: () => void;          // for analytics
  isLoading?: boolean;                  // initial flow fetch
};
```

### `SignUpCardProps` (curated quick-registration)

```ts
type SignUpCardProps = {
  descriptor: KratosFlowDescriptor;     // a `registration` flow, filtered to the curated nodes
  signInHref: string;                   // route to /identity/login
  termsOfUseHref: string;
  privacyPolicyHref: string;
  hasAcceptedTerms: boolean;            // controlled by the integration layer (sessionStorage workaround)
  onAcceptedTermsChange: (accepted: boolean) => void;
  onProviderClick?: (providerKey: string) => void;
  onSubmitAttempt?: () => void;
  isLoading?: boolean;
};
```

### `RegistrationCardProps` (full Kratos UI)

```ts
type RegistrationCardProps = {
  descriptor: KratosFlowDescriptor;     // a `registration` flow, full Kratos UI
  signInHref: string;
  termsOfUseHref: string;
  privacyPolicyHref: string;
  mustAcceptTerms: boolean;             // whether to show the gate or the full form
  hasAcceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
  onProviderClick?: (providerKey: string) => void;
  onSubmitAttempt?: () => void;
  isLoading?: boolean;
};
```

### `PasswordRecoveryCardProps`

```ts
type PasswordRecoveryCardProps = {
  descriptor: KratosFlowDescriptor;     // a `recovery` flow at the email stage
  signUpHref: string;
  isInCooldown: boolean;
  cooldownSecondsRemaining: number;     // 0 when not cooling down
  onProviderClick?: (providerKey: string) => void;   // recovery may not offer providers; safely optional
  isLoading?: boolean;
};
```

### `PasswordRecoveryCodeCardProps`

```ts
type PasswordRecoveryCodeCardProps = {
  descriptor: KratosFlowDescriptor;     // a `recovery` flow at the code stage
  signUpHref: string;
  isLoading?: boolean;
};
```

### `SetNewPasswordCardProps`

```ts
type SetNewPasswordCardProps = {
  descriptor: KratosFlowDescriptor;     // a settings/recovery flow at the password-reset stage
  isLoading?: boolean;
};
```

### `EmailVerificationCardProps`

```ts
type EmailVerificationCardProps = {
  descriptor: KratosFlowDescriptor;     // a `verification` flow
  continueHref?: string;                // resolved by the integration layer from flow.ui.action or returnUrl
  isLoading?: boolean;
};
```

### `EmailVerificationRequiredCardProps`

```ts
type EmailVerificationRequiredCardProps = {
  returnUrl?: string;                   // shown to the user as "you'll be returned to: …"
  // No descriptor — this screen has no Kratos flow attached
};
```

### `AuthErrorCardProps`

```ts
type AuthErrorCardProps = {
  errorCode?: string;                   // resolved from the Kratos error API
  errorMessage?: string;                // server-supplied
  errorReason?: string;                 // server-supplied
  signInHref: string;
  isLoading?: boolean;
};
```

---

## Entity 4 — `CrdKratosFlowProps`

The component that renders an entire form region (everything between the card header and the card footer) for a given descriptor.

```ts
type CrdKratosFlowProps = {
  descriptor: KratosFlowDescriptor;

  // Visual slots — mirror MUI KratosUI's extension points
  beforeInputs?: ReactNode;
  resetPasswordElement?: ReactNode;
  acceptTermsComponent?: ReactNode;
  children?: ReactNode;                 // between rest group and submit

  // Submission affordances
  submitDisabled?: boolean;
  submitLabelOverride?: (defaultLabel: string) => string;
  disableInputs?: boolean;

  // Passkey trigger — a passkey button is not a plain form submit; it starts a
  // browser WebAuthn ceremony. The CRD layer delegates the resolved trigger to
  // the integration layer, which owns the `window.__oryPasskey*` invocation and
  // the passkey-specific error surfacing. Required when `groups.passkey` is non-empty.
  onPasskeyTrigger?: (trigger: KratosPasskeyTrigger) => void;

  // Analytics callbacks (so the design-system layer never imports analytics)
  onProviderClick?: (providerKey: string) => void;
  onSubmitAttempt?: () => void;
};
```

---

## Entity 5 — `AuthShellProps`

The layout wrapper that hosts the card on every auth screen.

```ts
type AuthShellProps = {
  children: ReactNode;                  // the card slot

  // Footer wiring (same prop shape the existing CRD Footer uses)
  languages: { code: string; label: string }[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  footerLinks: CrdFooterLinks;          // imported from src/crd/layouts/types

  // Optional floating help button slot
  helpButton?: ReactNode;

  // Background — defaults to /alkemio-banner/global-banner.svg
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
};
```

---

## State transitions

This feature introduces no new persistent state, but the live flow object goes through transitions the CRD presenter has to respect. These transitions happen **at the Kratos backend**; the CRD layer's only job is to re-render whatever the new descriptor says.

| Screen | Transition | What changes in the descriptor |
|--------|-----------|--------------------------------|
| Sign-in | submit → success | The page navigates away (location change); CRD presenter does nothing special. |
| Sign-in | submit → invalid creds | `descriptor.messages` populates with the error; per-field `messages` may also populate. |
| Sign-up | submit → validation error | Same as sign-in; the `hasAcceptedTerms` state is preserved by the integration layer via sessionStorage (the descriptor's `traits.accepted_terms` may revert to false). |
| Recovery | submit email → email sent | The next descriptor surfaces a `code` input; the cooldown timer starts in the integration layer. |
| Recovery | submit code → success | Page navigates to set-new-password. |
| Verification | submit code → success | `descriptor.state === 'passed_challenge'` → integration layer redirects. |

The CRD layer never owns these transitions; it just re-renders.

---

## What is explicitly NOT in this data model

- Apollo cache entries.
- GraphQL types.
- Persistent localStorage / sessionStorage keys (those stay in the integration layer's hooks).
- `@ory/kratos-client` types (they exist only inside the adapter file, behind the boundary).
- Backend / server-side schema (out of scope per `FR-024`).
- Any application-level preference, feature flag, or design-toggle — the auth screens are shown before any user context exists, so nothing varies them; they render the CRD design for every visitor.
