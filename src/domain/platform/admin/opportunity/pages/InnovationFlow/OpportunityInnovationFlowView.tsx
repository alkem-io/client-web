import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import { useApolloErrorHandler } from '../../../../../../core/apollo/hooks/useApolloErrorHandler';
import {
  refetchOpportunityLifecycleQuery,
  useHubLifecycleTemplatesQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityInnovationFlowMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../../common/components/core/Loading/Loading';
import UpdateInnovationFlow from '../../../templates/InnovationTemplates/UpdateInnovationFlow';
import OpportunityLifecycleContainer from '../../../../../../containers/opportunity/OpportunityLifecycleContainer';
import { LifecycleType } from '../../../../../../core/apollo/generated/graphql-schema';
import { SelectInnovationFlowFormValuesType } from '../../../templates/InnovationTemplates/SelectInnovationFlowDialog';

const OpportunityInnovationFlowView: FC = () => {
  const { hubNameId = '', opportunityNameId = '' } = useUrlParams();
  const handleError = useApolloErrorHandler();

  const { data: hubLifecycleTemplates } = useHubLifecycleTemplatesQuery({
    variables: { hubId: hubNameId },
  });
  const innovationFlowTemplates = hubLifecycleTemplates?.hub?.templates?.lifecycleTemplates;
  const filteredInnovationFlowTemplates = innovationFlowTemplates?.filter(
    template => template.type === LifecycleType.Opportunity
  );

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { hubId: hubNameId, opportunityId: opportunityNameId },
    skip: !hubNameId || !opportunityNameId,
  });

  const opportunity = opportunityProfile?.hub?.opportunity;
  const opportunityId = opportunity?.id;

  const [updateOpportunityInnovationFlow] = useUpdateOpportunityInnovationFlowMutation({
    onError: handleError,
    refetchQueries: [refetchOpportunityLifecycleQuery({ hubId: hubNameId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    if (opportunityId) {
      updateOpportunityInnovationFlow({
        variables: {
          input: {
            opportunityID: opportunityId,
            innovationFlowTemplateID: innovationFlowTemplateID,
          },
        },
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <OpportunityLifecycleContainer hubNameId={hubNameId} opportunityNameId={opportunityNameId}>
        {({ loading, ...provided }) => {
          if (loading || !opportunityId) {
            return <Loading text="Loading" />;
          }

          return (
            <UpdateInnovationFlow
              entityId={opportunityId}
              innovationFlowTemplates={filteredInnovationFlowTemplates}
              onSubmit={onSubmit}
              {...provided}
            />
          );
        }}
      </OpportunityLifecycleContainer>
    </Grid>
  );
};

export default OpportunityInnovationFlowView;
