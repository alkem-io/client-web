import React, { FC, useState } from 'react';
import ExploreSpacesUnauthenticatedContainer from './ExploreSpaces/ExploreSpacesUnauthenticatedContainer';
import {
  ExploreSpacesUnauthenticatedView,
  SpacesExplorerMembershipFilter,
} from './ExploreSpaces/ExploreSpacesUnauthenticatedView';

interface MyDashboardUnauthenticatedProps {}

const MyDashboardUnauthenticated: FC<MyDashboardUnauthenticatedProps> = () => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(SpacesExplorerMembershipFilter.All);

  return (
    <ExploreSpacesUnauthenticatedContainer searchTerms={searchTerms} selectedFilter={selectedFilter}>
      {provided => {
        return (
          <ExploreSpacesUnauthenticatedView
            {...provided}
            setSearchTerms={setSearchTerms}
            setSelectedFilter={setSelectedFilter}
          />
        );
      }}
    </ExploreSpacesUnauthenticatedContainer>
  );
};

export default MyDashboardUnauthenticated;
