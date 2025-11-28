import { useMemo } from 'react';
import { useParentSpaceInfoQuery } from '@/core/apollo/generated/apollo-hooks';
import { ParentInfo } from './useSubspaceCardData';

/**
 * Hook to fetch and format parent space information for SpaceCard
 * @param parentSpaceId - UUID of the parent space
 * @returns parentInfo object for SpaceCard and parentAvatarUri for collectSubspaceAvatars
 */
export const useParentSpaceInfo = (parentSpaceId?: string) => {
  const { data, loading } = useParentSpaceInfoQuery({
    variables: { spaceId: parentSpaceId! },
    skip: !parentSpaceId,
  });

  const parentSpace = data?.lookup.space;

  // Create parent info for SpaceCard
  const parentInfo = useMemo<ParentInfo | undefined>(() => {
    if (!parentSpace?.about?.profile) {
      return undefined;
    }

    return {
      displayName: parentSpace.about.profile.displayName,
      url: parentSpace.about.profile.url || '',
      avatar: parentSpace.about.profile.avatar
        ? {
            id: '',
            uri: parentSpace.about.profile.avatar.uri,
            alternativeText: parentSpace.about.profile.avatar.alternativeText || '',
          }
        : undefined,
    };
  }, [parentSpace]);

  // Get parent avatar URI for collectSubspaceAvatars
  const parentAvatarUri = useMemo<string | undefined>(() => {
    if (!parentSpace?.about?.profile) {
      return undefined;
    }

    return parentSpace.about.profile.avatar?.uri || parentSpace.about.profile.cardBanner?.uri;
  }, [parentSpace]);

  const parentDisplayName = parentSpace?.about?.profile.displayName;

  return {
    parentInfo,
    parentAvatarUri,
    parentDisplayName,
    loading,
  };
};
