# Quickstart – Redirect Fallback Experience

1. **Install & bootstrap**

   ```bash
   pnpm install
   ```

2. **Start backend resolver stub** (server team provides `/resolve-resource` via Alkemio server). Ensure `VITE_APP_ALKEMIO_DOMAIN` is reachable locally and exposes the new query.

3. **Regenerate GraphQL types** after editing `src/domain/navigation/graphql/resolveResource.graphql`:

   ```bash
   pnpm run codegen
   ```

4. **Run the client** and exercise deep-link paths:

   ```bash
   pnpm start
   ```

   - From a logged-out browser tab, paste a deep link (e.g., `/spaces/demo-space/callouts/ideas`).
   - Authenticate, verify you land on the intended resource (or its parent) within 3 seconds.
   - Repeat while logged in as a user lacking access to a private Sub-space to trigger the restricted countdown screen.

5. **Manual QA checklist**
   - Countdown overlay announces remaining seconds via screen reader and keeps keyboard focus on the CTA.
   - “Go now” button immediately redirects to the parent resource; timer stops.
   - When every ancestor is inaccessible, final destination is the Space home and standard 404 background remains visible.
   - Global redirect notice (“We couldn’t find that page…”) appears once per session after any fallback and persists until dismissed.
   - Analytics inspector shows `navigation.resolve.completed` / `navigation.resolve.fallback` events with requestId correlation IDs.

6. **Performance spot checks**
   - Record a performance profile while hitting three sequential fallbacks; resolver promise should settle in ≤150 ms median.
   - Inspect Apollo cache to confirm `ResolveResource` entries are evicted after logout.
