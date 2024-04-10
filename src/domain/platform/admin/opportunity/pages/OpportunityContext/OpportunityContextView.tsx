import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { ContextForm, ContextFormValues } from '../../../../../context/ContextForm';
import { useNotification } from '../../../../../../core/ui/notifications/useNotification';
import { OpportunityContextSegment } from '../../OpportunityContextSegment';
import SaveButton from '../../../../../../core/ui/actions/SaveButton';
import { useRouteResolver } from '../../../../../../main/routing/resolvers/RouteResolver';
import {
  refetchSubspaceProfileInfoQuery,
  useSubspaceProfileInfoQuery,
  useUpdateSpaceMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';

const OpportunityContextView: FC = () => {
  const notify = useNotification();
  const onSuccess = (message: string) => notify(message, 'success');

  const { opportunityId } = useRouteResolver();

  const [updateSubspace, { loading: isUpdating }] = useUpdateSpaceMutation({
    onCompleted: () => onSuccess('Successfully updated'),
    refetchQueries: [refetchSubspaceProfileInfoQuery({ subspaceId: opportunityId! })],
    awaitRefetchQueries: true,
  });

  const { data: subspacePrfile, loading } = useSubspaceProfileInfoQuery({
    variables: { subspaceId: opportunityId! },
    skip: !opportunityId,
  });

  const opportunity = subspacePrfile?.space;

  const onSubmit = async (values: ContextFormValues) => {
    if (!opportunity) {
      throw new TypeError('Opportunity is not loaded');
    }
    await updateSubspace({
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
