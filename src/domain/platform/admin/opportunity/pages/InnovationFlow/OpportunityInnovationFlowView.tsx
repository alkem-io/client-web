import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import {
  refetchOpportunityInnovationFlowQuery,
  useSpaceInnovationFlowTemplatesQuery,
  useOpportunityProfileInfoQuery,
  refetchInnovationFlowSettingsQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../../core/ui/loading/Loading';
import UpdateInnovationFlow from '../../../templates/InnovationTemplates/UpdateInnovationFlow';
import OpportunityLifecycleContainer from '../../../../../journey/opportunity/containers/OpportunityLifecycleContainer';
import { SelectInnovationFlowFormValuesType } from '../../../templates/InnovationTemplates/SelectInnovationFlowDialog';

const OpportunityInnovationFlowView: FC = () => {
  const { spaceNameId = '', opportunityNameId = '' } = useUrlParams();

  const { data: spaceInnovationFlowTemplates } = useSpaceInnovationFlowTemplatesQuery({
    variables: { spaceId: spaceNameId },
  });
  const innovationFlowTemplates = spaceInnovationFlowTemplates?.space?.templates?.innovationFlowTemplates;

  const { data: opportunityProfile } = useOpportunityProfileInfoQuery({
    variables: { spaceId: spaceNameId, opportunityId: opportunityNameId },
    skip: !spaceNameId || !opportunityNameId,
  });

  const opportunity = opportunityProfile?.space?.opportunity;
  const opportunityId = opportunity?.id || ''; // TODO
  const innovationFlowId = opportunity?.collaboration?.innovationFlow?.id || ''; // TODO
  const collaborationId = opportunity?.collaboration?.id || ''; // TODO;

  const [updateOpportunityInnovationFlow] = useUpdateInnovationFlowLifecycleTemplateMutation({
    refetchQueries: [
      refetchOpportunityInnovationFlowQuery({ opportunityId: opportunityNameId }),
      refetchInnovationFlowSettingsQuery({ collaborationId }),
    ],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    if (innovationFlowId) {
      updateOpportunityInnovationFlow({
        variables: {
          input: {
            innovationFlowId,
            innovationFlowTemplateID,
          },
        },
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <OpportunityLifecycleContainer opportunityId={opportunityId}>
        {({ loading, ...provided }) => {
          if (loading || !innovationFlowId) {
            return <Loading text="Loading" />;
          }

          return (
            <UpdateInnovationFlow
              entityId={innovationFlowId}
              innovationFlowTemplates={innovationFlowTemplates}
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
