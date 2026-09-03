import { ApolloLink, Observable } from '@apollo/client';

export const DEV_DELAY_STORAGE_KEY = 'alkemio_graphql_delay_ms';

type DelaySetting = { ms: number; operations?: Set<string> };

/**
 * Reads the delay setting from localStorage. Format: `<ms>` to delay every operation, or
 * `<ms>:<OperationName>,<OperationName>` to delay only the listed operations.
 */
function readDelaySetting(): DelaySetting | undefined {
  try {
    const raw = localStorage.getItem(DEV_DELAY_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }
    const [msPart, operationsPart] = raw.split(':');
    const ms = Number(msPart);
    if (!Number.isFinite(ms) || ms <= 0) {
      return undefined;
    }
    const names = operationsPart
      ?.split(',')
      .map(name => name.trim())
      .filter(Boolean);
    return { ms, operations: names && names.length > 0 ? new Set(names) : undefined };
  } catch {
    return undefined;
  }
}

/**
 * Dev-only link that holds GraphQL operations for a configurable delay, so loading
 * states (skeletons, layout shift) can be inspected without throttling the whole
 * browser. Only added to the link chain in dev builds (`useGraphQLClient`).
 *
 * Toggle from the DevTools console — takes effect on the next request, no reload:
 *
 *   localStorage.setItem('alkemio_graphql_delay_ms', '2000')                               // every operation
 *   localStorage.setItem('alkemio_graphql_delay_ms', '2000:CalloutDetails,CalloutContributions') // only these
 *   localStorage.removeItem('alkemio_graphql_delay_ms')                                    // off
 */
export const devDelayLink = new ApolloLink((operation, forward) => {
  const setting = readDelaySetting();
  if (!setting || (setting.operations && !setting.operations.has(operation.operationName))) {
    return forward(operation);
  }
  return new Observable(observer => {
    let subscription: { unsubscribe: () => void } | undefined;
    const timer = setTimeout(() => {
      subscription = forward(operation).subscribe(observer);
    }, setting.ms);
    return () => {
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  });
});
