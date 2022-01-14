import React, { FC, useCallback } from 'react';

import { PageProps } from '../..';
import { ListPage } from '../../../components/Admin/ListPage';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../hooks';
import { useDeleteGroupMutation, useOrganizationGroupsQuery } from '../../../hooks/generated/graphql';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import removeFromCache from '../../../utils/apollo-cache/removeFromCache';
import { useResolvedPath } from 'react-router-dom';

export const OrganizationGroupsPage: FC<PageProps> = ({ paths }) => {
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const notifySuccess = () => notify('Group deleted successfully!', 'success');

  const { pathname: url } = useResolvedPath('./');
  const { organizationNameId = '' } = useUrlParams();

  const { data } = useOrganizationGroupsQuery({ variables: { id: organizationNameId } });
  const groups = data?.organization?.groups?.map(g => ({ id: g.id, value: g.name, url: `${url}/${g.id}` }));

  const [deleteGroup] = useDeleteGroupMutation({
    onError: handleError,
    onCompleted: notifySuccess,
  });

  const handleDeleteGroup = useCallback(
    ({ id }: SearchableListItem) => {
      deleteGroup({
        variables: { input: { ID: id } },
        update: removeFromCache,
      });
    },
    [groups]
  );

  return <ListPage paths={paths} data={groups || []} newLink={`${url}/new`} onDelete={handleDeleteGroup} />;
};
