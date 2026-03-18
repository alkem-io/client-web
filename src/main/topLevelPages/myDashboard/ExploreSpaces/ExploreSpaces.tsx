import { useState } from 'react';
import { ExploreSpacesView, SpacesExplorerMembershipFilter } from './ExploreSpacesView';
import useExploreSpaces from './useExploreSpaces';

interface ExploreSpacesProps {
  itemsPerRow?: number;
  itemsLimit?: number;
}

const ExploreSpaces = ({ itemsPerRow, itemsLimit }: ExploreSpacesProps) => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(SpacesExplorerMembershipFilter.All);

  const provided = useExploreSpaces({ searchTerms, selectedFilter });

  return (
    <ExploreSpacesView
      {...provided}
      setSearchTerms={setSearchTerms}
      setSelectedFilter={setSelectedFilter}
      itemsPerRow={itemsPerRow}
      itemsLimit={itemsLimit}
    />
  );
};

export default ExploreSpaces;
