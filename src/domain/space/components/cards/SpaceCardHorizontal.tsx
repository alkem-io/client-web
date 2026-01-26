import React, { ReactNode } from 'react';
import { ParseKeys } from 'i18next';
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
import { LicenseEntitlementType, RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { intersection } from 'lodash';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import SpaceAvatar from '../SpaceAvatar';
import ActionsMenu from '@/core/ui/card/ActionsMenu';
import { AvatarSize } from '@/core/ui/avatar/Avatar';
import { spaceLevelIcon } from '@/domain/space/icons/SpaceIconByLevel';
import { SpaceAboutLightModel } from '@/domain/space/about/model/spaceAboutLight.model';
import { getSpaceSubscriptionLevel } from '@/domain/space/license/utils';

export const SpaceCardHorizontalSkeleton = () => (
  <ElevatedPaper sx={{ padding: gutters() }}>
    <BadgeCardView
      visual={<Skeleton variant="rectangular" sx={{ borderRadius: 0.5, width: gutters(3), height: gutters(3) }} />}
    >
      <Skeleton />
      <Skeleton />
    </BadgeCardView>
  </ElevatedPaper>
);

export interface SpaceCardHorizontalProps {
  space: {
    id?: string;
    about: SpaceAboutLightModel;
    community?: {
      roleSet?: {
        myRoles?: RoleName[];
      };
    };
    level: SpaceLevel;
    license?: {
      availableEntitlements?: LicenseEntitlementType[];
    };
  };
  deepness?: number;
  withIcon?: boolean;
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

const SpaceCardHorizontal = ({
  space,
  deepness = !space.level || space.level === SpaceLevel.L1 ? 0 : 1,
  withIcon = true,
  seamless,
  sx,
  actions,
  size,
  disableHoverState = false,
  disableTagline = false,
}: SpaceCardHorizontalProps) => {
  const Icon = withIcon && space.level ? spaceLevelIcon[space.level] : undefined;

  const { t } = useTranslation();

  const [communityRole] = intersection(VISIBLE_COMMUNITY_ROLES, space.community?.roleSet?.myRoles);

  const spaceSubscriptionLevel = getSpaceSubscriptionLevel(space.license?.availableEntitlements ?? []);

  const mergedSx: PaperProps['sx'] = {
    padding: gutters(),
    marginLeft: gutters(deepness * 2),
    borderRadius: 'unset',
    '&:focus-within': {
      outline: '2px solid',
      outlineColor: 'rgba(236, 57, 141, 0.65)',
      borderRadius: '12px',
    },
    ...sx,
  };

  return (
    <ElevatedPaper sx={mergedSx} elevation={seamless ? 0 : undefined}>
      <BadgeCardView
        visual={
          <SpaceAvatar
            size={size}
            // Use || instead of ?? here, because uri can be an empty string
            src={space.about.profile.avatar?.uri || space.about.profile.cardBanner?.uri}
            alt={space.about.profile.displayName}
            spaceId={space.id}
          />
        }
        component={disableHoverState ? RouterLink : Wrapper}
        to={space.about.profile.url}
        actions={actions ? <ActionsMenu>{actions}</ActionsMenu> : undefined}
      >
        <BlockTitleWithIcon title={space.about.profile.displayName} icon={Icon ? <Icon /> : undefined}>
          <FlexSpacer />

          {spaceSubscriptionLevel && (
            <Chip
              variant="filled"
              color="default"
              label={t(`common.enums.licenseEntitlementType.${spaceSubscriptionLevel}` as ParseKeys)}
            />
          )}
          {communityRole && (
            <Chip
              variant="filled"
              color="primary"
              label={<Typography variant="button">{t(`common.roles.${communityRole}` as ParseKeys)}</Typography>}
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

export default SpaceCardHorizontal;
