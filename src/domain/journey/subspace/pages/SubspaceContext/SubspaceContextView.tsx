import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useNotification } from '../../../../../core/ui/notifications/useNotification';
import {
  refetchChallengeProfileInfoQuery,
  useChallengeProfileInfoQuery,
  useUpdateChallengeMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import SaveButton from '../../../../../core/ui/actions/SaveButton';
import { ContextForm, ContextFormValues } from '../../../../context/ContextForm';
import { SubspaceContextSegment } from '../../../../platform/admin/challenge/SubspaceContextSegment';
import { useRouteResolver } from '../../../../../main/routing/resolvers/RouteResolver';

const ChallengeContextView: FC = () => {
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeId } = useRouteResolver();

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchChallengeProfileInfoQuery({ challengeId: challengeId! })],
    awaitRefetchQueries: true,
  });

  const { data: challengeProfile, loading } = useChallengeProfileInfoQuery({
    variables: { challengeId: challengeId! },
    skip: !challengeId,
  });

  const challenge = challengeProfile?.lookup.subspace;

  const onSubmit = async (values: ContextFormValues) => {
    if (!challengeId) {
      throw new Error('Challenge ID is required for updating challenge');
    }
    updateChallenge({
      variables: {
        input: {
          ID: challengeId,
          context: {
            impact: values.impact,
            vision: values.vision,
            who: values.who,
          },
          profileData: {
            description: values.background,
          },
        },
      },
    });
  };

  let submitWired;
  return (
    <Grid container spacing={2}>
      <ContextForm
        contextSegment={SubspaceContextSegment}
        context={challenge?.context}
        profile={challenge?.profile}
        loading={loading || isUpdating}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <SaveButton loading={isUpdating} onClick={() => submitWired()} />
      </Grid>
    </Grid>
  );
};

export default ChallengeContextView;
