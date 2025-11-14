import { useMemo } from 'react';
import { getDefaultSpaceVisualUrl } from '@/domain/space/icons/defaultVisualUrls';
import { VisualType } from '@/core/apollo/generated/graphql-schema';

export interface SubspaceProfile {
  id: string;
  about: {
    profile: {
      displayName: string;
      avatar?: { uri: string; alternativeText?: string };
      cardBanner?: { uri: string; alternativeText?: string };
    };
  };
}

export interface ParentSpaceData {
  id: string;
  about?: {
    profile: {
      id: string;
      displayName: string;
      url?: string;
      avatar?: { uri: string; alternativeText?: string };
      cardBanner?: { uri: string; alternativeText?: string };
    };
  };
}

export interface ParentInfo {
  displayName: string;
  url: string;
  avatar?: {
    id: string;
    uri: string;
    alternativeText: string;
  };
}

// Generic type for spaces with recursive parent hierarchy
export interface WithBanner {
  id?: string;
  about: {
    profile: {
      avatar?: { uri: string; alternativeText?: string };
      cardBanner?: { uri: string; alternativeText?: string };
    };
  };
}

export type WithParent<ParentInfo extends {}> = {
  parent?: ParentInfo & WithParent<ParentInfo>;
};

/**
 * Recursively collects avatars from a space and all its parent spaces
 * Used by SpaceExplorerView which has multi-level parent hierarchy
 */
export const collectParentAvatars = <SpaceWithVisuals extends WithBanner & WithParent<WithBanner>>(
  { about, parent, id }: SpaceWithVisuals,
  initial: { src: string; alt: string }[] = []
): { src: string; alt: string }[] => {
  if (!about?.profile) {
    return initial;
  }

  const { cardBanner, avatar = cardBanner } = about.profile;
  const { uri, alternativeText } = avatar || {};

  // Use default avatar visual if no cardBanner or avatar is available
  const avatarUri = uri || getDefaultSpaceVisualUrl(VisualType.Avatar, id);
  const collected = [
    {
      src: avatarUri,
      alt: alternativeText || '',
    },
    ...initial,
  ];

  return parent ? collectParentAvatars(parent, collected) : collected;
};

/**
 * Helper function to collect avatars for stacking - subspace avatar + parent avatar(s)
 * Parent avatar goes first (back), subspace avatar goes second (front)
 */
export const collectSubspaceAvatars = (
  subspace: SubspaceProfile,
  parentAvatarUri?: string,
  parentDisplayName?: string
): { src: string; alt: string }[] => {
  const avatars: { src: string; alt: string }[] = [];

  // Add subspace's own avatar
  const subspaceAvatarUri =
    subspace.about.profile.avatar?.uri ||
    subspace.about.profile.cardBanner?.uri ||
    getDefaultSpaceVisualUrl(VisualType.Avatar, subspace.id);

  // Add parent avatar first if available (will be in the back)
  if (parentAvatarUri) {
    avatars.push({
      src: parentAvatarUri,
      alt: parentDisplayName || '',
    });
  }

  // Add subspace avatar second (will be in the front)
  avatars.push({
    src: subspaceAvatarUri,
    alt: subspace.about.profile.avatar?.alternativeText || subspace.about.profile.displayName,
  });

  return avatars;
};

/**
 * Hook to extract parent space info for subspace cards
 * Returns parentInfo and parentAvatarUri for use with collectSubspaceAvatars
 */
export const useSubspaceCardData = (parentSpace?: ParentSpaceData | null) => {
  // Create parent info for subspace cards
  const parentInfo = useMemo<ParentInfo | undefined>(() => {
    if (!parentSpace?.about?.profile) {
      return undefined;
    }

    return {
      displayName: parentSpace.about.profile.displayName,
      url: parentSpace.about.profile.url || `/${parentSpace.id}`,
      avatar: parentSpace.about.profile.avatar
        ? {
            id: '',
            uri: parentSpace.about.profile.avatar.uri,
            alternativeText: parentSpace.about.profile.avatar.alternativeText || '',
          }
        : undefined,
    };
  }, [parentSpace?.id, parentSpace?.about?.profile]);

  // Get parent avatar URI for stacking
  const parentAvatarUri = useMemo<string | undefined>(() => {
    if (!parentSpace?.about?.profile) {
      return undefined;
    }

    return (
      parentSpace.about.profile.avatar?.uri ||
      parentSpace.about.profile.cardBanner?.uri ||
      getDefaultSpaceVisualUrl(VisualType.Avatar, parentSpace.id)
    );
  }, [parentSpace?.id, parentSpace?.about?.profile]);

  const parentDisplayName = parentSpace?.about?.profile?.displayName;

  return {
    parentInfo,
    parentAvatarUri,
    parentDisplayName,
    /** Helper function to collect avatars for a specific subspace */
    collectAvatars: (subspace: SubspaceProfile) => collectSubspaceAvatars(subspace, parentAvatarUri, parentDisplayName),
  };
};
