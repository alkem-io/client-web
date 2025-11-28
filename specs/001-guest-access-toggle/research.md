# Research Findings: Whiteboard Guest Access Toggle

## Decision: Use dedicated mutation `updateWhiteboardGuestAccess`

- **Rationale**: Aligns with existing space settings mutations that modify guest collaboration flags while keeping permission checks server-side. A named mutation keeps the API explicit and testable, enabling apollo cache updates through generated hooks.
- **Alternatives considered**: Reuse a generic whiteboard `updateWhiteboard` mutation (risk: over-broad scope and harder cache normalization); issue a REST call (incompatible with current GraphQL-only data layer).

## Decision: Confirm state via server response before showing link

- **Rationale**: Prevents stale exposure if privilege is revoked mid-action and ensures UI reflects authoritative `guestContributionsAllowed` before rendering warnings or public URL.
- **Alternatives considered**: Optimistic toggling without confirmation (risk: showing link when backend denies); polling whiteboard after mutation (adds redundant network calls).

## Decision: Defer guest share URL generation to a dedicated feature

- **Rationale**: Backend contract for guest links is still evolving; shipping a placeholder keeps UI progress scoped while avoiding brittle client-derived URLs that might conflict with the forthcoming API.
- **Alternatives considered**: Generating URLs from space/whiteboard slugs now (risk: breaking changes once backend finalizes format); blocking UI work until backend is ready (delays guest access controls entirely).

## Decision: Surface warnings with `Alert` patterns used elsewhere

- **Rationale**: MUI `Alert` components already meet accessibility and theming requirements, ensuring consistent warning semantics with minimal custom styling.
- **Alternatives considered**: Custom banner implementation (higher maintenance) or relying solely on text labels (insufficient visibility and contrast control).
