import { Button, Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { updateContextInput } from '../../../../../common/utils/buildContext';
import EditLifecycle from '../../../components/EditLifecycle';
import ContextForm, { ContextFormValues } from '../../../../../common/components/composite/forms/ContextForm';
import { Loading } from '../../../../../common/components/core';
import OpportunityLifecycleContainer from '../../../../../containers/opportunity/OpportunityLifecycleContainer';
import { useNotification, useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import {
  useUpdateOpportunityMutation,
  refetchOpportunityProfileInfoQuery,
  useOpportunityProfileInfoQuery,
} from '../../../../../hooks/generated/graphql';
import { Context } from '../../../../../models/graphql-schema';

const OpportunityContextView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const handleError = useApolloErrorHandler();
  const onSuccess = (message: string) => notify(message, 'success');

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
  const opportunityId = useMemo(() => opportunity?.id, [opportunity]);

  const onSubmit = async (values: ContextFormValues) => {
    if (!opportunityId) {
      throw new TypeError('Missing Opportunity ID');
    }
    await updateOpportunity({
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
          if (loading || !opportunityId) {
            return <Loading text="Loading" />;
          }

          return <EditLifecycle id={opportunityId} {...provided} />;
        }}
      </OpportunityLifecycleContainer>
    </Grid>
  );
};
export default OpportunityContextView;
