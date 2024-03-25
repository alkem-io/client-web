import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { ContextForm, ContextFormValues } from '../../../../../context/ContextForm';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import {
  refetchOpportunityProfileInfoQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import { OpportunityContextSegment } from '../../OpportunityContextSegment';
import SaveButton from '../../../../../../core/ui/actions/SaveButton';
import { useRouteResolver } from '../../../../../../main/routing/resolvers/RouteResolver';

const OpportunityContextView: FC = () => {
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { opportunityId } = useRouteResolver();

  const [updateOpportunity, { loading: isUpdating }] = useUpdateOpportunityMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchOpportunityProfileInfoQuery({ opportunityId: opportunityId! })],
    awaitRefetchQueries: true,
  });

  const { data: opportunityProfile, loading } = useOpportunityProfileInfoQuery({
    variables: { opportunityId: opportunityId! },
    skip: !opportunityId,
  });

  const opportunity = opportunityProfile?.lookup.opportunity;

  const onSubmit = async (values: ContextFormValues) => {
    if (!opportunity) {
      throw new TypeError('Opportunity is not loaded');
    }
    await updateOpportunity({
      variables: {
        input: {
          context: {
            impact: values.impact,
            vision: values.vision,
            who: values.who,
          },
          profileData: {
            description: values.background,
          },
          ID: opportunity.id,
        },
      },
    });
  };

  let submitWired;
  return (
    <Grid container spacing={2}>
      <ContextForm
        contextSegment={OpportunityContextSegment}
        context={opportunity?.context}
        profile={opportunity?.profile}
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

export default OpportunityContextView;
