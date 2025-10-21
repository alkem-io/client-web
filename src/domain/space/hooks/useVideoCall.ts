import {
  useSpacePrivilegesQuery,
  useSpaceSettingsQuery,
  useSpaceStorageAggregatorIdQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { defaultSpaceSettings } from '../../spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';

export const useVideoCall = (spaceId?: string, requiredPrivilege = AuthorizationPrivilege.Read) => {
  const { data, loading: loadingAuthorizationPrivileges } = useSpacePrivilegesQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId,
  });

  const hasRequiredPrivilege = data?.lookup?.space?.authorization?.myPrivileges?.includes(requiredPrivilege);

  const { data: spaceSettings, loading: loadingSpaceSettings } = useSpaceSettingsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId || !hasRequiredPrivilege || loadingAuthorizationPrivileges,
  });

  const { data: storageData, loading: loadingStorageAggregator } = useSpaceStorageAggregatorIdQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId || !hasRequiredPrivilege || loadingAuthorizationPrivileges,
  });

  const allowMembersToVideoCall =
    spaceSettings?.lookup?.space?.settings.collaboration.allowMembersToVideoCall ??
    defaultSpaceSettings.collaboration.allowMembersToVideoCall;

  const storageAggregatorId = storageData?.lookup?.space?.storageAggregator?.id;

  return {
    isVideoCallEnabled: allowMembersToVideoCall,
    storageAggregatorId,
    loading: loadingSpaceSettings || loadingAuthorizationPrivileges || loadingStorageAggregator,
  };
};
