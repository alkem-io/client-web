import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import { useRecentJourneysQuery } from '../../../../core/apollo/generated/apollo-hooks';
import RecentJourneyHydrator from './RecentJourneyHydrator';
import RecentJourneyCard, { RECENT_JOURNEY_CARD_ASPECT_RATIO } from './RecentJourneyCard';
import GridItem from '../../../../core/ui/grid/GridItem';
import { Caption } from '../../../../core/ui/typography';
import { Button, Paper } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import { useTranslation } from 'react-i18next';
import { GRID_COLUMNS_DESKTOP } from '../../../../core/ui/grid/constants';

const RecentJourneysList = () => {
  const { data } = useRecentJourneysQuery({
    variables: {
      limit: GRID_COLUMNS_DESKTOP / 2 - 1,
    },
  });

  const columns = useColumns();

  const { t } = useTranslation();

  return (
    <PageContentBlockSeamless row disablePadding>
      {data?.me.myJourneys.slice(0, columns / 2 - 1).map(result => (
        <RecentJourneyHydrator journey={result.journey} component={RecentJourneyCard} />
      ))}
      <GridItem columns={2}>
        <Paper
          variant="outlined"
          component={Button}
          endIcon={<DoubleArrowOutlined />}
          sx={{ textTransform: 'none', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
        >
          <Caption>{t('pages.home.sections.recentJourneys.seeMore')}</Caption>
        </Paper>
      </GridItem>
    </PageContentBlockSeamless>
  );
};

export default RecentJourneysList;
