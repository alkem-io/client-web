import { Grid } from '@mui/material';
import { useNotification } from '@/core/ui/notifications/useNotification';

import SaveButton from '@/core/ui/actions/SaveButton';
import { ContextForm, ContextFormValues } from '@/domain/context/ContextForm';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '@/core/apollo/generated/apollo-hooks';
import { SubspaceContextSegment } from '@/domain/platform/admin/subspace/SubspaceContextSegment';
import useEnsurePresence from '@/core/utils/ensurePresence';

const ChallengeContextView = () => {
  const notify = useNotification();
  const ensurePresence = useEnsurePresence();
  const onSuccess = (message: string) => notify(message, 'success');

  const { spaceId } = useUrlResolver();

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: spaceId! })],
    awaitRefetchQueries: true,
  });

  const { data: subspaceProfile, loading } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: spaceId! },
    skip: !spaceId,
  });

  const challenge = subspaceProfile?.lookup.space;

  const onSubmit = (values: ContextFormValues) => {
    const requiredSpaceId = ensurePresence(spaceId);

    return updateSubspace({
      variables: {
        input: {
          ID: requiredSpaceId,
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
