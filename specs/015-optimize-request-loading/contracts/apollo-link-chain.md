# Contract: Apollo Link Chain Restructuring

**Date**: 2026-02-26 | **Updated**: 2026-03-03 (post-implementation)

## Current Link Chain (unchanged)

```
omitTypenameLink → consoleLink → guestHeaderLink → errorLoggerLink → errorHandlerLink → retryLink → redirectLink → httpLink(uploadLink | wsLink)
```

> **Note**: The originally proposed `BatchHttpLink` was dropped. The link chain structure is unchanged — only the WebSocket and retry configurations were modified.

## ~~Proposed Link Chain~~ (DROPPED — BatchHttpLink not used)

~~`split(isUpload → uploadLink, isSub → wsLink(lazy), default → batchHttpLink)`~~

BatchHttpLink adds 10ms forced delay per query and holds fast queries back until the slowest in a batch completes. HTTP/2 multiplexing already handles concurrent requests efficiently. Batching made things slower, not faster.

## Changes (implemented)

### ~~1. Add BatchHttpLink~~ (DROPPED)

Not implemented. See note above.

### 2. WebSocket Configuration

```typescript
// Before
{ lazy: false, onNonLazyError: ... }

// After
{ lazy: true, on: { error: ... } }
```

WebSocket now connects lazily — only when the first subscription is activated. This eliminates ~1014ms connection overhead on auth pages and read-only pages.

### 3. Retry Link Configuration

```typescript
// Before
{ delay: { initial: 1000, max: 5000, jitter: true }, attempts: { max: 5 } }

// After
{ delay: { initial: 300, max: 5000, jitter: true }, attempts: { max: 5 } }
```

## Backward Compatibility

- All existing queries continue to work — no link chain structural changes
- Upload mutations route to existing `uploadLink` (unchanged)
- Subscriptions route to `wsLink` (now lazy, but functionally identical once connected)
- The `from([...])` chain is unchanged
