import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import SpaceCardBase, { SpaceCard2Props } from '@/domain/space/components/cards/SpaceCardBase';
import { BlockTitle } from '@/core/ui/typography';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import SpaceCardDescription from '@/domain/space/components/cards/components/SpaceCardDescription';
import SpaceCardSpacing from '@/domain/space/components/cards/components/SpaceCardSpacing';
import CardActions from '@/core/ui/card/CardActions';
import SpaceCardGoToButton from '@/domain/space/components/cards/components/SpaceCardGoToButton';
import CardRibbon from '@/core/ui/card/CardRibbon';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

export interface SpaceCardProps extends Omit<SpaceCard2Props, 'header' | 'iconComponent' | 'expansion'> {
  tagline: string;
  spaceId?: string;
  spaceVisibility?: SpaceVisibility;
  spaceUri: string;
  displayName: string;
  why: string;
}

const SpaceCard = ({ spaceId, displayName, why: vision, tagline, spaceVisibility, ...props }: SpaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <SpaceCardBase
      iconComponent={HubOutlined}
      header={
        <>
          <BlockTitle noWrap component="dt">
            {displayName}
          </BlockTitle>
        </>
      }
      expansion={
        <>
          <SpaceCardDescription>{vision}</SpaceCardDescription>
          <SpaceCardSpacing />
        </>
      }
      expansionActions={
        <CardActions>
          <SpaceCardGoToButton spaceUri={props.spaceUri} />
        </CardActions>
      }
      bannerOverlay={ribbon}
      {...props}
    >
      <SpaceCardTagline>{tagline}</SpaceCardTagline>
    </SpaceCardBase>
  );
};

export default SpaceCard;
