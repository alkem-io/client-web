import { useCurrentUserContext } from './useCurrentUserContext';
import { buildMembershipSettingsUrl } from '@/main/routing/urlBuilders';
import { UserDetailsFragment } from '@/core/apollo/generated/graphql-schema';

export const useHomeSpaceSettings = () => {
  const { userModel } = useCurrentUserContext();

  // Cast to the actual GraphQL type which includes settings
  const user = userModel as UserDetailsFragment | undefined;

  const homeSpaceId = user?.settings?.homeSpace?.spaceID;
  const membershipSettingsUrl = buildMembershipSettingsUrl(user?.profile?.url);

  return {
    homeSpaceId,
    membershipSettingsUrl,
  };
};
