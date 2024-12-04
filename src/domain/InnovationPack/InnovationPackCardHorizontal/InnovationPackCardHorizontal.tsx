import { Box, Skeleton, useTheme } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import RouterLink from '@/core/ui/link/RouterLink';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { BlockTitle } from '@/core/ui/typography';
import InnovationPackIcon from '../InnovationPackIcon';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import OneLineMarkdown from '@/core/ui/markdown/OneLineMarkdown';
import { RoundedBadgeSize } from '@/core/ui/icon/RoundedBadge';

export interface InnovationPackCardHorizontalProps {
  profile: {
    displayName: string;
    description?: string;
    url: string;
  };
  templates?: {
    calloutTemplatesCount?: number;
    collaborationTemplatesCount?: number;
    communityGuidelinesTemplatesCount?: number;
    postTemplatesCount?: number;
    whiteboardTemplatesCount?: number;
  };
  actions?: React.ReactNode;
  size?: RoundedBadgeSize;
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
  profile: { displayName, description, url },
  actions = undefined,
  size = 'medium',
}: InnovationPackCardHorizontalProps) => (
  <BadgeCardView
    visual={
      <RoundedIcon
        size={size}
        component={InnovationPackIcon}
        sx={{
          color: theme => theme.palette.neutral.light,
          background: theme => theme.palette.background.paper,
        }}
      />
    }
    component={RouterLink}
    to={url ?? ''}
    actions={actions && <ActionsMenu>{actions}</ActionsMenu>}
  >
    <Box display="flex" flexDirection="row" justifyContent="space-between">
      <Box display="flex" flexDirection="column">
        <BlockTitle>{displayName}</BlockTitle>
        <OneLineMarkdown>{description ?? ''}</OneLineMarkdown>
      </Box>
    </Box>
  </BadgeCardView>
);

export default InnovationPackCardHorizontal;
