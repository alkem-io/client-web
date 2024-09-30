import React from 'react';
import SearchableTable, { SearchableTableItem, SearchableTableProps } from './SearchableTable';
import SearchableListLayout from '../../../shared/components/SearchableList/SearchableListLayout';
import { ListItemLinkProps } from '../../../shared/components/SearchableList/ListItemLink';

interface ListPageProps<
  ItemViewProps extends {},
  Item extends SearchableTableItem & Omit<ItemViewProps, keyof ListItemLinkProps>
> extends SearchableTableProps<ItemViewProps, Item> {
  title?: string;
  newLink?: string;
}

export const ListPage = <
  ItemViewProps extends {},
  Item extends SearchableTableItem & Omit<ItemViewProps, keyof ListItemLinkProps>
>({
  title,
  newLink,
  ...props
}: ListPageProps<ItemViewProps, Item>) => {
  return (
    <SearchableListLayout title={title} newLink={newLink}>
      <SearchableTable {...props} />
    </SearchableListLayout>
  );
};

export default ListPage;
