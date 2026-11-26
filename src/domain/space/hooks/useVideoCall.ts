import { pageSpace } from '@/domain/space/context/spacePageShellMapper';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';

/**
 * 021 T006/L062: the space's video-call room from its D2 Space document in the page cache (no request): enabled when
 * the space lets members video call (`settings.permissions.members_video_call`) and the viewer can read its room.
 * The second argument is legacy's room-name input; the server names the room natively.
 */
export const useVideoCall = (spaceId?: string, _spaceNameId?: string) => {
  const space = pageSpace(useSpacePageData(spaceId, 'space')?.node, spaceId);
  const settings = space?.settings as { permissions?: { members_video_call?: boolean } } | null | undefined;

  return {
    isVideoCallEnabled: settings?.permissions?.members_video_call === true && Boolean(space?.videoCallUrl),
    videoCallUrl: space?.videoCallUrl ?? '',
    loading: Boolean(spaceId) && !space,
  };
};
