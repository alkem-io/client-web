import React, { FC, useState } from 'react';
import SpaceExplorerUnauthenticatedContainer from '../topLevelSpaces/SpaceExplorerUnauthenticatedContainer';
import {
  SpaceExplorerUnauthenticatedView,
  SpacesExplorerMembershipFilter,
} from '../topLevelSpaces/SpaceExplorerUnauthenticatedView';

interface MyDashboardUnauthenticatedProps {}

const MyDashboardUnauthenticated: FC<MyDashboardUnauthenticatedProps> = () => {
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>(SpacesExplorerMembershipFilter.All);

  return (
    <SpaceExplorerUnauthenticatedContainer searchTerms={searchTerms} selectedFilter={selectedFilter}>
      {provided => {
        return (
          <SpaceExplorerUnauthenticatedView
            {...provided}
            setSearchTerms={setSearchTerms}
            setSelectedFilter={setSelectedFilter}
          />
        );
      }}
    </SpaceExplorerUnauthenticatedContainer>
  );
};

export default MyDashboardUnauthenticated;
