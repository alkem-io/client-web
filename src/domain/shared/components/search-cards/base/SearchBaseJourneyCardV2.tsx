import React, { ReactNode } from 'react';
import { SvgIconProps } from '@mui/material';
import CardActions from '../../../../../core/ui/card/CardActions';
import JourneyCardParentSegment from '../../../../challenge/common/HubChildJourneyCard/JourneyCardParentSegment';
import JourneyCardGoToButton from '../../../../challenge/common/JourneyCard/JourneyCardGoToButton';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import journeyIcon from '../../JourneyIcon/JourneyIcon';
import JourneyCard, { JourneyCardProps } from '../../../../challenge/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../../../challenge/common/JourneyCard/JourneyCardTagline';
import { BlockTitle } from '../../../../../core/ui/typography/components';
import webkitLineClamp from '../../../../../core/ui/utils/webkitLineClamp';
import JourneyCardVision from '../../../../challenge/common/JourneyCard/JourneyCardVision';
import JourneyCardSpacing from '../../../../challenge/common/JourneyCard/JourneyCardSpacing';

interface SearchBaseJourneyCardProps extends Omit<JourneyCardProps, 'iconComponent' | 'parentSegment'> {
  parentUri?: string;
  parentDisplayName?: string;
  parentIcon?: React.ComponentType<SvgIconProps>;
  private?: boolean;
  privateParent?: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: string;
  vision: string;
  parentSegment?: ReactNode;
}

const SearchBaseJourneyCard = ({
  parentDisplayName,
  parentUri,
  parentIcon,
  journeyTypeName,
  tagline,
  displayName,
  vision,
  header,
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
      expansion={
        <>
          <JourneyCardVision>{vision}</JourneyCardVision>
          {parentUri && parentDisplayName && parentIcon ? (
            <JourneyCardParentSegment iconComponent={parentIcon} parentJourneyUri={parentUri}>
              {parentDisplayName}
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
