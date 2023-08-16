import { useTranslation } from 'react-i18next';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, CardText, PageTitle } from '../../../../../core/ui/typography';
import { buildJourneyUrl, JourneyLocation } from '../../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../JourneyTypeName';
import React from 'react';
import journeyIcon from '../../../../shared/components/JourneyIcon/JourneyIcon';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import { Box, BoxProps, SxProps, useTheme } from '@mui/material';
import JourneyAvatar from '../../JourneyAvatar/JourneyAvatar';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { Visual } from '../../../../common/visual/Visual';
import { alpha } from '@mui/material/styles';
import RouterLink from '../../../../../core/ui/link/RouterLink';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

type ChildJourneyTypeName = Exclude<JourneyTypeName, 'space'>;

type StickSide = 'left';

export interface JourneyPageBannerCardProps extends BoxProps {
  parentJourneys?: {
    displayName: string;
    journeyTypeName: JourneyTypeName;
    journeyLocation: JourneyLocation;
  }[];
  journeyTypeName: ChildJourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string;
  journeyAvatar: Visual | undefined;
  journeyTags: string[] | undefined;
  stick?: StickSide;
}

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
  parentJourneys,
  stick,
  ...boxProps
}: JourneyPageBannerCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const JourneyIcon = journeyIcon[journeyTypeName];

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
      {parentJourneys && parentJourneys.length && (
        <CardText color="primary">
          {t('components.journeyPageBannerCard.parentJourney')}
          {parentJourneys.map((parentJourney, index) => {
            const ParentJourneyIcon = journeyIcon[parentJourney.journeyTypeName];
            return (
              <React.Fragment key={index}>
                <RouterLink
                  to={buildJourneyUrl(parentJourney.journeyLocation) ?? ''}
                  style={{ marginLeft: gutters(0.5)(theme) }}
                >
                  <ParentJourneyIcon
                    fontSize="inherit"
                    sx={{
                      marginX: theme => theme.spacing(0.25),
                      verticalAlign: 'middle',
                    }}
                  />
                  {parentJourney.displayName}
                </RouterLink>
                {index < parentJourneys.length - 1 && (
                  <KeyboardArrowRightIcon
                    color="primary"
                    fontSize="small"
                    sx={{ marginLeft: gutters(0.5), verticalAlign: 'bottom' }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </CardText>
      )}
      <BadgeCardView
        visual={
          <JourneyAvatar
            visualUri={journeyAvatar?.uri}
            journeyTypeName={journeyTypeName}
            hideJourneyIcon={!!journeyAvatar?.uri}
            size="large"
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
