import React, { FC } from 'react';

import { PageProps } from '../..';
import ListPage from '../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../components/Admin/SearchableList';
import Loading from '../../../components/core/Loading/Loading';
import {
  refetchChallengesWithCommunityQuery,
  useChallengesWithCommunityQuery,
  useDeleteChallengeMutation,
} from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import { useEcoverse } from '../../../hooks';

interface ChallengeListProps extends PageProps {}

export const ChallengeListPage: FC<ChallengeListProps> = ({ paths }) => {
  const url = '';
  const handleError = useApolloErrorHandler();
  const { ecoverseNameId } = useEcoverse();
  const { data: challengesListQuery, loading } = useChallengesWithCommunityQuery({
    variables: {
      ecoverseId: ecoverseNameId,
    },
  });

  const challengeList =
    challengesListQuery?.ecoverse?.challenges?.map(c => ({
      id: c.id,
      value: c.displayName,
      url: `${url}/${c.nameID}`,
    })) || [];

  const [deleteChallenge] = useDeleteChallengeMutation({
    refetchQueries: [
      refetchChallengesWithCommunityQuery({
        ecoverseId: ecoverseNameId,
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
export default ChallengeListPage;
