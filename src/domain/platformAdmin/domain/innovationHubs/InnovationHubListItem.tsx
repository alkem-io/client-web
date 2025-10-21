import React from 'react';
import ListItemLink, { ListItemLinkProps } from '@/domain/shared/components/SearchableList/ListItemLink';
import { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import {
  AdminListItemLayout,
  ListedInStoreColumn,
  SearchVisibilityColumn,
  AccountOwnerColumn,
} from '@/domain/platformAdmin/components/AdminListItemLayout';

interface InnovationHubListItemProps extends ListItemLinkProps {
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
  accountOwner?: string;
}

const InnovationHubListItem = ({
  listedInStore,
  searchVisibility,
  accountOwner,
  ...props
}: InnovationHubListItemProps) => {
  return (
    <ListItemLink
      {...props}
      primary={
        <AdminListItemLayout
          name={props.primary}
          columns={[
            {
              flex: 1,
              minWidth: '120px',
              content: <ListedInStoreColumn listedInStore={listedInStore} />,
            },
            {
              flex: 1,
              minWidth: '100px',
              content: <SearchVisibilityColumn searchVisibility={searchVisibility} />,
            },
            {
              flex: 1,
              minWidth: '150px',
              content: <AccountOwnerColumn accountOwner={accountOwner} />,
            },
          ]}
        />
      }
    />
  );
};

export default InnovationHubListItem;
