import { SpaceCollectionCardVariant } from '@/core/apollo/generated/graphql-schema';

export type SpaceCollectionCardVariantPlain = 'compact' | 'expanded';

/**
 * `SpaceCollectionCardVariant` (server enum) → the plain `'compact' | 'expanded'` union
 * every other client-web site consumes (feature 076, spec dissent D-1 / risk R-11).
 *
 * This is the ONLY place in client-web that reads the generated enum. `EXPANDED` maps to
 * `'expanded'`; everything else — `COMPACT`, `null`, `undefined`, and any value the current
 * client doesn't recognise (a future third variant added server-side before the client
 * knows about it) — maps to `'compact'`. Because every other call site consumes this
 * function's plain result rather than the enum itself, a future enum member cannot fall
 * through anywhere else in the codebase; only this function needs updating.
 */
export function cardVariantFromServer(
  value: SpaceCollectionCardVariant | null | undefined
): SpaceCollectionCardVariantPlain {
  return value === SpaceCollectionCardVariant.Expanded ? 'expanded' : 'compact';
}

/** The inverse mapping, for building the mutation payload. */
export function cardVariantToServer(value: SpaceCollectionCardVariantPlain): SpaceCollectionCardVariant {
  return value === 'expanded' ? SpaceCollectionCardVariant.Expanded : SpaceCollectionCardVariant.Compact;
}
