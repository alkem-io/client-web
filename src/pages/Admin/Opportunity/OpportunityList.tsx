import React, { FC } from 'react';

import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import Loading from '../../../components/core/Loading/Loading';
import {
  refetchOpportunitiesQuery,
  useDeleteOpportunityMutation,
  useOpportunitiesQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler, useUrlParams } from '../../../hooks';
import { useHub } from '../../../hooks';
import { useResolvedPath } from 'react-router-dom';

interface OpportunityListProps extends PageProps {}

export const OpportunityList: FC<OpportunityListProps> = ({ paths }) => {
  const { pathname: url } = useResolvedPath('.');
  const handleError = useApolloErrorHandler();
  const { hubNameId } = useHub();
  const { challengeNameId = '' } = useUrlParams();
  const { data: challengesListQuery, loading } = useOpportunitiesQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
  });

  const opportunityList =
    challengesListQuery?.hub?.challenge?.opportunities?.map(o => ({
      id: o.id,
      value: o.displayName,
      url: `${o.nameID}`,
    })) || [];

  const [deleteOpportunity] = useDeleteOpportunityMutation({
    refetchQueries: [
      refetchOpportunitiesQuery({
        hubId: hubNameId,
        challengeId: challengeNameId,
      }),
    ],
    awaitRefetchQueries: true,
    onError: handleError,
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteOpportunity({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  if (loading) return <Loading text={'Loading hubs'} />;

  return <ListPage data={opportunityList} paths={paths} newLink={`${url}/new`} onDelete={handleDelete} />;
};
export default OpportunityList;
