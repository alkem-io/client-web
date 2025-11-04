import { useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { ApolloError } from '@apollo/client';
import { defaultSpaceSettings } from '@/domain/spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';

interface UseSpaceGuestContributionsResult {
  allowGuestContributions: boolean;
  loading: boolean;
  error?: ApolloError;
}

export const useSpaceGuestContributions = (spaceId: string): UseSpaceGuestContributionsResult => {
  const { data, loading, error } = useSpaceSettingsQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  return {
    allowGuestContributions:
      data?.lookup?.space?.settings?.collaboration?.allowGuestContributions ??
      defaultSpaceSettings.collaboration.allowGuestContributions,
    loading,
    error,
  };
};
