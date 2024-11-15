import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CardActions from '@/core/ui/card/CardActions';
import JourneyCardGoToButton from '../../../../journey/common/JourneyCard/JourneyCardGoToButton';
import { spaceLevelIcon } from '../../JourneyIcon/JourneyIcon';
import JourneyCard, { JourneyCardProps } from '../../../../journey/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '../../../../journey/common/JourneyCard/JourneyCardTagline';
import { BlockTitle } from '@/core/ui/typography/components';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import JourneyCardDescription from '../../../../journey/common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../../../../journey/common/JourneyCard/JourneyCardSpacing';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import CardRibbon from '@/core/ui/card/CardRibbon';

export interface SearchBaseJourneyCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'parentSegment'> {
  tagline: string;
  locked?: boolean;
  spaceLevel: SpaceLevel;
  displayName: string;
  vision: string;
  parentSegment?: ReactNode;
  spaceVisibility?: SpaceVisibility;
  journeyUri: string;
}

const SearchBaseJourneyCard = ({
  spaceLevel,
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
      iconComponent={spaceLevelIcon[spaceLevel]}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      bannerOverlay={ribbon}
      expansion={<JourneyCardDescription>{vision}</JourneyCardDescription>}
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} subspace={spaceLevel !== SpaceLevel.Space} />
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
