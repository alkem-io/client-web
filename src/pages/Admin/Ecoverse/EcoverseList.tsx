import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { refetchEcoversesQuery, useDeleteEcoverseMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useEcoversesContext } from '../../../hooks';
import { PageProps } from '../..';
import Loading from '../../../components/core/Loading/Loading';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../../components/Admin/SearchableList';

interface EcoverseListProps extends PageProps {}

export const EcoverseList: FC<EcoverseListProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const handleError = useApolloErrorHandler();
  const { ecoverses, loading } = useEcoversesContext();
  const ecoverseList = useMemo(() => ecoverses.map(searchableListItemMapper(url)) || [], [ecoverses]);

  const [deleteEcoverse] = useDeleteEcoverseMutation({
    refetchQueries: [refetchEcoversesQuery()],
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

  if (loading) return <Loading text={'Loading ecoverses'} />;

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
