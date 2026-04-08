/**
 * Data Mapper Contract
 *
 * Pure functions that bridge GraphQL types → CRD component props.
 * Implementation lives alongside the CRD view in src/main/topLevelPages/topLevelSpaces/.
 *
 * These mappers are the ONLY place where GraphQL types meet CRD view types.
 */

import type { SpaceCardData, SpaceLead, SpaceCardParent } from './crd-space-card';

// --- Types from the existing data layer (for reference, not imported in CRD) ---

// SpaceWithParent comes from SpaceExplorerView.tsx
// SpaceAboutLightModel comes from src/domain/space/about/model/spaceAboutLight.model.ts
// These are used by the mapper but never by CRD components.

/**
 * mapSpaceToCardData(space: SpaceWithParent, authenticated: boolean): SpaceCardData
 *
 * Maps a single GraphQL SpaceWithParent to the CRD SpaceCardData view model.
 *
 * Responsibilities:
 * - Extract profile fields (name, tagline, banner, tags, url)
 * - Derive initials from displayName
 * - Derive avatarColor from space.id
 * - Flatten leadUsers + leadOrganizations into SpaceLead[]
 * - Build parent info if space.parent exists
 * - Negate isContentPublic → isPrivate
 */

/**
 * mapSpacesToCardDataList(spaces: SpaceWithParent[], authenticated: boolean): SpaceCardData[]
 *
 * Maps an array of spaces. Convenience wrapper around mapSpaceToCardData.
 */

/**
 * getInitials(displayName: string): string
 *
 * "Green Energy Space" → "GE"
 * "Alkemio" → "A"
 * "Community Building Lab" → "CB"
 *
 * Takes first letter of first two words, uppercased.
 */

/**
 * getAvatarColor(id: string): string
 *
 * Deterministic color from a fixed palette based on a simple hash of the ID.
 * Returns a CSS hex color string.
 *
 * Palette: 10 distinct, accessible colors that work on both light and dark backgrounds.
 */
