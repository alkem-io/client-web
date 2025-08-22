import { Box, Skeleton } from '@mui/material';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import SpaceAvatar from '@/domain/space/components/SpaceAvatar';
import RouterLink from '@/core/ui/link/RouterLink';
import { BlockTitle } from '@/core/ui/typography';
import OneLineMarkdown from '@/core/ui/markdown/OneLineMarkdown';
import { gutters } from '@/core/ui/grid/utils';
import { buildInnovationHubUrl } from '@/main/routing/urlBuilders';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import { AvatarSize } from '@/core/ui/avatar/Avatar';

export const InnovationHubCardHorizontalSkeleton = () => (
  <BadgeCardView
    visual={
      <Box width={gutters(2)} height={gutters(3)}>
        <Skeleton height="100%" />
      </Box>
    }
  >
    <Skeleton />
    <Skeleton />
  </BadgeCardView>
);

export interface InnovationHubCardHorizontalProps extends InnovationHubSpacesProps {
  profile: {
    displayName: string;
    description?: string;
    banner?: {
      uri: string;
    };
    url: string;
  };
  subdomain: string;
  size?: AvatarSize;
}

type InnovationHubSpacesProps = {
  actions?: React.ReactNode;
};

const InnovationHubCardHorizontal = ({
  profile: { displayName, description, banner },
  subdomain,
  actions = undefined,
  size = 'medium',
}: InnovationHubCardHorizontalProps) => {
  return (
    <BadgeCardView
      visual={<SpaceAvatar src={banner?.uri} size={size} alt={displayName} />}
      component={RouterLink}
      to={buildInnovationHubUrl(subdomain)}
      target="_blank"
      strict
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

export default InnovationHubCardHorizontal;
