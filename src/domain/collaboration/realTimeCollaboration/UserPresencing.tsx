import { Box, Tooltip } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import RoundedBadge from '@/core/ui/icon/RoundedBadge';
import type { RealTimeCollaborationState } from './RealTimeCollaborationState';
import { SaveRequestIndicatorIcon } from './SaveRequestIndicatorIcon';

interface UserPresencingProps {
  collaborationState: RealTimeCollaborationState | undefined;
  hideSaveRequestIndicator?: boolean;
}

const UserPresencing = ({ collaborationState, hideSaveRequestIndicator }: UserPresencingProps) => {
  if (!collaborationState || collaborationState.status === 'disconnected') {
    return <SaveRequestIndicatorIcon isSaved={false} date={undefined} />;
  }
  return (
    <>
      {!hideSaveRequestIndicator && <SaveRequestIndicatorIcon isSaved={true} date={collaborationState.lastActive} />}
      <Box display="flex" gap={gutters(0.5)} sx={{ cursor: 'pointer' }}>
        {collaborationState.users.map(user => (
          <Tooltip title={user.profile.displayName} key={user.id} arrow={true}>
            <span>
              <RoundedBadge size="small" color={user.color}>
                {user.profile.displayName?.length ? user.profile.displayName[0].toUpperCase() : '?'}
              </RoundedBadge>
            </span>
          </Tooltip>
        ))}
      </Box>
    </>
  );
};

export default UserPresencing;
