import { useParentSpaceInfoQuery } from '@/core/apollo/generated/apollo-hooks';

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
  const parentInfo = (() => {
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
  })();

  // Get parent avatar URI for collectSubspaceAvatars. Avatar position — never substitute cardBanner.
  // L0 parents have no avatar; the consumer (collectSubspaceAvatars) skips the parent entry when
  // parentAvatarUri is undefined.
  const parentAvatarUri = parentSpace?.about?.profile?.avatar?.uri || undefined;

  const parentDisplayName = parentSpace?.about?.profile.displayName;

  return {
    parentInfo,
    parentAvatarUri,
    parentDisplayName,
    loading,
  };
};
