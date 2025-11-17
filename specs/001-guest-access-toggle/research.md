# Research Findings: Whiteboard Guest Access Toggle

## Decision: Use dedicated mutation `updateWhiteboardGuestAccess`

- **Rationale**: Aligns with existing space settings mutations that modify guest collaboration flags while keeping permission checks server-side. A named mutation keeps the API explicit and testable, enabling apollo cache updates through generated hooks.
- **Alternatives considered**: Reuse a generic whiteboard `updateWhiteboard` mutation (risk: over-broad scope and harder cache normalization); issue a REST call (incompatible with current GraphQL-only data layer).

## Decision: Confirm state via server response before showing link

- **Rationale**: Prevents stale exposure if privilege is revoked mid-action and ensures UI reflects authoritative `guestContributionsAllowed` before rendering warnings or public URL.
- **Alternatives considered**: Optimistic toggling without confirmation (risk: showing link when backend denies); polling whiteboard after mutation (adds redundant network calls).

## Decision: Generate guest share URL on the client from canonical identifiers

- **Rationale**: Requirement specifies the client as the generator; using existing space and whiteboard slugs keeps links predictable and avoids API expansions.
- **Alternatives considered**: Requesting backend-generated URLs (conflicts with clarified requirement); storing multiple versions per toggle (adds complexity and storage overhead).

## Decision: Surface warnings with `Alert` patterns used elsewhere

- **Rationale**: MUI `Alert` components already meet accessibility and theming requirements, ensuring consistent warning semantics with minimal custom styling.
- **Alternatives considered**: Custom banner implementation (higher maintenance) or relying solely on text labels (insufficient visibility and contrast control).
