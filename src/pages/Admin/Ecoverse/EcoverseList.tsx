import React, { FC, useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { refetchEcoversesQuery, useDeleteEcoverseMutation, useEcoversesQuery } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { PageProps } from '../..';
import Loading from '../../../components/core/Loading/Loading';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem, searchableListItemMapper } from '../../../components/Admin/SearchableList';

interface EcoverseListProps extends PageProps {}

export const EcoverseList: FC<EcoverseListProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const handleError = useApolloErrorHandler();
  const { data: ecoversesData, loading: loadingEcoverses } = useEcoversesQuery();
  const ecoverseList = useMemo(
    () => ecoversesData?.ecoverses.map(searchableListItemMapper(url)) || [],
    [ecoversesData]
  );

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
