import { Trans, useTranslation } from 'react-i18next';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, CardText, PageTitle } from '../../../../../core/ui/typography';
import { buildJourneyUrl, JourneyLocation } from '../../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../JourneyTypeName';
import React from 'react';
import journeyIcon from '../../../../shared/components/JourneyIcon/JourneyIcon';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import { Box, BoxProps, SxProps } from '@mui/material';
import JourneyAvatar from '../../JourneyAvatar/JourneyAvatar';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { Visual } from '../../../../common/visual/Visual';
import { alpha } from '@mui/material/styles';
import RouterLink from '../../../../../core/ui/link/RouterLink';

type ChildJourneyTypeName = Exclude<JourneyTypeName, 'space'>;

type StickSide = 'left';

export interface JourneyPageBannerCardProps extends BoxProps {
  parentJourneyDisplayName: string;
  parentJourneyLocation: JourneyLocation;
  journeyTypeName: ChildJourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string;
  journeyAvatar: Visual | undefined;
  journeyTags: string[] | undefined;
  stick?: StickSide;
}

const getParentJourneyTypeName = (journeyTypeName: ChildJourneyTypeName): JourneyTypeName => {
  switch (journeyTypeName) {
    case 'challenge': {
      return 'space';
    }
    case 'opportunity': {
      return 'challenge';
    }
  }
};

const getBorderRadiusOverride = (stickSide?: StickSide): SxProps => {
  switch (stickSide) {
    case 'left': {
      return {
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
      };
    }
  }
  return {};
};

const JourneyPageBannerCard = ({
  journeyDisplayName,
  journeyTagline,
  journeyTypeName,
  journeyAvatar,
  journeyTags = [],
  parentJourneyDisplayName,
  parentJourneyLocation,
  stick,
  ...boxProps
}: JourneyPageBannerCardProps) => {
  const { t } = useTranslation();

  const JourneyIcon = journeyIcon[journeyTypeName];

  const parentJourneyTypeName = getParentJourneyTypeName(journeyTypeName);

  const ParentJourneyIcon = journeyIcon[parentJourneyTypeName];

  return (
    <Gutters
      paddingTop={gutters(0.5)}
      gap={gutters(0.5)}
      sx={{
        backgroundColor: theme => alpha(theme.palette.background.paper, 0.7),
        borderRadius: theme => `${theme.shape.borderRadius}px`,
        ...getBorderRadiusOverride(stick),
      }}
      {...boxProps}
    >
      <CardText>
        <RouterLink to={buildJourneyUrl(parentJourneyLocation) ?? ''}>
          <Trans
            i18nKey="components.journeyPageBannerCard.parentJourney"
            values={{ journey: parentJourneyDisplayName }}
            components={{
              journeyicon: (
                <ParentJourneyIcon
                  fontSize="inherit"
                  sx={{
                    marginX: theme => theme.spacing(0.25),
                    verticalAlign: 'middle',
                  }}
                />
              ),
            }}
            t={t}
          />
        </RouterLink>
      </CardText>
      <BadgeCardView
        visual={
          <JourneyAvatar
            visualUri={journeyAvatar?.uri}
            journeyTypeName={journeyTypeName}
            hideJourneyIcon={!!journeyAvatar?.uri}
          />
        }
      >
        <Box display="flex" flexDirection="column" gap={gutters(0.5)}>
          <PageTitle color="primary" noWrap>
            <JourneyIcon fontSize="inherit" sx={{ marginRight: gutters(0.25), verticalAlign: 'bottom' }} />
            {journeyDisplayName}
          </PageTitle>
          <Caption color="primary" fontStyle="italic" noWrap>
            {journeyTagline}
          </Caption>
          <TagsComponent tags={journeyTags} color="primary" minHeight={gutters()} variant="filled" />
        </Box>
      </BadgeCardView>
    </Gutters>
  );
};

export default JourneyPageBannerCard;
