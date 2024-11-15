import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useNotification } from '@/core/ui/notifications/useNotification';

import SaveButton from '@/core/ui/actions/SaveButton';
import { ContextForm, ContextFormValues } from '../../../../context/ContextForm';
import { useRouteResolver } from '@/main/routing/resolvers/RouteResolver';
import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SubspaceContextSegment } from '../../../../platform/admin/subspace/SubspaceContextSegment';

const ChallengeContextView: FC = () => {
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { subSpaceId: challengeId } = useRouteResolver();

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: challengeId! })],
    awaitRefetchQueries: true,
  });

  const { data: subspaceProfile, loading } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: challengeId! },
    skip: !challengeId,
  });

  const challenge = subspaceProfile?.lookup.space;

  const onSubmit = async (values: ContextFormValues) => {
    if (!challengeId) {
      throw new Error('Challenge ID is required for updating challenge');
    }
    updateSubspace({
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
