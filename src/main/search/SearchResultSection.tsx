import { FilterConfig, FilterDefinition } from './Filter';
import { ComponentType, ReactNode } from 'react';
import { EntityFilter } from './EntityFilter';
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
    </PageContentBlock>
  );
};

export default SearchResultSection;
