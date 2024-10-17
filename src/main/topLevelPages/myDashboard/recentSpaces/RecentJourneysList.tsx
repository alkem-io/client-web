import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import RecentJourneyHydrator from './RecentJourneyHydrator';
import RecentJourneyCard, { RECENT_JOURNEY_CARD_ASPECT_RATIO } from './RecentJourneyCard';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Caption } from '../../../../core/ui/typography';
import { Button, Paper } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { useTranslation } from 'react-i18next';
import { GRID_COLUMNS_DESKTOP } from '../../../../core/ui/grid/constants';
import { useRecentSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface RecentJourneysListProps {
  onSeeMore?: () => void;
}

const RecentJourneysList = ({ onSeeMore }: RecentJourneysListProps) => {
  const { data } = useRecentSpacesQuery({
    variables: {
      limit: GRID_COLUMNS_DESKTOP / 2 - 1,
    },
  });

  const columns = useColumns();

  const { t } = useTranslation();

  const noticeVariant = columns > 4 ? 'full' : 'short';

  return (
    <PageContentBlockSeamless row disablePadding>
      {data?.me.mySpaces.slice(0, columns / 2 - 1).map(result => (
        <RecentJourneyHydrator key={result.space.id} journey={result.space} component={RecentJourneyCard} />
      ))}
      <GridItem columns={2}>
        <Paper
          variant="outlined"
          component={Button}
          endIcon={<DoubleArrowOutlined />}
          sx={{ textTransform: 'none', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
          onClick={onSeeMore}
        >
          <Caption>{t(`pages.home.sections.recentJourneys.seeMore.${noticeVariant}` as const)}</Caption>
        </Paper>
      </GridItem>
    </PageContentBlockSeamless>
  );
};

export default RecentJourneysList;
