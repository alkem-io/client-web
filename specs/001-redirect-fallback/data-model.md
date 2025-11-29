# Data Model – Redirect Fallback Experience (Reset)

The previous draft assumed a richer resolver payload (existence flag, explicit parent chains, etc.). Per the updated backend scope, the **only** contract changes we can rely on are:

1. A new `UrlResolverResult` enum emitted by `urlResolver`.
2. A new optional field `closestAncestor` on `UrlResolverQueryResults`.

All client-side structures must therefore be derived from the existing resolver fields already present in `graphql-schema.ts` plus those two additions.

## GraphQL contracts

### Query: `urlResolver(url: String!): UrlResolverQueryResults!`

- **Existing fields** (unchanged): `type: UrlType!`, plus the resource-specific payloads (`space`, `virtualContributor`, `innovationPack`, etc.) that map to the various `UrlResolverQueryResult*` objects already generated in `src/core/apollo/generated`.
- **New field**: `result: UrlResolverResult!` (enum described below).
- **New field**: `closestAncestor?: UrlResolverQueryResults` (null when no ancestor is available). The ancestor uses the exact same shape as `UrlResolverQueryResults` so the client can reuse one formatter to extract URLs, IDs, and labels, regardless of whether the record represents the requested target or the fallback destination.

### Enum: `UrlResolverResult`

| Value            | Meaning                                           | Client reaction                                                 |
| ---------------- | ------------------------------------------------- | --------------------------------------------------------------- |
| `RESOLVED`       | Target exists and viewer is authorized.           | Render/route directly to the requested resource.                |
| `LOGIN_REQUIRED` | Target exists but viewer is anonymous.            | Persist redirect intent and send to login.                      |
| `FORBIDDEN`      | Target exists but viewer lacks permission.        | Show restricted countdown with fallback metadata.               |
| `MISSING`        | Target (or its immediate container) was deleted.  | Jump to `closestAncestor` if present; otherwise show 404 shell. |
| `NOT_FOUND`      | Resolver could not match the URL to any resource. | Show 404 shell immediately.                                     |

> The enum collapses all resolver “reason” logic into a single field so the UI no longer infers state from scattered booleans.

### `closestAncestor` semantics

- Always references the **best accessible** ancestor computed server-side (e.g., parent Callout, parent Space, community home). No arrays are exposed; the server already walks the tree and exposes only the closest valid destination.
- Carries the same `type` and resource-specific fragments as the primary payload. Consumers can therefore reuse the same extractor to derive `displayName`, `canonicalUrl`, etc.
- Returned for both `FORBIDDEN` and `MISSING` outcomes. Omitted when the resolver cannot determine a safe fallback (e.g., when the entire lineage has been removed).

## Domain projections

### `ResolvedRouteState`

- **Fields**: `requestId: string`, `status: UrlResolverResult`, `requestedUrl: string`, `target: TargetResourceSummary | null`, `closestAncestor?: TargetResourceSummary`, `resolvedAt: number`.
- **Relationships**: Built directly from the GraphQL payload; feeds every downstream experience (login redirect, restricted overlay, 404 shell).
- **Validation rules**: `target` must be present when `status` ∈ {`RESOLVED`, `LOGIN_REQUIRED`, `FORBIDDEN`}. When `status='MISSING'`, at least one of `target` or `closestAncestor` must exist.

### `TargetResourceSummary`

- **Fields**: `id: string`, `type: UrlType`, `displayName: string`, `canonicalUrl: string`, `spaceLevel?: SpaceLevel`, `parentSpaceIds?: string[]` (only when supplied by the resolver, e.g., `UrlResolverQueryResultSpace.parentSpaces`).
- **Relationships**: `ResolvedRouteState.target` mirrors the requested node; `ResolvedRouteState.closestAncestor` reuses the same shape.
- **Validation rules**: `canonicalUrl` is required for navigation. Additional optional metadata (e.g., `Space.level`) is passed through when the resolver already returns it; no new backend fields are assumed.

### `FallbackDestination`

- **Fields**: `reason: 'unauthorized' | 'missing'`, `destination: TargetResourceSummary`, `offeredAt: number`, `acceptedManually: boolean`.
- **Relationships**: Created whenever `ResolvedRouteState.closestAncestor` is present and `status` ∈ {`FORBIDDEN`, `MISSING`}.
- **Validation rules**: `reason` derives strictly from `status`; no additional heuristics. `destination` must come from the ancestor payload—client code never fabricates fallback URLs.

### `RedirectIntent`

- **Fields**: `returnToUrl: string`, `createdAt: number`, `expiresAt: number`, `requestId: string`, `statusAtCapture: UrlResolverResult`.
- **Relationships**: Stored in `sessionStorage` so both login callbacks and restricted overlays can resume the original intent using the same data.
- **Validation rules**: TTL remains 30 minutes. Clear the record on logout or after any navigation triggered from that intent (successful target load or fallback adoption).

### `RestrictedExperienceState`

- **Fields**: `visible: boolean`, `countdownSeconds: number`, `destination?: TargetResourceSummary`, `manualOverrideTriggered: boolean`, `status: UrlResolverResult`.
- **Relationships**: Driven entirely by `ResolvedRouteState.status` and `closestAncestor`. When `status='FORBIDDEN'` and `closestAncestor` exists, the countdown becomes active; otherwise the UI skips straight to the 404 shell (still honoring the HTTP status code contract).
- **State transitions**:
  - `idle → countdown`: `status='FORBIDDEN'` with a valid `closestAncestor`.
  - `countdown → redirecting`: timer expires or manual CTA fires.
  - `redirecting → idle`: navigation to the ancestor completes; `status` becomes `RESOLVED` for the new URL.

### `RedirectNotice`

- **Fields**: `shouldShow: boolean`, `messageKey: string`, `dismissedAt?: number`, `originRequestId: string`, `destinationType: UrlType`.
- **Relationships**: Emitted whenever a fallback redirect actually occurs (manual or automatic). Stored in `sessionStorage` with the same TTL as `RedirectIntent` to avoid repeat banners per request.
- **Validation rules**: Only one notice per `originRequestId`. Message copy is selected via `status` → `reason` mapping.

### `AnalyticsEventPayload`

- **Fields**: `event: 'navigation.resolve.completed' | 'navigation.resolve.redirected'`, `requestId`, `status: UrlResolverResult`, `sourceType: UrlType`, `destinationType?: UrlType`, `manualOverride?: boolean`, `latencyMs: number`.
- **Relationships**: Built from `ResolvedRouteState` (for `status`, source/destination) plus the redirect overlay state (to flag manual overrides). `latencyMs` is measured client-side (difference between request start and `resolvedAt`).
- **Validation rules**: Payload must always include `status` and `sourceType`. `destinationType` required only when a fallback occurred. Resource identifiers continue to be hashed/anonymized before transmission—no new backend support needed.

This reset keeps the data model honest: every downstream concern now references the **only** additional server data we are guaranteed to receive (`UrlResolverResult` and `closestAncestor`), while everything else is derived locally from the resolver’s existing payload.
