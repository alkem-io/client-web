import React, { ReactNode, useState } from 'react';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { Chip, IconButton, Menu, Paper, PaperProps, Skeleton, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Caption } from '../../../../core/ui/typography';
import { Visual } from '../../../common/visual/Visual';
import withElevationOnHover from '../../../shared/components/withElevationOnHover';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { JourneyTypeName } from '../../JourneyTypeName';
import JourneyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import BlockTitleWithIcon from '../../../../core/ui/content/BlockTitleWithIcon';
import { CommunityRole } from '../../../../core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { intersection } from 'lodash';
import FlexSpacer from '../../../../core/ui/utils/FlexSpacer';
import JourneyAvatar from '../JourneyAvatar/JourneyAvatar';
import Gutters from '../../../../core/ui/grid/Gutters';

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
      tagline: string;
      avatar?: Visual;
      cardBanner?: Visual;
    };
    community?: {
      myRoles?: CommunityRole[];
    };
  };
  deepness?: number;
  seamless?: boolean;
  journeyTypeName: JourneyTypeName;
  sx?: PaperProps['sx'];
  actions?: ReactNode;
}

const ElevatedPaper = withElevationOnHover(Paper) as typeof Paper;

const VISIBLE_COMMUNITY_ROLES = [CommunityRole.Admin, CommunityRole.Lead] as const;

const JourneyCardHorizontal = ({
  journey,
  journeyTypeName,
  deepness = journeyTypeName === 'subspace' ? 0 : 1,
  seamless,
  sx,
  actions,
}: JourneyCardHorizontalProps) => {
  const Icon = JourneyIcon[journeyTypeName];

  const { t } = useTranslation();

  const [communityRole] = intersection(VISIBLE_COMMUNITY_ROLES, journey.community?.myRoles);

  const mergedSx: PaperProps['sx'] = {
    padding: gutters(),
    marginLeft: gutters(deepness * 2),
    ...sx,
  };

  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const settingsOpened = Boolean(settingsAnchorEl);
  const handleSettingsOpened = (event: React.MouseEvent<HTMLElement>) => setSettingsAnchorEl(event.currentTarget);
  const handleSettingsClose = () => setSettingsAnchorEl(null);

  return (
    <ElevatedPaper sx={mergedSx} elevation={seamless ? 0 : undefined}>
      <BadgeCardView
        visual={
          <JourneyAvatar
            src={journey.profile.avatar?.uri || journey.profile.cardBanner?.uri}
            sx={{ width: gutters(3), height: gutters(3) }}
          />
        }
        actions={
          actions && (
            <>
              <IconButton
                aria-label={t('common.settings')}
                aria-haspopup="true"
                aria-controls={settingsOpened ? 'settings-menu' : undefined}
                aria-expanded={settingsOpened ? 'true' : undefined}
                onClick={handleSettingsOpened}
              >
                <MoreVertIcon color="primary" />
              </IconButton>
              <Menu
                aria-labelledby="settings-button"
                anchorEl={settingsAnchorEl}
                open={settingsOpened}
                onClose={handleSettingsClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {actions}
              </Menu>
            </>
          )
        }
      >
        <Gutters disableGap disablePadding component={RouterLink} to={journey.profile.url}>
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
        </Gutters>
      </BadgeCardView>
    </ElevatedPaper>
  );
};

export default JourneyCardHorizontal;
