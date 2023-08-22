import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../../core/routing/useUrlParams';
import {
  refetchOpportunityInnovationFlowQuery,
  useSpaceInnovationFlowTemplatesQuery,
  useOpportunityProfileInfoQuery,
  useUpdateInnovationFlowLifecycleTemplateMutation,
  refetchInnovationFlowSettingsQuery,
} from '../../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../../core/ui/loading/Loading';
import UpdateInnovationFlow from '../../../templates/InnovationTemplates/UpdateInnovationFlow';
import OpportunityLifecycleContainer from '../../../../../journey/opportunity/containers/OpportunityLifecycleContainer';
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
  const innovationFlowID = opportunity?.innovationFlow?.id;

  const [updateOpportunityInnovationFlow] = useUpdateInnovationFlowLifecycleTemplateMutation({
    refetchQueries: [
      refetchOpportunityInnovationFlowQuery({ spaceId: spaceNameId, opportunityId: opportunityNameId }),
      refetchInnovationFlowSettingsQuery({
        spaceNameId,
        opportunityNameId,
        includeChallenge: false,
        includeOpportunity: true,
      }),
    ],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    if (innovationFlowID) {
      updateOpportunityInnovationFlow({
        variables: {
          input: {
            innovationFlowID,
            innovationFlowTemplateID,
          },
        },
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <OpportunityLifecycleContainer spaceNameId={spaceNameId} opportunityNameId={opportunityNameId}>
        {({ loading, ...provided }) => {
          if (loading || !innovationFlowID) {
            return <Loading text="Loading" />;
          }

          return (
            <UpdateInnovationFlow
              entityId={innovationFlowID}
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
