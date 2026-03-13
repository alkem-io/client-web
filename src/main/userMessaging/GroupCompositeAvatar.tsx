import { Box, SxProps, Theme } from '@mui/material';
import MuiAvatar from '@mui/material/Avatar';
import { gutters } from '@/core/ui/grid/utils';
import { ConversationMember } from './useUserConversations';

type CompositeAvatarSize = 'medium' | 'large';

const sizeMultiplier: Record<CompositeAvatarSize, number> = {
  medium: 2,
  large: 4,
};

interface GroupCompositeAvatarProps {
  members: ConversationMember[];
  size?: CompositeAvatarSize;
  sx?: SxProps<Theme>;
}

export const GroupCompositeAvatar = ({ members, size = 'medium', sx }: GroupCompositeAvatarProps) => {
  const displayMembers = members.length > 4 ? members.slice(0, 4) : members;
  const count = displayMembers.length;
  const containerSize = gutters(sizeMultiplier[size]);

  if (count < 2) return null;

  return (
    <Box
      sx={{
        width: containerSize,
        height: containerSize,
        borderRadius: 0.5,
        overflow: 'hidden',
        display: 'grid',
        gap: '1px',
        backgroundColor: 'divider',
        flexShrink: 0,
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: count === 2 ? '1fr' : '1fr 1fr',
        ...sx,
      }}
    >
      {displayMembers.map((member, index) => (
        <MuiAvatar
          key={member.id}
          src={member.avatarUri}
          alt={member.displayName}
          variant="square"
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 0,
            fontSize: containerSize,
            // For 3 members: first member spans both rows on the left
            ...(count === 3 &&
              index === 0 && {
                gridRow: '1 / -1',
              }),
          }}
        />
      ))}
    </Box>
  );
};
