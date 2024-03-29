import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import { ProfileType, SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import CardActions from '../../../../core/ui/card/CardActions';
import JourneyCard, { JourneyCardProps } from '../../common/JourneyCard/JourneyCard';
import JourneyCardDescription from '../../common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '../../common/JourneyCard/JourneyCardSpacing';
import JourneyCardGoToButton from '../../common/JourneyCard/JourneyCardGoToButton';
import JourneyCardTagline from '../../common/JourneyCard/JourneyCardTagline';
import StackedAvatar from './StackedAvatar';

interface SpaceSubspaceCardProps
  extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'expansion' | 'journeyTypeName'> {
  tagline: string;
  displayName: string;
  vision: string;
  member?: boolean;
  journeyUri: string;
  type: string;
  spaceVisibility?: SpaceVisibility;
  spaceDisplayName?: string;
  spaceUri?: string;
  hideJoin?: boolean;
  isPrivate?: boolean;
  avatarUris: string[];
}

const SpaceSubspaceCard = ({
  displayName,
  vision,
  tagline,
  spaceVisibility,
  type,
  spaceDisplayName,
  avatarUris,
  ...props
}: SpaceSubspaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  const isSubspace = type !== ProfileType.Space;

  return (
    <JourneyCard
      iconComponent={HubOutlined}
      header={
        <>
          <BlockTitle noWrap component="dt">
            {displayName}
          </BlockTitle>
          {isSubspace && (
            <Caption noWrap component="dd" sx={{ color: 'primary.main' }}>
              {t('pages.challenge-explorer.my.in')}: {spaceDisplayName}
            </Caption>
          )}
        </>
      }
      visual={<StackedAvatar uri={avatarUris} />}
      showAccessibility
      subspace={isSubspace}
      expansion={
        <>
          <JourneyCardDescription>{vision}</JourneyCardDescription>
          <JourneyCardSpacing />
        </>
      }
      expansionActions={
        <CardActions>
          <JourneyCardGoToButton journeyUri={props.journeyUri} journeyTypeName="space" />
        </CardActions>
      }
      ribbon={ribbon}
      {...props}
    >
      <JourneyCardTagline>{tagline}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default SpaceSubspaceCard;
