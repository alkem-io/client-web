import React, { ReactNode } from 'react';
import { gutters } from '@/core/ui/grid/utils';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
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
import { Caption } from '@/core/ui/typography';
import withElevationOnHover from '@/domain/shared/components/withElevationOnHover';
import RouterLink, { RouterLinkProps } from '@/core/ui/link/RouterLink';
import BlockTitleWithIcon from '@/core/ui/content/BlockTitleWithIcon';
import { RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { intersection } from 'lodash';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import JourneyAvatar from '../JourneyAvatar/JourneyAvatar';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import { AvatarSize } from '@/core/ui/avatar/Avatar';
import { spaceIconByLevel } from '@/domain/shared/components/SpaceIcon/SpaceIcon';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';

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
  space: {
    about: SpaceAboutLightModel;
    community?: {
      roleSet?: {
        myRoles?: RoleName[];
      };
    };
    level: SpaceLevel;
  };
  deepness?: number;
  seamless?: boolean;
  sx?: PaperProps['sx'];
  actions?: ReactNode;
  size?: AvatarSize;
  disableHoverState?: boolean;
  disableTagline?: boolean;
}

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const VISIBLE_COMMUNITY_ROLES = [RoleName.Admin, RoleName.Lead] as const;

const Wrapper = <D extends React.ElementType = ListItemButtonTypeMap['defaultComponent'], P = Record<string, unknown>>(
  props: ListItemButtonProps<D, P> & RouterLinkProps
) => <ListItemButton component={RouterLink} {...props} />;

const JourneyCardHorizontal = ({
  space,
  deepness = !space.level || space.level === SpaceLevel.L1 ? 0 : 1,
  seamless,
  sx,
  actions,
  size,
  disableHoverState = false,
  disableTagline = false,
}: JourneyCardHorizontalProps) => {
  const Icon = space.level ? spaceIconByLevel[space.level] : undefined;

  const { t } = useTranslation();

  const [communityRole] = intersection(VISIBLE_COMMUNITY_ROLES, space.community?.roleSet?.myRoles);

  const mergedSx: PaperProps['sx'] = {
    padding: gutters(),
    marginLeft: gutters(deepness * 2),
    borderRadius: 'unset',
    ...sx,
  };

  return (
    <ElevatedPaper sx={mergedSx} elevation={seamless ? 0 : undefined}>
      <BadgeCardView
        visual={
          <JourneyAvatar size={size} src={space.about.profile.avatar?.uri || space.about.profile.cardBanner?.uri} />
        }
        component={disableHoverState ? RouterLink : Wrapper}
        to={space.about.profile.url}
        actions={actions && <ActionsMenu>{actions}</ActionsMenu>}
      >
        <BlockTitleWithIcon
          title={space.about.profile.displayName}
          icon={Icon ? <Icon /> : undefined}
          sx={{ height: gutters(1.5) }}
        >
          <FlexSpacer />
          {communityRole && (
            <Chip
              variant="filled"
              color="primary"
              label={<Typography variant="button">{t(`common.roles.${communityRole}` as const)}</Typography>}
            />
          )}
        </BlockTitleWithIcon>
        {!disableTagline && (
          <Caption noWrap component="div" lineHeight={gutters(1.5)}>
            {space.about.profile.tagline}
          </Caption>
        )}
      </BadgeCardView>
    </ElevatedPaper>
  );
};

export default JourneyCardHorizontal;
