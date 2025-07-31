import RoundedBadge from '@/core/ui/icon/RoundedBadge';
import { RealTimeCollaborationState } from './RealTimeCollaborationState';
import { SaveRequestIndicatorIcon } from './SaveRequestIndicatorIcon';
import { Box, Tooltip } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';

interface UserPresencingProps {
  collaborationState: RealTimeCollaborationState | undefined;
}

const UserPresencing = ({ collaborationState }: UserPresencingProps) => {
  if (!collaborationState || collaborationState.status === 'disconnected') {
    return <SaveRequestIndicatorIcon isSaved={false} date={undefined} />;
  }
  return (
    <>
      <SaveRequestIndicatorIcon isSaved date={collaborationState.lastActive} />
      <Box display="flex" gap={gutters(0.5)} sx={{ cursor: 'pointer' }}>
        {collaborationState.users.map(user => (
          <Tooltip title={user.profile.displayName} key={user.id} arrow>
            <span>
              <RoundedBadge size="small" color={user.color}>
                {user.profile.displayName && user.profile.displayName.length
                  ? user.profile.displayName[0].toUpperCase()
                  : '?'}
              </RoundedBadge>
            </span>
          </Tooltip>
        ))}
      </Box>
    </>
  );
};

export default UserPresencing;
