# Contract: Apollo Link Chain Restructuring

**Date**: 2026-02-26

## Current Link Chain

```
omitTypenameLink → consoleLink → guestHeaderLink → errorLoggerLink → errorHandlerLink → retryLink → redirectLink → httpLink(uploadLink | wsLink)
```

## Proposed Link Chain

```
omitTypenameLink → consoleLink → guestHeaderLink → errorLoggerLink → errorHandlerLink → retryLink → redirectLink → split(isUpload → uploadLink, isSub → wsLink(lazy), default → batchHttpLink)
```

## Changes

### 1. Add BatchHttpLink (terminating link)

```typescript
// New: BatchHttpLink for non-upload, non-subscription operations
const batchLink = new BatchHttpLink({
  uri: graphQLEndpoint,
  credentials: 'include',
  headers: { 'apollo-require-preflight': 'true' },
  batchInterval: 10, // ms — batch queries within 10ms window
  batchMax: 10, // max operations per batch
});
```

### 2. Modify Terminal Link Split

```typescript
// Current: split(isSubscription → wsLink, default → uploadLink)
// Proposed: three-way split
const terminalLink = split(
  isSubscription,
  wsLink, // lazy: true
  split(isUpload, uploadLink, batchLink)
);
```

### 3. WebSocket Configuration

```typescript
// Current
{ lazy: false, onNonLazyError: ... }

// Proposed
{ lazy: true, on: { error: ... } }
```

### 4. Retry Link Configuration

```typescript
// Current
{ delay: { initial: 1000, max: 5000, jitter: true }, attempts: { max: 5 } }

// Proposed
{ delay: { initial: 300, max: 5000, jitter: true }, attempts: { max: 5 } }
```

## Backward Compatibility

- All existing queries continue to work — batching is transparent to consumers
- Upload mutations route to existing `uploadLink` (unchanged)
- Subscriptions route to `wsLink` (now lazy, but functionally identical once connected)
- The `from([...])` chain is unchanged except for the terminal link
