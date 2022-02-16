import React, { FC, useMemo } from 'react';

import {
  refetchAdminEcoversesListQuery,
  useAdminEcoversesListQuery,
  useDeleteEcoverseMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useNotification } from '../../../hooks';
import { PageProps } from '../..';
import Loading from '../../../components/core/Loading/Loading';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../../components/Admin/SearchableList';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';
import { useResolvedPath } from 'react-router-dom';

interface EcoverseListProps extends PageProps {}

export const EcoverseList: FC<EcoverseListProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const handleError = useApolloErrorHandler();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { data: hubsData, loading: loadingEcoverses } = useAdminEcoversesListQuery();
  const hubList = useMemo(
    () =>
      hubsData?.hubs
        .filter(x => (x.authorization?.myPrivileges ?? []).find(y => y === AuthorizationPrivilege.Update))
        .map(searchableListItemMapper()) || [],
    [hubsData]
  );

  const [deleteEcoverse] = useDeleteEcoverseMutation({
    refetchQueries: [refetchAdminEcoversesListQuery()],
    awaitRefetchQueries: true,
    onError: handleError,
    onCompleted: data => onSuccess(`Hub '${data.deleteEcoverse.displayName}' deleted successfuly`),
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteEcoverse({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  if (loadingEcoverses) return <Loading text={'Loading hubs'} />;

  return (
    <ListPage
      data={hubList}
      paths={paths}
      newLink={`${url}/new`}
      onDelete={hubList.length > 1 ? handleDelete : undefined}
    />
  );
};
export default EcoverseList;
