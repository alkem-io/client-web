import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import JourneyCard, { JourneyCardProps } from '@/domain/space/components/cards/JourneyCard/JourneyCard';
import { BlockTitle, Caption } from '@/core/ui/typography';
import JourneyCardTagline from '@/domain/space/components/cards/JourneyCard/JourneyCardTagline';
import JourneyCardDescription from '@/domain/space/components/cards/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '@/domain/space/components/cards/JourneyCard/JourneyCardSpacing';
import CardActions from '@/core/ui/card/CardActions';
import JourneyCardGoToButton from '@/domain/space/components/cards/JourneyCard/JourneyCardGoToButton';
import CardRibbon from '@/core/ui/card/CardRibbon';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';

export interface SpaceCardProps extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'expansion'> {
  tagline: string;
  spaceId?: string;
  displayName: string;
  vision: string;
  membersCount: number;
  spaceVisibility?: SpaceVisibility;
  journeyUri: string;
}

const SpaceCard = ({
  spaceId,
  displayName,
  vision,
  membersCount,
  tagline,
  spaceVisibility,
  ...props
}: SpaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <JourneyCard
      iconComponent={HubOutlined}
      header={
        <>
          <BlockTitle noWrap component="dt">
            {displayName}
          </BlockTitle>
          <Caption noWrap component="dd">
            {t('community.members-count', { count: membersCount })}
          </Caption>
        </>
      }
      expansion={
        <>
          <JourneyCardDescription>{vision}</JourneyCardDescription>
          <JourneyCardSpacing />
        </>
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} />
        </CardActions>
      }
      bannerOverlay={ribbon}
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default SpaceCard;
