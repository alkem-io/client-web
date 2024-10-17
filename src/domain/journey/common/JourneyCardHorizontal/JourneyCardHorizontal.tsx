import React, { ReactNode } from 'react';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import {
  Chip,
  ListItemButton,
  ListItemButtonProps,
  ListItemButtonTypeMap,
  Paper,
  PaperProps,
  Skeleton,
  Typography,
} from '@mui/material';
import { Caption } from '../../../../core/ui/typography';
import { Visual } from '../../../common/visual/Visual';
import withElevationOnHover from '../../../shared/components/withElevationOnHover';
import RouterLink, { RouterLinkProps } from '../../../../core/ui/link/RouterLink';
import { JourneyTypeName } from '../../JourneyTypeName';
import spaceIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import BlockTitleWithIcon from '../../../../core/ui/content/BlockTitleWithIcon';
import { CommunityRoleType } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { intersection } from 'lodash';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import JourneyAvatar from '../JourneyAvatar/JourneyAvatar';
import ActionsMenu from '../../../../core/ui/card/ActionsMenu';
import { AvatarSize } from '../../../../core/ui/avatar/Avatar';

export const JourneyCardHorizontalSkeleton = () => (
  <ElevatedPaper sx={{ padding: gutters() }}>
    <BadgeCardView
      visual={<Skeleton variant="rectangular" sx={{ borderRadius: 0.5, width: gutters(3), height: gutters(3) }} />}
    >
      <Skeleton />
      <Skeleton />
    </BadgeCardView>
  </ElevatedPaper>
);

export interface JourneyCardHorizontalProps {
  journey: {
    profile: {
      url: string;
      displayName: string;
      tagline?: string;
      avatar?: Visual;
      cardBanner?: Visual;
    };
    community?: {
      roleSet?: {
        myRoles?: CommunityRoleType[];
      };
    };
  };
  deepness?: number;
  seamless?: boolean;
  journeyTypeName: JourneyTypeName;
  sx?: PaperProps['sx'];
  actions?: ReactNode;
  size?: AvatarSize;
  disableHoverState?: boolean;
}

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const VISIBLE_COMMUNITY_ROLES = [CommunityRoleType.Admin, CommunityRoleType.Lead] as const;

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = Record<string, unknown>>(
  props: ListItemButtonProps<D, P> & RouterLinkProps
) => <ListItemButton component={RouterLink} {...props} />;

const JourneyCardHorizontal = ({
  journey,
  journeyTypeName,
  deepness = journeyTypeName === 'subspace' ? 0 : 1,
  seamless,
  sx,
  actions,
  size,
  disableHoverState = false,
}: JourneyCardHorizontalProps) => {
  const Icon = spaceIcon[journeyTypeName];

  const { t } = useTranslation();

  const [communityRole] = intersection(VISIBLE_COMMUNITY_ROLES, journey.community?.roleSet?.myRoles);

  const mergedSx: PaperProps['sx'] = {
    padding: gutters(),
    marginLeft: gutters(deepness * 2),
    borderRadius: 'unset',
    ...sx,
  };

  return (
    <ElevatedPaper sx={mergedSx} elevation={seamless ? 0 : undefined}>
      <BadgeCardView
        visual={<JourneyAvatar size={size} src={journey.profile.avatar?.uri || journey.profile.cardBanner?.uri} />}
        component={disableHoverState ? RouterLink : Wrapper}
        to={journey.profile.url}
        actions={actions && <ActionsMenu>{actions}</ActionsMenu>}
      >
        <BlockTitleWithIcon title={journey.profile.displayName} icon={<Icon />} sx={{ height: gutters(1.5) }}>
          <FlexSpacer />
          {communityRole && (
            <Chip
              variant="filled"
              color="primary"
              label={
                <Typography variant="button">{t(`common.enums.communityRole.${communityRole}` as const)}</Typography>
              }
            />
          )}
        </BlockTitleWithIcon>
        <Caption noWrap component="div" lineHeight={gutters(1.5)}>
          {journey.profile.tagline}
        </Caption>
      </BadgeCardView>
    </ElevatedPaper>
  );
};

export default JourneyCardHorizontal;
