import React, { FC } from 'react';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import { PageProps } from '../../pages';
import SearchableList, { SearchableListData } from './SearchableList';

interface Parameters {
  challengeId: string;
}

interface GroupListProps extends PageProps {
  data: SearchableListData[];
}

export const ListPage: FC<GroupListProps> = ({ data, paths }) => {
  useUpdateNavigation({ currentPaths: paths });

  return <SearchableList data={data} />;
};
export default ListPage;
