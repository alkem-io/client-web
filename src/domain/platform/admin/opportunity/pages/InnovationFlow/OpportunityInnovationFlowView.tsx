import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import {
  useSpaceInnovationFlowTemplatesQuery,
  useOpportunityProfileInfoQuery,
  refetchInnovationFlowSettingsQuery,
  useUpdateInnovationFlowStatesFromTemplateMutation,
  refetchInnovationFlowQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../../core/ui/loading/Loading';
import UpdateInnovationFlow from '../../../templates/InnovationTemplates/UpdateInnovationFlow';
import InnovationFlowContainer from '../../../../../collaboration/InnovationFlow/containers/InnovationFlowContainer';
import { SelectInnovationFlowFormValuesType } from '../../../templates/InnovationTemplates/SelectInnovationFlowDialog';
/**
 * @deprecated This file is going to be removed in very soon
 */
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
  const collaborationId = opportunity?.collaboration?.id;
  const innovationFlowId = opportunity?.collaboration?.innovationFlow?.id;

  const [updateOpportunityInnovationFlow] = useUpdateInnovationFlowStatesFromTemplateMutation({
    refetchQueries: [
      refetchInnovationFlowQuery({ innovationFlowId: innovationFlowId! }),
      refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
    ],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    if (innovationFlowId) {
      updateOpportunityInnovationFlow({
        variables: {
          innovationFlowId,
          innovationFlowTemplateId: values.innovationFlowTemplateId,
        },
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <InnovationFlowContainer innovationFlowId={innovationFlowId}>
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
      </InnovationFlowContainer>
    </Grid>
  );
};

export default OpportunityInnovationFlowView;
