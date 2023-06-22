import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CardActions from '../../../../../core/ui/card/CardActions';
import JourneyCardGoToButton from '../../../../challenge/common/JourneyCard/JourneyCardGoToButton';
import { JourneyTypeName } from '../../../../challenge/JourneyTypeName';
import journeyIcon from '../../JourneyIcon/JourneyIcon';
import JourneyCard, { JourneyCardProps } from '../../../../challenge/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../../../challenge/common/JourneyCard/JourneyCardTagline';
import { BlockTitle } from '../../../../../core/ui/typography/components';
import webkitLineClamp from '../../../../../core/ui/utils/webkitLineClamp';
import JourneyCardDescription from '../../../../challenge/common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../../../../challenge/common/JourneyCard/JourneyCardSpacing';
import { SpaceVisibility } from '../../../../../core/apollo/generated/graphql-schema';
import CardRibbon from '../../../../../core/ui/card/CardRibbon';

export interface SearchBaseJourneyCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'parentSegment'> {
  locked?: boolean;
  journeyTypeName: JourneyTypeName;
  displayName: string;
  vision: string;
  parentSegment?: ReactNode;
  spaceVisibility?: SpaceVisibility;
}

const SearchBaseJourneyCard = ({
  journeyTypeName,
  tagline,
  displayName,
  vision,
  parentSegment,
  spaceVisibility,
  ...props
}: SearchBaseJourneyCardProps) => {
  const { t } = useTranslation();
  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <JourneyCard
      tagline={tagline}
      iconComponent={journeyIcon[journeyTypeName]}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      ribbon={ribbon}
      expansion={<JourneyCardDescription>{vision}</JourneyCardDescription>}
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName={journeyTypeName} />
        </CardActions>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
      {parentSegment ?? <JourneyCardSpacing height={2} />}
    </JourneyCard>
  );
};

export default SearchBaseJourneyCard;
