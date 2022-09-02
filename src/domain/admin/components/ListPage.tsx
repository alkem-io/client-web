import React, { FC } from 'react';
import { useUpdateNavigation } from '../../../hooks';
import SearchableList, { SearchableListItem } from './SearchableList';
import { Path } from '../../../context/NavigationProvider';
import SearchableListLayout from '../../shared/components/SearchableListLayout';

interface ListPageProps {
  data: SearchableListItem[];
  title?: string;
  newLink?: string;
  onDelete?: (item: SearchableListItem) => void;
  loading?: boolean;
  // TODO Manipulating navigation from a simple view is bad design.
  // We should only touch top-level UI parts from top-level components,
  // that are aware of the app structure / rendering context, i.e. Pages.
  paths?: Path[];
}

export const ListPage: FC<ListPageProps> = ({ data, paths, title, newLink, onDelete, loading }) => {
  useUpdateNavigation({ currentPaths: paths });

  return (
    <SearchableListLayout title={title} newLink={newLink}>
      <SearchableList data={data} onDelete={onDelete} loading={loading} />
    </SearchableListLayout>
  );
};

export default ListPage;
