import React from 'react';
import SearchableList, { SearchableListItem, SearchableListProps } from './SearchableList';
import SearchableListLayout from '../../../shared/components/SearchableListLayout';
import { ListItemLinkProps } from '../../../shared/components/SearchableList/ListItemLink';

interface ListPageProps<
  ItemViewProps extends {},
  Item extends SearchableListItem & Omit<ItemViewProps, keyof ListItemLinkProps>
> extends SearchableListProps<ItemViewProps, Item> {
  title?: string;
  newLink?: string;
}

export const ListPage = <
  ItemViewProps extends {},
  Item extends SearchableListItem & Omit<ItemViewProps, keyof ListItemLinkProps>
>({
  title,
  newLink,
  ...props
}: ListPageProps<ItemViewProps, Item>) => {
  return (
    <SearchableListLayout title={title} newLink={newLink}>
      <SearchableList {...props} />
    </SearchableListLayout>
  );
};

export default ListPage;
