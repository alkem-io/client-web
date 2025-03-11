import { FilterConfig, FilterDefinition } from './Filter';
import { memo, ComponentType, ReactNode } from 'react';
import { isEqual as lodashIsEqual } from 'lodash';
import { Box, Button } from '@mui/material';
import { EntityFilter } from './EntityFilter';
import { Autorenew } from '@mui/icons-material';
import CardsLayout from '@/core/ui/card/cardsLayout/CardsLayout';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { Identifiable } from '@/core/utils/Identifiable';

interface ResultSectionProps<Result extends Identifiable> {
  title: ReactNode;
  results: Result[] | undefined;
  filterTitle?: string;
  count?: number;
  tagId?: string;
  filterConfig: FilterConfig | undefined;
  currentFilter: FilterDefinition;
  onFilterChange: (value: FilterDefinition) => void;
  loading?: boolean;
  cardComponent: ComponentType<{ result: Result | undefined }>;
  onClickLoadMore?: () => void;
}

const SearchResultSection = <Result extends Identifiable>({
  title,
  tagId = '',
  results = [],
  filterTitle,
  filterConfig,
  currentFilter,
  onFilterChange,
  loading,
  cardComponent: Card,
  onClickLoadMore,
}: ResultSectionProps<Result>) => {
  const { t } = useTranslation();

  const resultDisclaimer = results.length >= 8 ? t('pages.search.results-disclaimer') : undefined;

  return (
    <PageContentBlock id={tagId}>
      <PageContentBlockHeader
        title={title}
        disclaimer={resultDisclaimer}
        actions={
          filterConfig && (
            <EntityFilter
              title={filterTitle}
              currentFilter={currentFilter}
              config={filterConfig}
              onChange={onFilterChange}
            />
          )
        }
      />

      <CardsLayout
        globalSearch
        items={loading ? [undefined, undefined] : results}
        deps={[currentFilter]}
        cards={false}
        disablePadding
        onClickLoadMore={onClickLoadMore}
      >
        {result => <Card result={result} />}
      </CardsLayout>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        <CardsLayout
          items={loading ? [undefined, undefined] : results}
          deps={[currentFilter]}
          cards={false}
          disablePadding
        >
          {result => <Card result={result} />}
        </CardsLayout>

        <Button startIcon={<Autorenew />} sx={{ flexLeft: 'auto' }}>
          {t('buttons.load-more')}
        </Button>
      </Box>
    </PageContentBlock>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (prevProps: ResultSectionProps<any>, nextProps: ResultSectionProps<any>) =>
  prevProps.title === nextProps.title &&
  lodashIsEqual(prevProps.results, nextProps.results) &&
  prevProps.filterTitle === nextProps.filterTitle &&
  lodashIsEqual(prevProps.filterConfig, nextProps.filterConfig) &&
  lodashIsEqual(prevProps.currentFilter, nextProps.currentFilter) &&
  prevProps.loading === nextProps.loading &&
  prevProps.cardComponent === nextProps.cardComponent;

export default memo(SearchResultSection, isEqual);
