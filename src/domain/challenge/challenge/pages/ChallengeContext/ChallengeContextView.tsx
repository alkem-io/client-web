import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useNotification, useUrlParams } from '../../../../../hooks';
import {
  refetchChallengeProfileInfoQuery,
  useChallengeProfileInfoQuery,
  useUpdateChallengeMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import WrapperButton from '../../../../../common/components/core/WrapperButton';
import { ContextForm, ContextFormValues } from '../../../../context/ContextForm';
import { ChallengeContextSegment } from '../../../../platform/admin/challenge/ChallengeContextSegment';

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

  const { data: challengeProfile, loading } = useChallengeProfileInfoQuery({
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
      <ContextForm
        contextSegment={ChallengeContextSegment}
        context={challenge?.context}
        loading={loading || isUpdating}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <WrapperButton
          disabled={isUpdating}
          variant="primary"
          onClick={() => submitWired()}
          text={t(`buttons.${isUpdating ? 'processing' : 'save'}` as const)}
        />
      </Grid>
    </Grid>
  );
};

export default ChallengeContextView;
