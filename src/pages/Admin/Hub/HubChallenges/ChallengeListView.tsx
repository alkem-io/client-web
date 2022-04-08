import React, { FC } from 'react';

import { PageProps } from '../../../index';
import ListPage from '../../../../components/Admin/ListPage';
import { SearchableListItem } from '../../../../components/Admin/SearchableList';
import Loading from '../../../../components/core/Loading/Loading';
import {
  refetchChallengesWithCommunityQuery,
  useChallengesWithCommunityQuery,
  useDeleteChallengeMutation,
} from '../../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../../hooks';
import { useHub } from '../../../../hooks';

interface ChallengeListProps extends PageProps {}

export const ChallengeListView: FC<ChallengeListProps> = ({ paths }) => {
  const handleError = useApolloErrorHandler();
  const { hubNameId } = useHub();
  const { data: challengesListQuery, loading } = useChallengesWithCommunityQuery({
    variables: {
      hubId: hubNameId,
    },
  });

  const challengeList =
    challengesListQuery?.hub?.challenges?.map(c => ({
      id: c.id,
      value: c.displayName,
      url: `${c.nameID}`,
    })) || [];

  const [deleteChallenge] = useDeleteChallengeMutation({
    refetchQueries: [
      refetchChallengesWithCommunityQuery({
        hubId: hubNameId,
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

  if (loading) return <Loading text={'Loading hubs'} />;

  return <ListPage data={challengeList} paths={paths} newLink="new" onDelete={handleDelete} />;
};

export default ChallengeListView;
