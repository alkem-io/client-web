# Quickstart – Tag Cloud Filter for Knowledge Base

1. **Install & bootstrap**

   ```bash
   pnpm install
   ```

2. **Regenerate GraphQL types** after editing `CalloutsSetQueries.graphql`:

   ```bash
   pnpm run codegen
   ```

3. **Run the app** (requires backend at `VITE_APP_ALKEMIO_DOMAIN`):

   ```bash
   pnpm start
   ```

   Navigate to a space (level 0) → Knowledge base tab to view the tag cloud.

4. **Execute unit tests** for tag aggregation and filtering logic:

   ```bash
   pnpm vitest run src/domain/collaboration/calloutsSet/useCalloutTagCloud/__tests__ --run
   ```

5. **Manual QA checklist**
   - Verify tag chips show at most two rows when collapsed, with `+N` chip for overflow.
   - Select multiple tags and confirm callouts list filters (AND logic) and results summary updates.
   - Use keyboard (Tab, Space/Enter) to toggle chips; check focus outline and ARIA `aria-pressed`.
   - Click `clear filter` to reset; ensure chips reorder and summary disappears.
   - Confirm tag cloud does **not** appear in subspace layouts.

6. **Performance sanity**
   - Watch the browser Performance tab while toggling filters; ensure no long tasks >300 ms.
   - Confirm React DevTools highlights the tag cloud component only re-rendering on relevant state changes.
