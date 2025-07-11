import { useTranslation } from 'react-i18next';
import { Button, Paper } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useRecentSpacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography';
import { useColumns } from '@/core/ui/grid/GridContext';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import GridItem from '@/core/ui/grid/GridItem';
import SpaceTile, { RECENT_SPACE_CARD_ASPECT_RATIO } from '@/domain/space/components/cards/SpaceTile';
import { useMemo } from 'react';
import { useScreenSize } from '@/core/ui/grid/constants';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

interface RecentSpacesListProps {
  onSeeMore?: () => void;
}

const RecentSpacesList = ({ onSeeMore }: RecentSpacesListProps) => {
  const { t } = useTranslation();
  const columns = useColumns();
  const visibleSpaces = Math.max(1, Math.floor(columns / 2) - 1);

  const { data } = useRecentSpacesQuery({ variables: { limit: visibleSpaces } });

  const { isSmallScreen } = useScreenSize();
  const cardColumns = useMemo(() => (isSmallScreen ? columns / 2 : columns / 4), [isSmallScreen, columns]);

  return (
    <PageContentBlockSeamless row disablePadding>
      {data?.me.mySpaces.slice(0, visibleSpaces).map(result => (
        <SpaceTile
          key={result.space.id}
          // TODO: defaultVisuals - find a way set the id of non L0 spaces
          levelZeroSpaceId={result.space.level === SpaceLevel.L0 ? result.space.id : undefined}
          columns={cardColumns}
          space={{
            about: result.space.about,
            level: result.space.level,
          }}
        />
      ))}

      <GridItem columns={cardColumns}>
        <Paper
          variant="outlined"
          component={Button}
          endIcon={<DoubleArrowOutlined />}
          sx={{ textTransform: 'none', aspectRatio: RECENT_SPACE_CARD_ASPECT_RATIO }}
          onClick={onSeeMore}
        >
          <Caption>{t('pages.home.sections.recentSpaces.seeMore')}</Caption>
        </Paper>
      </GridItem>
    </PageContentBlockSeamless>
  );
};

export default RecentSpacesList;
