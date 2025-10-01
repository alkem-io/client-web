import { useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import { defaultSpaceSettings } from '../../spaceAdmin/SpaceAdminSettings/SpaceDefaultSettings';

export const useVideoCall = (spaceId?: string) => {
  const { data: spaceSettings, loading } = useSpaceSettingsQuery({
    variables: { spaceId: spaceId || '' },
    skip: !spaceId,
  });

  const allowMembersToVideoCall =
    spaceSettings?.lookup?.space?.settings.collaboration.allowMembersToVideoCall ??
    defaultSpaceSettings.collaboration.allowMembersToVideoCall;

  return { isVideoCallEnabled: allowMembersToVideoCall, loading };
};
