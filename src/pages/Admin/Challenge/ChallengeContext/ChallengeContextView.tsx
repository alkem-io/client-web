import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Path } from '../../../../context/NavigationProvider';
import { useApolloErrorHandler, useNotification, useUpdateNavigation, useUrlParams } from '../../../../hooks';
import {
  refetchChallengeProfileInfoQuery,
  useChallengeProfileInfoQuery,
  useUpdateChallengeMutation,
} from '../../../../hooks/generated/graphql';
import { updateContextInput } from '../../../../utils/buildContext';
import Button from '../../../../components/core/Button';
import ContextForm, { ContextFormValues } from '../../../../components/composite/forms/ContextForm';
import Loading from '../../../../components/core/Loading/Loading';
import EditLifecycle from '../../../../components/Admin/EditLifecycle';
import ChallengeLifecycleContainer from '../../../../containers/challenge/ChallengeLifecycleContainer';

interface Props {
  paths: Path[];
}

const EditChallengePage: FC<Props> = ({ paths }) => {
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

  const currentPaths = useMemo(
    () => [...paths, { name: challengeId ? 'edit' : 'new', real: false }],
    [paths, challenge]
  );
  useUpdateNavigation({ currentPaths });

  const onSubmit = async (values: ContextFormValues) => {
    updateChallenge({
      variables: {
        input: {
          ID: challengeId,
          // nameID: nameID,
          // displayName: name,
          context: updateContextInput(values),
          // tags: tagsets.flatMap(x => x.tags),
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
      <ChallengeLifecycleContainer hubNameId={hubNameId} challengeNameId={challengeId}>
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

export default EditChallengePage;
