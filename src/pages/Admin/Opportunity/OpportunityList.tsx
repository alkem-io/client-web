import React, { FC } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import Loading from '../../../components/core/Loading';
import {
  refetchOpportunitiesQuery,
  useDeleteOpportunityMutation,
  useOpportunitiesQuery,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useEcoverse } from '../../../hooks';
import { AdminParameters } from '../../../routing/admin/admin';

interface OpportunityListProps extends PageProps {}

export const OpportunityList: FC<OpportunityListProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const handleError = useApolloErrorHandler();
  const { ecoverseId } = useEcoverse();
  const { challengeId } = useParams<AdminParameters>();
  const { data: challengesListQuery, loading } = useOpportunitiesQuery({ variables: { ecoverseId, challengeId } });

  const opportunityList =
    challengesListQuery?.ecoverse?.challenge?.opportunities?.map(o => ({
      id: o.id,
      value: o.displayName,
      url: `${url}/${o.nameID}`,
    })) || [];

  const [deleteOpportunity] = useDeleteOpportunityMutation({
    refetchQueries: [
      refetchOpportunitiesQuery({
        ecoverseId,
        challengeId,
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

  if (loading) return <Loading text={'Loading ecoverses'} />;

  return <ListPage data={opportunityList} paths={paths} newLink={`${url}/new`} onDelete={handleDelete} />;
};
export default OpportunityList;
