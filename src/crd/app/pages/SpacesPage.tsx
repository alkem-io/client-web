import { useMemo, useState } from 'react';
import type { SpacesFilterValue } from '@/crd/components/space/SpaceExplorer';
import { SpaceExplorer } from '@/crd/components/space/SpaceExplorer';
import { MOCK_SPACES } from '../data/spaces';

const BATCH_SIZE = 12;

export function SpacesPage() {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [membershipFilter, setMembershipFilter] = useState<SpacesFilterValue>('all');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const filteredSpaces = useMemo(() => {
    let result = [...MOCK_SPACES];

    // Search
    if (searchTerms.length > 0) {
      result = result.filter(space => {
        const text = `${space.name} ${space.description} ${space.tags.join(' ')}`.toLowerCase();
        return searchTerms.every(term => text.includes(term));
      });
    }

    return result;
  }, [searchTerms]);

  const displayedSpaces = filteredSpaces.slice(0, visibleCount);
  const hasMore = visibleCount < filteredSpaces.length;

  const handleLoadMore = async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    setVisibleCount(prev => prev + BATCH_SIZE);
  };

  return (
    <SpaceExplorer
      spaces={displayedSpaces}
      loading={false}
      hasMore={hasMore}
      searchTerms={searchTerms}
      membershipFilter={membershipFilter}
      authenticated={true}
      onSearchTermsChange={terms => {
        setSearchTerms(terms);
        setVisibleCount(BATCH_SIZE);
      }}
      onMembershipFilterChange={setMembershipFilter}
      onLoadMore={handleLoadMore}
      onParentClick={parent => {
        window.location.href = parent.href;
      }}
    />
  );
}
