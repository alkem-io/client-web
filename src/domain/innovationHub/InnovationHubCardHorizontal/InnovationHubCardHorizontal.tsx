import { Box, Skeleton } from '@mui/material';
import BadgeCardView from '@core/ui/list/BadgeCardView';
import JourneyAvatar from '../../journey/common/JourneyAvatar/JourneyAvatar';
import RouterLink from '@core/ui/link/RouterLink';
import { Caption, CardTitle } from '@core/ui/typography';
import OneLineMarkdown from '@core/ui/markdown/OneLineMarkdown';
import { SpaceVisibility } from '@core/apollo/generated/graphql-schema';
import { gutters } from '@core/ui/grid/utils';
import { useTranslation } from 'react-i18next';
import { buildInnovationHubUrl } from '@main/routing/urlBuilders';
import ActionsMenu from '@core/ui/card/ActionsMenu';
import { AvatarSize } from '@core/ui/avatar/Avatar';

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

interface InnovationHubSpacesProps {
  spaceVisibilityFilter?: SpaceVisibility;
  spaceListFilter?: {
    id: string;
    profile: {
      displayName: string;
    };
  }[];
  actions?: React.ReactNode;
}

const InnovationHubSpaces = ({ spaceVisibilityFilter, spaceListFilter }: InnovationHubSpacesProps) => {
  const { t } = useTranslation();
  if (spaceVisibilityFilter) {
    return <Caption>{t(`common.enums.space-visibility.${spaceVisibilityFilter}` as const)}</Caption>;
  }
  if (spaceListFilter && spaceListFilter.length) {
    const spaceList = spaceListFilter.map(({ profile: { displayName } }) => displayName).join(', ');
    return (
      <Caption maxWidth={gutters(7)} noWrap textOverflow="ellipsis" overflow="hidden" title={spaceList}>
        {spaceList}
      </Caption>
    );
  }
  return null;
};

const InnovationHubCardHorizontal = ({
  profile: { displayName, description, banner },
  subdomain,
  actions = undefined,
  size = 'medium',
  ...spaces
}: InnovationHubCardHorizontalProps) => {
  return (
    <BadgeCardView
      visual={<JourneyAvatar src={banner?.uri} size={size} />}
      component={RouterLink}
      to={buildInnovationHubUrl(subdomain)}
      target="_blank"
      strict
      actions={actions && <ActionsMenu>{actions}</ActionsMenu>}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <Box display="flex" flexDirection="column">
          <CardTitle>{displayName}</CardTitle>
          <OneLineMarkdown>{description ?? ''}</OneLineMarkdown>
        </Box>
        <InnovationHubSpaces {...spaces} />
      </Box>
    </BadgeCardView>
  );
};

export default InnovationHubCardHorizontal;
