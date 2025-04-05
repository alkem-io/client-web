import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import SpaceCard2, { SpaceCard2Props } from '@/domain/space/components/cards/SpaceCard2';
import { BlockTitle, Caption } from '@/core/ui/typography';
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
    <SpaceCard2
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
          <SpaceCardDescription>{vision}</SpaceCardDescription>
          <SpaceCardSpacing />
        </>
      }
      expansionActions={
        <CardActions>
          <SpaceCardGoToButton spaceUri={props.journeyUri} />
        </CardActions>
      }
      bannerOverlay={ribbon}
      {...props}
    >
      <SpaceCardTagline>{tagline}</SpaceCardTagline>
    </SpaceCard2>
  );
};

export default SpaceCard;
