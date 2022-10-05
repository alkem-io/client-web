import { Grid } from '@mui/material';
import React, { FC, useMemo } from 'react';
import { useUrlParams } from '../../../../../../hooks';
import { useOpportunityProfileInfoQuery } from '../../../../../../hooks/generated/graphql';
import Loading from '../../../../../../common/components/core/Loading/Loading';
import EditLifecycle from '../../../../../platform/admin/templates/InnovationTemplates/EditLifecycle';
import OpportunityLifecycleContainer from '../../../../../../containers/opportunity/OpportunityLifecycleContainer';

const OpportunityInnovationFlowView: FC = () => {
  const { hubNameId = '', opportunityNameId = '' } = useUrlParams();

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

          return <EditLifecycle id={opportunityId} {...provided} />;
        }}
      </OpportunityLifecycleContainer>
    </Grid>
  );
};

export default OpportunityInnovationFlowView;
