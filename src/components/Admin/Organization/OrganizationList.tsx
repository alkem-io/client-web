import React, { FC } from 'react';

import { useDeleteOrganizationMutation, useOrganizationsListQuery } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { PageProps } from '../../../pages';
import { ListPage } from '../ListPage';
import { SearchableListItem } from '../SearchableList';

interface OrganizationListProps extends PageProps {}

export const OrganizationList: FC<OrganizationListProps> = ({ paths }) => {
  const url = '';

  const { data: organizationsListQuery } = useOrganizationsListQuery();

  const handleError = useApolloErrorHandler();

  const [deleteOrganization] = useDeleteOrganizationMutation({
    refetchQueries: ['organizationsList'],
    awaitRefetchQueries: true,

    onError: handleError,
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteOrganization({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  const organizationsList =
    organizationsListQuery?.organizations?.map(
      c =>
        ({
          id: c.id,
          value: c.displayName,
          url: `${c.nameID}`,
        } as SearchableListItem)
    ) || [];

  return <ListPage data={organizationsList} paths={paths} onDelete={handleDelete} newLink={`${url}/new`} />;
};
export default OrganizationList;
