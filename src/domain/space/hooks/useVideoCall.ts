import {
  useSpacePrivilegesQuery,
  useSpaceSettingsQuery,
  useSpaceStorageAggregatorIdQuery,
} from '@/core/apollo/generated/apollo-hooks';
import { defaultSpaceSettings } from '../../spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';
import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { buildVideoCallUrl } from '@/main/routing/urlBuilders';

export const useVideoCall = (spaceId?: string, spaceNameId = '', requiredPrivilege = AuthorizationPrivilege.Read) => {
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

  const storageAggregatorId = storageData?.lookup?.space?.storageAggregator?.id;

  const allowMembersToVideoCall = Boolean(
    (spaceSettings?.lookup?.space?.settings.collaboration.allowMembersToVideoCall && storageAggregatorId) ||
      defaultSpaceSettings.collaboration.allowMembersToVideoCall
  );

  const videoCallUrl = buildVideoCallUrl(storageAggregatorId, spaceNameId);

  return {
    isVideoCallEnabled: allowMembersToVideoCall,
    videoUrlId: storageAggregatorId,
    videoCallUrl,
    loading: loadingSpaceSettings || loadingAuthorizationPrivileges || loadingStorageAggregator,
  };
};
