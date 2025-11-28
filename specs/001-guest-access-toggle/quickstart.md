# Quickstart: Whiteboard Guest Access Toggle

## Prerequisites

- Node 20.15.1 (managed via Volta)
- pnpm 10.17+
- Running Alkemio backend accessible at `http://localhost:3000`
- `.env.local` aligned with backend domain settings

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the backend services (per platform guide) so GraphQL mutations succeed.
3. Launch the Vite dev server:
   ```bash
   pnpm start
   ```

## Developing the Feature

1. Ensure generated GraphQL types include `guestContributionsAllowed`:
   ```bash
   pnpm codegen
   ```
2. Run linting & type checks while iterating:
   ```bash
   pnpm lint
   ```
3. Execute unit tests (vitest) for Share dialog and whiteboard façades:
   ```bash
   pnpm vitest run --reporter=basic
   ```
4. Access `http://localhost:3001` and open a whiteboard Share dialog to verify the toggle and warnings.

## Verification Checklist

- Toggle succeeds only for members with `PUBLIC_SHARE` privilege.
- Guest link and warnings appear only after backend confirmation.
- Disabling guest access retracts warnings immediately.
- Telemetry/log hooks fire for both success and denial paths.
