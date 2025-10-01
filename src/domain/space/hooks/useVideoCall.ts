import { usePlatformLevelAuthorizationQuery, useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { defaultSpaceSettings } from '../../spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export const useVideoCall = (spaceId?: string, requiredPrivilege = AuthorizationPrivilege.Read) => {
  const { data, loading: loadingAuthorizationPrivileges } = usePlatformLevelAuthorizationQuery();

  const hasRequiredPrivilege = data?.platform?.authorization?.myPrivileges?.includes(requiredPrivilege);

  const { data: spaceSettings, loading: loadingSpaceSettings } = useSpaceSettingsQuery({
    variables: { spaceId: spaceId || '' },
    skip: !spaceId || !hasRequiredPrivilege || loadingAuthorizationPrivileges,
  });

  const allowMembersToVideoCall =
    spaceSettings?.lookup?.space?.settings.collaboration.allowMembersToVideoCall ??
    defaultSpaceSettings.collaboration.allowMembersToVideoCall;

  return {
    isVideoCallEnabled: allowMembersToVideoCall,
    loading: loadingSpaceSettings || loadingAuthorizationPrivileges,
  };
};
