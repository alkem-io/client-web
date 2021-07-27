import React, { FC } from 'react';
import { useRouteMatch } from 'react-router-dom';
import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import Loading from '../../../components/core/Loading';
import {
  refetchChallengesWithCommunityQuery,
  useChallengesWithCommunityQuery,
  useDeleteChallengeMutation,
} from '../../../components/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useEcoverse } from '../../../hooks';

interface ChallengeListProps extends PageProps {}

export const ChallengeList: FC<ChallengeListProps> = ({ paths }) => {
  const { url } = useRouteMatch();
  const handleError = useApolloErrorHandler();
  const { ecoverseId } = useEcoverse();
  const { data: challengesListQuery, loading } = useChallengesWithCommunityQuery({ variables: { ecoverseId } });

  const challengeList =
    challengesListQuery?.ecoverse?.challenges?.map(c => ({
      id: c.id,
      value: c.displayName,
      url: `${url}/${c.nameID}`,
    })) || [];

  const [deleteChallenge] = useDeleteChallengeMutation({
    refetchQueries: [
      refetchChallengesWithCommunityQuery({
        ecoverseId,
      }),
    ],
    awaitRefetchQueries: true,
    onError: handleError,
  });

  const handleDelete = (item: SearchableListItem) => {
    deleteChallenge({
      variables: {
        input: {
          ID: item.id,
        },
      },
    });
  };

  if (loading) return <Loading text={'Loading ecoverses'} />;

  return <ListPage data={challengeList} paths={paths} newLink={`${url}/new`} onDelete={handleDelete} />;
};
export default ChallengeList;
