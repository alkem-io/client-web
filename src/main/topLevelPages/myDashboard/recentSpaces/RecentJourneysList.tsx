import { useTranslation } from 'react-i18next';
import { Button, Paper, Theme, useMediaQuery } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useRecentSpacesQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { theme } from '../../../../core/ui/themes/default/Theme';
import { Caption } from '../../../../core/ui/typography';
import { useColumns } from '../../../../core/ui/grid/GridContext';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import GridItem from '../../../../core/ui/grid/GridItem';
import JourneyTile, {
  RECENT_JOURNEY_CARD_ASPECT_RATIO,
} from '../../../../domain/journey/common/JourneyTile/JourneyTile';

interface RecentJourneysListProps {
  onSeeMore?: () => void;
}

const RecentJourneysList = ({ onSeeMore }: RecentJourneysListProps) => {
  const { t } = useTranslation();
  const columns = useColumns();
  const visibleSpaces = columns / 2 - 1;

  const { data } = useRecentSpacesQuery({
    variables: {
      limit: visibleSpaces, //todo:b double-check this logic
    },
  });

  const isMobile = useMediaQuery<Theme>(theme.breakpoints.down('sm'));
  const cardColumns = isMobile ? columns / 2 : columns / 4;

  return (
    <PageContentBlockSeamless row disablePadding>
      {data?.me.mySpaces.slice(0, visibleSpaces).map(result => (
        <JourneyTile
          key={result.space.id}
          columns={cardColumns}
          journey={{
            profile: {
              displayName: result.space.profile.displayName,
              url: result.space.profile.url,
              cardBanner: result.space.profile.cardBanner,
            },
          }}
          journeyTypeName="space"
        />
      ))}
      <GridItem columns={cardColumns}>
        <Paper
          variant="outlined"
          component={Button}
          endIcon={<DoubleArrowOutlined />}
          sx={{ textTransform: 'none', aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO }}
          onClick={onSeeMore}
        >
          <Caption>{t('pages.home.sections.recentJourneys.seeMore')}</Caption>
        </Paper>
      </GridItem>
    </PageContentBlockSeamless>
  );
};

export default RecentJourneysList;
