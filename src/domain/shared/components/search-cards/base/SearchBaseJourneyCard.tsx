import React, { ReactNode } from 'react';
import CardActions from '../../../../../core/ui/card/CardActions';
import JourneyCardParentSegment from '../../../../challenge/common/HubChildJourneyCard/JourneyCardParentSegment';
import JourneyCardGoToButton from '../../../../challenge/common/JourneyCard/JourneyCardGoToButton';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import journeyIcon from '../../JourneyIcon/JourneyIcon';
import JourneyCard, { JourneyCardProps } from '../../../../challenge/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../../../challenge/common/JourneyCard/JourneyCardTagline';
import { BlockTitle } from '../../../../../core/ui/typography/components';
import webkitLineClamp from '../../../../../core/ui/utils/webkitLineClamp';
import JourneyCardDescription from '../../../../challenge/common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../../../../challenge/common/JourneyCard/JourneyCardSpacing';
import getParentJourneyType from '../../../../challenge/common/utils/getParentJourneyType';

export interface SearchBaseJourneyCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'parentSegment'> {
  parentJourneyUri?: string;
  parentJourneyDisplayName?: string;
  locked?: boolean;
  privateParent?: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: string;
  vision: string;
  parentSegment?: ReactNode;
}

const SearchBaseJourneyCard = ({
  parentJourneyDisplayName,
  parentJourneyUri,
  journeyTypeName,
  tagline,
  displayName,
  vision,
  ...props
}: SearchBaseJourneyCardProps) => {
  const parentJourney = getParentJourneyType(journeyTypeName);
  const parentIcon = parentJourney && journeyIcon[parentJourney];

  return (
    <JourneyCard
      tagline={tagline}
      iconComponent={journeyIcon[journeyTypeName]}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      expansion={
        <>
          <JourneyCardDescription>{vision}</JourneyCardDescription>
          {parentJourneyUri && parentJourneyDisplayName && parentIcon ? (
            <JourneyCardParentSegment iconComponent={parentIcon} parentJourneyUri={parentJourneyUri}>
              {parentJourneyDisplayName}
            </JourneyCardParentSegment>
          ) : (
            <JourneyCardSpacing />
          )}
        </>
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName={journeyTypeName} />
        </CardActions>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default SearchBaseJourneyCard;
