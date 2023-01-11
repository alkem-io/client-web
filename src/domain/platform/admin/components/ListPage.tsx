import React, { FC } from 'react';
import SearchableList, { SearchableListItem } from './SearchableList';
import SearchableListLayout from '../../../shared/components/SearchableListLayout';

interface ListPageProps {
  data: SearchableListItem[];
  title?: string;
  newLink?: string;
  onDelete?: (item: SearchableListItem) => void;
  loading?: boolean;
}

export const ListPage: FC<ListPageProps> = ({ data, title, newLink, onDelete, loading }) => {
  return (
    <SearchableListLayout title={title} newLink={newLink}>
      <SearchableList data={data} onDelete={onDelete} loading={loading} />
    </SearchableListLayout>
  );
};

export default ListPage;
