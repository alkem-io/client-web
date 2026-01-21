import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useRecentSpacesQuery, useHomeSpaceLookupQuery } from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography';
import { useSpaceCardLayout } from '@/main/topLevelPages/myDashboard/useSpaceCardLayout';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import Gutters from '@/core/ui/grid/Gutters';
import GridItem from '@/core/ui/grid/GridItem';
import HomeSpacePlaceholderCard from './HomeSpacePlaceholderCard';
import HomeSpacePinButton from '@/domain/space/components/HomeSpacePinButton';
import { useHomeSpaceSettings } from '@/domain/community/userCurrent/useHomeSpaceSettings';

interface RecentSpacesListProps {
  onSeeMore?: () => void;
}

const RecentSpacesList = ({ onSeeMore }: RecentSpacesListProps) => {
  const { t } = useTranslation();

  const { visibleSpaces, firstCardColumns, remainingCardColumns } = useSpaceCardLayout();

  const { homeSpaceId, membershipSettingsUrl } = useHomeSpaceSettings();

  // Fetch recent spaces
  const { data } = useRecentSpacesQuery({ variables: { limit: visibleSpaces + 1 } });

  // Conditionally fetch homeSpace details if ID is set
  const { data: homeSpaceData } = useHomeSpaceLookupQuery({
    variables: { spaceId: homeSpaceId! },
    skip: !homeSpaceId,
  });

  const homeSpace = homeSpaceData?.lookup.space;

  // Filter out homeSpace from recent spaces to avoid duplication and limit to visibleSpaces - 1
  const remainingSpaces = useMemo(() => {
    const spaces = data?.me.mySpaces ?? [];
    return spaces.filter(s => s.space.id !== homeSpaceId).slice(0, visibleSpaces - 1);
  }, [data?.me.mySpaces, homeSpaceId, visibleSpaces]);

  // Show component if we have data (either homeSpace, placeholder, or recent spaces)
  if (!data) {
    return null;
  }

  const hasMoreSpaces = (data?.me.mySpaces?.length ?? 0) >= visibleSpaces;

  return (
    <Gutters disablePadding sx={{ width: '100%' }}>
      <Gutters row disablePadding sx={{ alignItems: 'flex-start' }}>
        {/* First card: homeSpace or placeholder */}
        {homeSpace ? (
          <GridItem key={homeSpace.id} columns={firstCardColumns}>
            <SpaceCard
              spaceId={homeSpace.id}
              displayName={homeSpace.about.profile.displayName}
              banner={homeSpace.about.profile.cardBanner}
              spaceUri={homeSpace.about.profile.url ?? ''}
              isPrivate={!homeSpace.about.isContentPublic}
              compact
              iconOverlay={<HomeSpacePinButton settingsUrl={membershipSettingsUrl} />}
            />
          </GridItem>
        ) : (
          <HomeSpacePlaceholderCard columns={firstCardColumns} settingsUrl={membershipSettingsUrl} />
        )}

        {/* Remaining recent spaces */}
        {remainingSpaces.map(result => (
          <GridItem key={result.space.id} columns={remainingCardColumns}>
            <SpaceCard
              spaceId={result.space.id}
              displayName={result.space.about.profile.displayName}
              banner={result.space.about.profile.cardBanner}
              spaceUri={result.space.about.profile.url}
              isPrivate={!result.space.about.isContentPublic}
              compact
            />
          </GridItem>
        ))}
      </Gutters>
      {hasMoreSpaces && (
        <Button endIcon={<DoubleArrowOutlined />} sx={{ textTransform: 'none' }} onClick={onSeeMore}>
          <Caption>{t('pages.home.sections.recentSpaces.seeMore')}</Caption>
        </Button>
      )}
    </Gutters>
  );
};

export default RecentSpacesList;
