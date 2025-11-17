import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useRecentSpacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography';
import { useColumns } from '@/core/ui/grid/GridContext';
import SpaceCard from '@/domain/space/components/cards/SpaceCard';
import Gutters from '@/core/ui/grid/Gutters';
import GridItem from '@/core/ui/grid/GridItem';
import { useMemo } from 'react';

interface RecentSpacesListProps {
  onSeeMore?: () => void;
}

const RecentSpacesList = ({ onSeeMore }: RecentSpacesListProps) => {
  const { t } = useTranslation();
  const columns = useColumns();

  // Calculate visible spaces and card columns based on total columns
  const { visibleSpaces, cardColumns } = useMemo(() => {
    if (columns >= 8) {
      return { visibleSpaces: 3, cardColumns: columns / 3 };
    } else if (columns >= 4) {
      return { visibleSpaces: 2, cardColumns: columns / 2 };
    } else {
      return { visibleSpaces: 1, cardColumns: columns };
    }
  }, [columns]);

  const { data } = useRecentSpacesQuery({ variables: { limit: visibleSpaces } });

  return (
    <Gutters disablePadding>
      <Gutters row disablePadding>
        {data?.me.mySpaces.slice(0, visibleSpaces).map(result => (
          <GridItem key={result.space.id} columns={cardColumns}>
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
      <Button endIcon={<DoubleArrowOutlined />} sx={{ textTransform: 'none' }} onClick={onSeeMore}>
        <Caption>{t('pages.home.sections.recentSpaces.seeMore')}</Caption>
      </Button>
    </Gutters>
  );
};

export default RecentSpacesList;
