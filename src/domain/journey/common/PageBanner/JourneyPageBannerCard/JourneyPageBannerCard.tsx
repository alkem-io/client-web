import { gutters } from '../../../../../core/ui/grid/utils';
import { Caption, PageTitle } from '../../../../../core/ui/typography';
import { JourneyTypeName } from '../../../JourneyTypeName';
import React from 'react';
import journeyIcon from '../../../../shared/components/JourneyIcon/JourneyIcon';
import BadgeCardView from '../../../../../core/ui/list/BadgeCardView';
import { Box } from '@mui/material';
import JourneyAvatar from '../../JourneyAvatar/JourneyAvatar';
import TagsComponent from '../../../../shared/components/TagsComponent/TagsComponent';
import { Visual } from '../../../../common/visual/Visual';
import PageBannerCardWrapper, {
  PageBannerCardWrapperProps,
} from '../../../../../core/ui/layout/pageBannerCard/PageBannerCardWrapper';

type ChildJourneyTypeName = Exclude<JourneyTypeName, 'space'>;

export interface JourneyPageBannerCardProps extends PageBannerCardWrapperProps {
  journeyTypeName: ChildJourneyTypeName;
  journeyDisplayName: string;
  journeyTagline: string;
  journeyAvatar: Visual | undefined;
  journeyTags: string[] | undefined;
}

const JourneyPageBannerCard = ({
  journeyDisplayName,
  journeyTagline,
  journeyTypeName,
  journeyAvatar,
  journeyTags = [],
  ...props
}: JourneyPageBannerCardProps) => {
  const JourneyIcon = journeyIcon[journeyTypeName];

  return (
    <PageBannerCardWrapper {...props}>
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
    </PageBannerCardWrapper>
  );
};

export default JourneyPageBannerCard;
