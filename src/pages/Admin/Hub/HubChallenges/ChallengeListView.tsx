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
import { useApolloErrorHandler, useNotification } from '../../../../hooks';
import { useHub } from '../../../../hooks';
import { useTranslation } from 'react-i18next';

interface ChallengeListProps extends PageProps {}

export const ChallengeListView: FC<ChallengeListProps> = ({ paths }) => {
  const handleError = useApolloErrorHandler();
  const { t } = useTranslation();
  const notify = useNotification();
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
    onCompleted: () => notify(t('pages.admin.challenge.notifications.challenge-removed'), 'success'),
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
