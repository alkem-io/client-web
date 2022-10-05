import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../../../../../hooks';
import {
  refetchOpportunityLifecycleQuery,
  useHubLifecycleTemplatesQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityInnovationFlowMutation,
} from '../../../../../../hooks/generated/graphql';
import Loading from '../../../../../../common/components/core/Loading/Loading';
import UpdateInnovationFlow from '../../../templates/InnovationTemplates/UpdateInnovationFlow';
import OpportunityLifecycleContainer from '../../../../../../containers/opportunity/OpportunityLifecycleContainer';
import { LifecycleType } from '../../../../../../models/graphql-schema';
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
    skip: false,
  });

  const opportunity = opportunityProfile?.hub?.opportunity;
  const opportunityId = useMemo(() => opportunity?.id || '', [opportunity]);

  const [updateOpportunityInnovationFlow] = useUpdateOpportunityInnovationFlowMutation({
    onError: handleError,
    refetchQueries: [refetchOpportunityLifecycleQuery({ hubId: hubNameId, opportunityId: opportunityNameId })],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    updateOpportunityInnovationFlow({
      variables: {
        input: {
          opportunityID: opportunityId,
          innovationFlowTemplateID: innovationFlowTemplateID,
        },
      },
    });
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
              id={opportunityId}
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
