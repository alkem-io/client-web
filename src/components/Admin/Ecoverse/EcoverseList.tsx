import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useDeleteEcoverseMutation, useEcoversesQuery } from '../../../generated/graphql';
import { useApolloErrorHandler } from '../../../hooks/useApolloErrorHandler';
import { PageProps } from '../../../pages';
import Loading from '../../core/Loading';
import ListPage from '../ListPage';
import { SearchableListItem, searchableListItemMapper } from '../SearchableList';

interface EcoverseListProps extends PageProps {}

export const EcoverseList: FC<EcoverseListProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const handleError = useApolloErrorHandler();
  const { data, loading } = useEcoversesQuery();
  const ecoverseList = useMemo(() => data?.ecoverses.map(searchableListItemMapper(url)) || [], [data]);

  const [deleteUser] = useDeleteEcoverseMutation({
    refetchQueries: ['ecoverses'],
    awaitRefetchQueries: true,
    onError: handleError,
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteUser({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  if (loading) return <Loading text={'Loading ecoverses'} />;

  return <ListPage data={ecoverseList} paths={paths} newLink={`${url}/new`} onDelete={handleDelete} />;
};
export default EcoverseList;
