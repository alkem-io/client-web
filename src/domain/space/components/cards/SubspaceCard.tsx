import { useTranslation } from 'react-i18next';
import { HubOutlined } from '@mui/icons-material';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { BlockTitle, Caption } from '@/core/ui/typography';
import CardRibbon from '@/core/ui/card/CardRibbon';
import CardActions from '@/core/ui/card/CardActions';
import SpaceCardBase, { SpaceCard2Props } from '@/domain/space/components/cards/SpaceCardBase';
import SpaceCardDescription from '@/domain/space/components/cards/components/SpaceCardDescription';
import SpaceCardSpacing from '@/domain/space/components/cards/components/SpaceCardSpacing';
import SpaceCardGoToButton from '@/domain/space/components/cards/components/SpaceCardGoToButton';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import StackedAvatar from './components/StackedAvatar';
import { ReactNode } from 'react';

interface SubspaceCardProps extends Omit<SpaceCard2Props, 'header' | 'iconComponent' | 'expansion'> {
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
  avatarUris?: string[];
  label?: ReactNode;
  level?: SpaceLevel;
}

const SubspaceCard = ({
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
}: SubspaceCardProps) => {
  const { t } = useTranslation();

  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  const isSubspace = level !== SpaceLevel.L0;

  return (
    <SpaceCardBase
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
      visual={<StackedAvatar avatarUris={avatarUris!} />}
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
      bannerOverlay={
        <>
          {ribbon}
          {label}
        </>
      }
      {...props}
    >
      <SpaceCardTagline>{tagline ?? ''}</SpaceCardTagline>
    </SpaceCardBase>
  );
};

export default SubspaceCard;
