import { Trans, useTranslation } from 'react-i18next';
import Gutters from '../../../../../core/ui/grid/Gutters';
import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, CardText, PageTitle } from '../../../../../core/ui/typography';
import { JourneyLocation } from '../../../../../common/utils/urlBuilders';
import { JourneyTypeName } from '../../../JourneyTypeName';
import React from 'react';
import journeyIcon from '../../../../shared/components/JourneyIcon/JourneyIcon';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import { Box } from '@mui/material';
import JourneyAvatar from '../../JourneyAvatar/JourneyAvatar';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { Visual } from '../../../../common/visual/Visual';

type ChildJourneyTypeName = Exclude<JourneyTypeName, 'space'>;

export interface JourneyPageBannerCardProps {
  parentJourneyDisplayName: string;
  parentJourneyLocation: JourneyLocation;
  journeyTypeName: ChildJourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string;
  journeyAvatar: Visual | undefined;
  journeyTags: string[] | undefined;
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

const JourneyPageBannerCard = ({
  journeyDisplayName,
  journeyTagline,
  journeyTypeName,
  journeyAvatar,
  journeyTags = [],
  parentJourneyDisplayName,
}: JourneyPageBannerCardProps) => {
  const { t } = useTranslation();

  const JourneyIcon = journeyIcon[journeyDisplayName];

  const parentJourneyTypeName = getParentJourneyTypeName(journeyTypeName);

  const ParentJourneyIcon = journeyIcon[parentJourneyTypeName];

  return (
    <Gutters paddingTop={gutters(0.5)}>
      <CardText>
        <Trans
          i18nKey="components.journeyPageBannerCard.parentJourney"
          values={{ journey: parentJourneyDisplayName }}
          components={{ journeyicon: <ParentJourneyIcon fontSize="inherit" /> }}
          t={t}
        />
      </CardText>
      <BadgeCardView visual={<JourneyAvatar visualUri={journeyAvatar?.uri} journeyTypeName={journeyTypeName} />}>
        <Box display="flex" flexDirection="column" gap={gutters(0.5)}>
          <PageTitle>
            <JourneyIcon fontSize="inherit" />
            {journeyDisplayName}
          </PageTitle>
          <Caption fontStyle="italic">{journeyTagline}</Caption>
          <TagsComponent tags={journeyTags} size="medium" />
        </Box>
      </BadgeCardView>
    </Gutters>
  );
};

export default JourneyPageBannerCard;
