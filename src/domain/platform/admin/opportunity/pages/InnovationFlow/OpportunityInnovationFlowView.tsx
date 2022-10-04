import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../../../hooks';
import {
  useHubLifecycleTemplatesQuery,
  useOpportunityProfileInfoQuery,
} from '../../../../../../hooks/generated/graphql';
import Loading from '../../../../../../common/components/core/Loading/Loading';
import EditLifecycle from '../../../../../platform/admin/templates/InnovationTemplates/EditLifecycle';
import OpportunityLifecycleContainer from '../../../../../../containers/opportunity/OpportunityLifecycleContainer';
import { LifecycleType } from '../../../../../../models/graphql-schema';

const OpportunityInnovationFlowView: FC = () => {
  const { hubNameId = '', opportunityNameId = '' } = useUrlParams();

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
  const opportunityId = useMemo(() => opportunity?.id, [opportunity]);

  return (
    <Grid container spacing={2}>
      <OpportunityLifecycleContainer hubNameId={hubNameId} opportunityNameId={opportunityNameId}>
        {({ loading, ...provided }) => {
          if (loading || !opportunityId) {
            return <Loading text="Loading" />;
          }

          return (
            <EditLifecycle id={opportunityId} innovationFlowTemplates={filteredInnovationFlowTemplates} {...provided} />
          );
        }}
      </OpportunityLifecycleContainer>
    </Grid>
  );
};

export default OpportunityInnovationFlowView;
