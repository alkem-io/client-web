import React, { ComponentType } from 'react';
import CardActions from '../../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../../../challenge/common/JourneyCard/JourneyCardGoToButton';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import journeyIcon from '../../JourneyIcon/JourneyIcon';
import JourneyCard, { JourneyCardProps } from '../../../../challenge/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../../../challenge/common/JourneyCard/JourneyCardTagline';
import { BlockTitle } from '../../../../../core/ui/typography/components';
import webkitLineClamp from '../../../../../core/ui/utils/webkitLineClamp';
import JourneyCardVision from '../../../../challenge/common/JourneyCard/JourneyCardVision';
import JourneyCardParentSegment from '../../../../challenge/common/HubChildJourneyCard/JourneyCardParentSegment';
import { SvgIconProps } from '@mui/material';

export interface SearchBaseJourneyCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'parentSegment'> {
  locked?: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: string;
  vision: string;
  parentInformation?: {
    displayName: string;
    iconComponent?: ComponentType<SvgIconProps>;
    uri: string;
    locked: boolean;
  };
}

const SearchBaseJourneyCard = ({
  journeyTypeName,
  tagline,
  displayName,
  vision,
  parentInformation,
  ...props
}: SearchBaseJourneyCardProps) => {
  return (
    <JourneyCard
      tagline={tagline}
      iconComponent={journeyIcon[journeyTypeName]}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      expansion={<JourneyCardVision>{vision}</JourneyCardVision>}
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName={journeyTypeName} />
        </CardActions>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
      {parentInformation && (
        <>
          <JourneyCardParentSegment
            iconComponent={parentInformation.iconComponent}
            parentJourneyUri={parentInformation.uri}
            locked={parentInformation.locked}
          >
            {parentInformation.displayName}
          </JourneyCardParentSegment>
        </>
      )}
    </JourneyCard>
  );
};

export default SearchBaseJourneyCard;
