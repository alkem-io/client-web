import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import CardRibbon from '@/core/ui/card/CardRibbon';
import CardActions from '@/core/ui/card/CardActions';
import JourneyCard, { JourneyCardProps } from '@/domain/journey/common/JourneyCard/JourneyCard';
import JourneyCardDescription from '@/domain/journey/common/JourneyCard/JourneyCardDescription';
import JourneyCardSpacing from '@/domain/journey/common/JourneyCard/JourneyCardSpacing';
import JourneyCardGoToButton from '@/domain/journey/common/JourneyCard/JourneyCardGoToButton';
import JourneyCardTagline from '@/domain/journey/common/JourneyCard/JourneyCardTagline';
import StackedAvatar from './StackedAvatar';
import { ReactNode } from 'react';

interface SpaceSubspaceCardProps extends Omit<JourneyCardProps, 'header' | 'iconComponent' | 'expansion'> {
  tagline?: string;
  displayName: string;
  vision: string;
  member?: boolean;
  journeyUri: string;
  spaceVisibility?: SpaceVisibility;
  spaceDisplayName?: string;
  spaceUri?: string;
  hideJoin?: boolean;
  isPrivate?: boolean;
  avatarUris: string[];
  label?: ReactNode;
  level?: SpaceLevel;
}

const SpaceSubspaceCard = ({
  displayName,
  vision,
  tagline,
  spaceVisibility,
  level,
  member,
  spaceDisplayName,
  avatarUris,
  isPrivate,
  label,
  ...props
}: SpaceSubspaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  const isSubspace = level !== SpaceLevel.L0;

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
              {t('components.card.parentSpace', { space: spaceDisplayName })}
            </Caption>
          )}
        </>
      }
      visual={<StackedAvatar avatarUris={avatarUris} />}
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
      bannerOverlay={
        <>
          {ribbon}
          {label}
        </>
      }
      {...props}
    >
      <JourneyCardTagline>{tagline ?? ''}</JourneyCardTagline>
    </JourneyCard>
  );
};

export default SpaceSubspaceCard;
