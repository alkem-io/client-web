import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApolloErrorHandler, useChallenge, useNotification, useUrlParams } from '../../../../hooks';
import {
  refetchOpportunityProfileInfoQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../../../hooks/generated/graphql';
import { updateContextInput } from '../../../../utils/buildContext';
import Button from '../../../../components/core/Button';
import { Context } from '../../../../models/graphql-schema';
import ContextForm, { ContextFormValues } from '../../../../components/composite/forms/ContextForm';
import Loading from '../../../../components/core/Loading/Loading';
import EditLifecycle from '../../../../components/Admin/EditLifecycle';
import OpportunityLifecycleContainer from '../../../../containers/opportunity/OpportunityLifecycleContainer';

const OpportunityContextView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const onSuccess = (message: string) => notify(message, 'success');

  const { challengeId } = useChallenge();

  const { hubNameId = '', opportunityNameId = '' } = useUrlParams();

  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    onError: handleError,
    refetchQueries: [refetchOpportunityProfileInfoQuery({ hubId: hubNameId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    skip: false,
  });

  const opportunity = opportunityProfile?.hub?.opportunity;
  const opportunityId = useMemo(() => opportunity?.id || '', [opportunity]);

  const onSubmit = async (values: ContextFormValues) => {
    updateOpportunity({
      variables: {
        input: {
          context: updateContextInput(values),
          ID: opportunityId,
        },
      },
    });
  };

  let submitWired;
  return (
    <Grid container spacing={2}>
      <ContextForm
        context={opportunity?.context as Context}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <Button disabled={isUpdating} color="primary" onClick={() => submitWired()}>
          {t(`buttons.${isUpdating ? 'processing' : 'save'}` as const)}
        </Button>
      </Grid>
      <OpportunityLifecycleContainer hubNameId={hubNameId} opportunityNameId={opportunityNameId}>
        {({ loading, ...provided }) => {
          if (loading) {
            return <Loading text="Loading" />;
          }

          return <EditLifecycle id={challengeId} {...provided} />;
        }}
      </OpportunityLifecycleContainer>
    </Grid>
  );
};
export default OpportunityContextView;
