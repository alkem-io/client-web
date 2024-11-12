import React, { useState } from 'react';
import ExploreSpacesContainer from './ExploreSpacesContainer';
import { ExploreSpacesView, SpacesExplorerMembershipFilter } from './ExploreSpacesView';

interface ExploreSpacesProps {
  itemsPerRow?: number;
  itemsLimit?: number;
}

const ExploreSpaces = ({ itemsPerRow, itemsLimit }: ExploreSpacesProps) => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(SpacesExplorerMembershipFilter.All);

  return (
    <ExploreSpacesContainer searchTerms={searchTerms} selectedFilter={selectedFilter}>
      {provided => {
        return (
          <ExploreSpacesView
            {...provided}
            setSearchTerms={setSearchTerms}
            setSelectedFilter={setSelectedFilter}
            itemsPerRow={itemsPerRow}
            itemsLimit={itemsLimit}
          />
        );
      }}
    </ExploreSpacesContainer>
  );
};

export default ExploreSpaces;
