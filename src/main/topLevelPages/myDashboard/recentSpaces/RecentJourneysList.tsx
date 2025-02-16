import { useTranslation } from 'react-i18next';
import { Button, Paper, Theme, useMediaQuery } from '@mui/material';
import { DoubleArrowOutlined } from '@mui/icons-material';
import { useRecentSpacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { Caption } from '@/core/ui/typography';
import { useColumns } from '@/core/ui/grid/GridContext';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import GridItem from '@/core/ui/grid/GridItem';
import JourneyTile, { RECENT_JOURNEY_CARD_ASPECT_RATIO } from '@/domain/journey/common/JourneyTile/JourneyTile';
import { useMemo } from 'react';
import { SpacePrivacyMode } from '@/core/apollo/generated/graphql-schema';

interface RecentJourneysListProps {
  onSeeMore?: () => void;
}

const RecentJourneysList = ({ onSeeMore }: RecentJourneysListProps) => {
  const { t } = useTranslation();
  const columns = useColumns();
  const visibleSpaces = Math.max(1, Math.floor(columns / 2) - 1);

  const { data } = useRecentSpacesQuery({ variables: { limit: visibleSpaces } });

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const cardColumns = useMemo(() => (isMobile ? columns / 2 : columns / 4), [isMobile, columns]);

  return (
    <PageContentBlockSeamless row disablePadding>
      {data?.me.mySpaces.slice(0, visibleSpaces).map(result => (
        <JourneyTile
          key={result.space.id}
          columns={cardColumns}
          isPrivate={result.space.settings.privacy?.mode === SpacePrivacyMode.Private}
          journey={{
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
