import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import SpaceCardBase, { SpaceCardProps } from '@/domain/space/components/cards/SpaceCardBase';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import { BlockTitle } from '@/core/ui/typography/components';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import SpaceCardDescription from '@/domain/space/components/cards/components/SpaceCardDescription';
import SpaceCardSpacing from '@/domain/space/components/cards/components/SpaceCardSpacing';
import { SpaceLevel, SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import CardRibbon from '@/core/ui/card/CardRibbon';

export interface SearchSpaceCardProps extends Omit<SpaceCardProps, 'header' | 'iconComponent' | 'parentSegment'> {
  tagline: string;
  locked?: boolean;
  spaceLevel: SpaceLevel;
  displayName: string;
  vision: string;
  parentSegment?: ReactNode;
  spaceVisibility?: SpaceVisibility;
  spaceUri: string;
}

const SearchSpaceCard = ({
  spaceLevel,
  tagline,
  displayName,
  vision,
  parentSegment,
  spaceVisibility,
  ...props
}: SearchSpaceCardProps) => {
  const { t } = useTranslation();
  const ribbon =
    spaceVisibility && spaceVisibility !== SpaceVisibility.Active ? (
      <CardRibbon text={t(`common.enums.space-visibility.${spaceVisibility}` as const)} />
    ) : undefined;

  return (
    <SpaceCardBase
      header={
        <BlockTitle component="div" sx={webkitLineClamp(2)}>
          {displayName}
        </BlockTitle>
      }
      bannerOverlay={ribbon}
      {...props}
    >
      <SpaceCardTagline>{tagline}</SpaceCardTagline>
      <SpaceCardDescription>{vision}</SpaceCardDescription>
      {parentSegment ?? <SpaceCardSpacing height={2} />}
    </SpaceCardBase>
  );
};

export default SearchSpaceCard;
