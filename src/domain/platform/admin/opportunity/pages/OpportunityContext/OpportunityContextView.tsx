import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { updateContextInput } from '../../../../../../common/utils/buildContext';
import { ContextForm, ContextFormValues } from '../../../../../context/ContextForm';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import {
  useUpdateOpportunityMutation,
  refetchOpportunityProfileInfoQuery,
  useOpportunityProfileInfoQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { Context } from '../../../../../../core/apollo/generated/graphql-schema';
import { OpportunityContextSegment } from '../../OpportunityContextSegment';
import { LoadingButton } from '@mui/lab';

const OpportunityContextView: FC = () => {
  const { t } = useTranslation();
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { hubNameId = '', opportunityNameId = '' } = useUrlParams();

  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchOpportunityProfileInfoQuery({ hubId: hubNameId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile, loading } = useOpportunityProfileInfoQuery({
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
        contextSegment={OpportunityContextSegment}
        context={opportunity?.context as Context}
        loading={loading || isUpdating}
        onSubmit={onSubmit}
        wireSubmit={submit => (submitWired = submit)}
      />
      <Grid container item justifyContent={'flex-end'}>
        <LoadingButton loading={isUpdating} variant="contained" onClick={() => submitWired()}>
          {t(`buttons.${isUpdating ? 'processing' : 'save'}` as const)}
        </LoadingButton>
      </Grid>
    </Grid>
  );
};

export default OpportunityContextView;
