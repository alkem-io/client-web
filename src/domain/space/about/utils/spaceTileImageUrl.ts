import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

type ProfileVisuals = {
  avatar?: { uri: string } | null;
  cardBanner?: { uri: string } | null;
};

/**
 * The single image to show for a space in a small square tile (list rows,
 * pending-membership cards).
 *
 * Per the canonical visual-fields rule an L0 space has no avatar concept — its
 * identity image is the cardBanner — while an L1/L2 subspace has a real avatar,
 * which is what belongs in a square. One is never substituted for the other, so
 * a space missing its own visual falls back to the deterministic initials tile
 * rather than borrowing the other visual.
 *
 * The backend returns a `Visual` object with an empty `uri` when nothing has
 * been uploaded, so absence is a falsy `uri`, not a null object.
 */
export const spaceTileImageUrl = (level: SpaceLevel, profile: ProfileVisuals): string | undefined =>
  (level === SpaceLevel.L0 ? profile.cardBanner?.uri : profile.avatar?.uri) || undefined;
