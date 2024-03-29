import { useTranslation } from 'react-i18next';
import { Chip } from '@mui/material';
import { HubOutlined, LockOutlined } from '@mui/icons-material';
import { ProfileType, SpaceVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import CardRibbon from '../../../../core/ui/card/CardRibbon';
import CardActions from '../../../../core/ui/card/CardActions';
import { gutters } from '../../../../core/ui/grid/utils';
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
  type: ProfileType;
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
  member,
  spaceDisplayName,
  avatarUris,
  isPrivate,
  ...props
}: SpaceSubspaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  const isSubspace = type !== ProfileType.Space;
  const spaceString = isSubspace ? t('common.subspace') : t('common.space');
  const accessibilityLabel = member
    ? t('components.card.member')
    : `${isPrivate ? t('components.card.private') : t('components.card.public')} ${spaceString}`;

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
      visual={<StackedAvatar avatarUris={avatarUris} />}
      showAccessibility
      journeyName={
        <Chip
          variant="filled"
          color="primary"
          label={accessibilityLabel}
          icon={isPrivate ? <LockOutlined /> : undefined}
          sx={{ position: 'absolute', bottom: gutters(0.5), left: gutters(0.5) }}
        />
      }
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
