import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../../hooks';
import {
  refetchChallengeProfileInfoQuery,
  useChallengeProfileInfoQuery,
  useUpdateChallengeMutation,
} from '../../../../hooks/generated/graphql';
import { updateContextInput } from '../../../../common/utils/buildContext';
import Button from '../../../../common/components/core/Button';
import ContextForm, { ContextFormValues } from '../../../../common/components/composite/forms/ContextForm';
import Loading from '../../../../common/components/core/Loading/Loading';
import EditLifecycle from '../../../admin/components/EditLifecycle';
import ChallengeLifecycleContainer from '../../../../containers/challenge/ChallengeLifecycleContainer';

const ChallengeContextView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeNameId = '', hubNameId = '' } = useUrlParams();

  const [updateChallenge, { loading: isUpdating }] = useUpdateChallengeMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchChallengeProfileInfoQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    skip: false,
  });
  const challenge = challengeProfile?.hub?.challenge;
  const challengeId = challenge?.id || '';

  const onSubmit = async (values: ContextFormValues) => {
    updateChallenge({
      variables: {
        input: {
          ID: challengeId,
          context: updateContextInput(values),
        },
      },
    });
  };

  let submitWired;
  return (
    <Grid container spacing={2}>
      <ContextForm context={challenge?.context} onSubmit={onSubmit} wireSubmit={submit => (submitWired = submit)} />
      <Grid container item justifyContent={'flex-end'}>
        <Button
          disabled={isUpdating}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isUpdating ? 'processing' : 'save'}` as const)}
        />
      </Grid>
      <ChallengeLifecycleContainer hubNameId={hubNameId} challengeNameId={challengeNameId}>
        {({ loading, ...provided }) => {
          if (loading) {
            return <Loading text="Loading" />;
          }

          return <EditLifecycle id={challengeId} {...provided} />;
        }}
      </ChallengeLifecycleContainer>
    </Grid>
  );
};

export default ChallengeContextView;
