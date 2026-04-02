# Quickstart: Ory Stack Migration — Client-Web

**Branch**: `040-ory-stack-migration` | **Date**: 2026-03-26

## Prerequisites

- Node 24.14.0 (pinned via Volta)
- pnpm 10.17.1+
- Alkemio backend running at `localhost:3000` with **Kratos v26.2.0** (coordinated upgrade)
- Kratos public API accessible at `localhost:4433` (via Traefik)

## Setup

```bash
# 1. Switch to feature branch
git checkout 040-ory-stack-migration

# 2. Install dependencies (picks up upgraded @ory/kratos-client)
pnpm install

# 3. Verify TypeScript compiles cleanly
pnpm lint

# 4. Run tests
pnpm vitest run

# 5. Start dev server
pnpm start
```

## Verification Checklist

All five auth flows must be tested against the Kratos v26.2.0 backend:

### Story 1: SDK Upgrade & Flow Verification

| Flow | URL | What to test |
|------|-----|-------------|
| Login | `/login` | Enter valid credentials → authenticated and redirected |
| Registration | `/register` | Complete all fields + terms → account created, verification email sent |
| Recovery | Start from `/login` "Forgot password" link | Enter email → receive recovery email → set new password |
| Verification | Click link from verification email | Flow completes → email marked verified |
| Settings | Navigate to profile settings | Passkey management, OIDC provider linking visible |
| OIDC Login | `/login` via each provider | Microsoft, LinkedIn, GitHub, Apple, Cleverbase each complete auth |
| Registration (terms) | `/register` | Terms acceptance checkbox renders and is required before submit |

### Story 2: Rate-Limit Lockout

1. Attempt login with wrong password 5+ times (or whatever the Kratos rate limit threshold is)
2. Verify: page redirects to `/login?lockout=true&retry_after=N`
3. Verify: lockout message displayed with "try again in X minutes"
4. Verify: after lockout period, login works normally

### Story 3: OIDC Registration Node Groups

1. Initiate OIDC registration with a provider that returns incomplete profile data (e.g., no email)
2. Verify: validation errors appear in the form (they'll be in the `default` group)
3. Initiate OIDC registration with an email that already has an account
4. Verify: user sees "account exists" message or is redirected to login

### Story 4: OIDC Account Linking 400

1. In settings, attempt to link an OIDC provider where the email is already used by another account
2. Verify: error message displayed (not an unhandled error or blank page)
3. Verify: successful OIDC linking works normally

## Key Files to Review

| File | What changed | Why |
|------|-------------|-----|
| `package.json` | `@ory/kratos-client` ^1.3.8 → ^26.2.0 | SDK version bump |
| `src/core/auth/authentication/hooks/useKratosFlow.ts` | 400 response handling | OIDC account linking behavioral change |
| `src/core/auth/authentication/components/KratosUI.tsx` | Verify div node handling | New `UiNodeDivisionAttributes` type |
| `src/core/auth/authentication/components/Kratos/helpers.ts` | Verify node type guards | New div node type |
| `src/core/auth/authentication/components/Kratos/messages.tsx` | Add message ID 1010016 | OIDC account linking error message |
| `src/core/auth/authentication/pages/LoginPage.tsx` | Verify lockout handling | Rate-limit 429→401 mapping |
| `src/core/auth/authentication/pages/RegistrationPage.tsx` | Verify OIDC error display | Node group reassignment |
| `src/core/i18n/en/translation.en.json` | Add new i18n keys | New error messages |

## Backend Coordination

This client-web migration must be deployed together with:
- **Server**: alkem-io/server#5940 (server-side Kratos SDK upgrade)
- **Infrastructure**: alkem-io/infrastructure-operations#2176 (Helm chart + DB migration)
- **Infrastructure**: alkem-io/infrastructure-operations#2177 (Oathkeeper probes/tracing)

No dual-version (old + new Kratos) compatibility is required. Client and backend upgrade together.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| TypeScript errors on Kratos types | SDK not upgraded | Run `pnpm install` |
| Auth flows return 410 | Flow expired (normal) | Flow expiration handler redirects automatically |
| OIDC errors not visible | Node group mismatch | Verify `default` group rendering in KratosUI |
| Blank page on account linking failure | 400 not handled | Check `useKratosFlow.ts` error handler |
| "Unauthorized" instead of lockout message | Lockout query param missing | Check Oathkeeper redirect config |
