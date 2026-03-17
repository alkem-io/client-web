import type { SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import {
  AccountOwnerColumn,
  AdminListItemLayout,
  ListedInStoreColumn,
  SearchVisibilityColumn,
} from '@/domain/platformAdmin/components/AdminListItemLayout';
import ListItemLink, { type ListItemLinkProps } from '@/domain/shared/components/SearchableList/ListItemLink';

interface VirtualContributorListItemProps extends ListItemLinkProps {
  listedInStore: boolean;
  searchVisibility: SearchVisibility;
  accountOwner?: string;
}

const VirtualContributorListItem = ({
  listedInStore,
  searchVisibility,
  accountOwner,
  ...props
}: VirtualContributorListItemProps) => {
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

export default VirtualContributorListItem;
