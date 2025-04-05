import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CardActions from '@/core/ui/card/CardActions';
import SpaceCardGoToButton from '@/domain/space/components/cards/components/SpaceCardGoToButton';
import { spaceLevelIcon } from '@/domain/space/icons/SpaceIconByLevel';
import SpaceCardBase, { SpaceCard2Props } from '@/domain/space/components/cards/SpaceCardBase';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import { BlockTitle } from '@/core/ui/typography/components';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import SpaceCardDescription from '@/domain/space/components/cards/components/SpaceCardDescription';
import SpaceCardSpacing from '@/domain/space/components/cards/components/SpaceCardSpacing';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import CardRibbon from '@/core/ui/card/CardRibbon';

export interface SearchBaseJourneyCardProps
  extends Omit<SpaceCard2Props, 'header' | 'iconComponent' | 'parentSegment'> {
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
    <SpaceCardBase
      iconComponent={spaceLevelIcon[spaceLevel]}
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      bannerOverlay={ribbon}
      expansion={<SpaceCardDescription>{vision}</SpaceCardDescription>}
      expansionActions={
        <CardActions>
          <SpaceCardGoToButton spaceUri={props.journeyUri} subspace={spaceLevel !== SpaceLevel.L0} />
        </CardActions>
      }
      {...props}
    >
      <SpaceCardTagline>{tagline}</SpaceCardTagline>
      {parentSegment ?? <SpaceCardSpacing height={2} />}
    </SpaceCardBase>
  );
};

export default SearchBaseJourneyCard;
