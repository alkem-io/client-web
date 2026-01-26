import { Box, Skeleton, useTheme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { BlockTitle } from '@/core/ui/typography';
import InnovationPackIcon from '../InnovationPackIcon';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import OneLineMarkdown from '@/core/ui/markdown/OneLineMarkdown';
import Avatar, { AvatarSize } from '@/core/ui/avatar/Avatar';

export interface InnovationPackCardHorizontalProps {
  profile: {
    displayName: string;
    description?: string;
    url: string;
    avatar?: {
      uri?: string;
      alternativeText?: string;
    };
  };
  templates?: {
    calloutTemplatesCount?: number;
    spaceTemplatesCount?: number;
    communityGuidelinesTemplatesCount?: number;
    postTemplatesCount?: number;
    whiteboardTemplatesCount?: number;
  };
  actions?: React.ReactNode;
  size?: AvatarSize;
}

export const InnovationPackCardHorizontalSkeleton = () => {
  const theme = useTheme();
  return (
    <BadgeCardView visual={<Skeleton height={gutters(2)(theme)} width={gutters(2)(theme)} variant="circular" />}>
      <Skeleton />
      <Skeleton />
    </BadgeCardView>
  );
};

const InnovationPackCardHorizontal = ({
  profile: { displayName, description, url, avatar },
  actions = undefined,
  size = 'medium',
}: InnovationPackCardHorizontalProps) => {
  const visual = avatar?.uri ? (
    <Avatar size={size} src={avatar.uri} alt={avatar.alternativeText ?? displayName} />
  ) : (
    <InnovationPackIcon color="primary" />
  );

  return (
    <BadgeCardView
      visual={visual}
      component={RouterLink}
      to={url ?? ''}
      actions={actions ? <ActionsMenu>{actions}</ActionsMenu> : undefined}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <BlockTitle>{displayName}</BlockTitle>
          <OneLineMarkdown>{description ?? ''}</OneLineMarkdown>
        </Box>
      </Box>
    </BadgeCardView>
  );
};

export default InnovationPackCardHorizontal;
