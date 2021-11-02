import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import {
  refetchAdminEcoversesListQuery,
  useAdminEcoversesListQuery,
  useDeleteEcoverseMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { PageProps } from '../..';
import Loading from '../../../components/core/Loading/Loading';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../../components/Admin/SearchableList';
import { AuthorizationPrivilege } from '../../../models/graphql-schema';

interface EcoverseListProps extends PageProps {}

export const EcoverseList: FC<EcoverseListProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const handleError = useApolloErrorHandler();
  const { data: ecoversesData, loading: loadingEcoverses } = useAdminEcoversesListQuery();
  const ecoverseList = useMemo(
    () =>
      ecoversesData?.ecoverses
        .filter(x => (x.authorization?.myPrivileges ?? []).find(y => y === AuthorizationPrivilege.Update))
        .map(searchableListItemMapper(url)) || [],
    [ecoversesData]
  );

  const [deleteEcoverse] = useDeleteEcoverseMutation({
    refetchQueries: [refetchAdminEcoversesListQuery()],
    awaitRefetchQueries: true,
    onError: handleError,
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

  if (loadingEcoverses) return <Loading text={'Loading ecoverses'} />;

  return (
    <ListPage
      data={ecoverseList}
      paths={paths}
      newLink={`${url}/new`}
      onDelete={ecoverseList.length > 1 ? handleDelete : undefined}
    />
  );
};
export default EcoverseList;
