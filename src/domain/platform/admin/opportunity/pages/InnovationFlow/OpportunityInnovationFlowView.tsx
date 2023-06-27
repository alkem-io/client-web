import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import {
  refetchOpportunityLifecycleQuery,
  useSpaceInnovationFlowTemplatesQuery,
  useOpportunityProfileInfoQuery,
  useUpdateOpportunityInnovationFlowMutation,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../../common/components/core/Loading/Loading';
import UpdateInnovationFlow from '../../../templates/InnovationTemplates/UpdateInnovationFlow';
import OpportunityLifecycleContainer from '../../../../../challenge/opportunity/containers/OpportunityLifecycleContainer';
import { InnovationFlowType } from '../../../../../../core/apollo/generated/graphql-schema';
import { SelectInnovationFlowFormValuesType } from '../../../templates/InnovationTemplates/SelectInnovationFlowDialog';

const OpportunityInnovationFlowView: FC = () => {
  const { spaceNameId = '', opportunityNameId = '' } = useUrlParams();

  const { data: spaceInnovationFlowTemplates } = useSpaceInnovationFlowTemplatesQuery({
    variables: { spaceId: spaceNameId },
  });
  const innovationFlowTemplates = spaceInnovationFlowTemplates?.space?.templates?.innovationFlowTemplates;
  const filteredInnovationFlowTemplates = innovationFlowTemplates?.filter(
    template => template.type === InnovationFlowType.Opportunity
  );

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { spaceId: spaceNameId, opportunityId: opportunityNameId },
    skip: !spaceNameId || !opportunityNameId,
  });

  const opportunity = opportunityProfile?.space?.opportunity;
  const opportunityId = opportunity?.id;

  const [updateOpportunityInnovationFlow] = useUpdateOpportunityInnovationFlowMutation({
    refetchQueries: [refetchOpportunityLifecycleQuery({ spaceId: spaceNameId, opportunityId: opportunityNameId })],
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
      <OpportunityLifecycleContainer spaceNameId={spaceNameId} opportunityNameId={opportunityNameId}>
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
