import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../hooks';
import { useChallengeProfileInfoQuery } from '../../../../../hooks/generated/graphql';
import Loading from '../../../../../common/components/core/Loading/Loading';
import EditLifecycle from '../../../../platform/admin/templates/InnovationTemplates/EditLifecycle';
import ChallengeLifecycleContainer from '../../../../../containers/challenge/ChallengeLifecycleContainer';

const ChallengeInnovationFlowView: FC = () => {
  const { challengeNameId = '', hubNameId = '' } = useUrlParams();

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    skip: false,
  });
  const challenge = challengeProfile?.hub?.challenge;
  const challengeId = challenge?.id || '';

  return (
    <Grid container spacing={2}>
      <ChallengeLifecycleContainer hubNameId={hubNameId} challengeNameId={challengeNameId}>
        {({ loading, ...provided }) => {
          if (loading) {
            return <Loading text="Loading" />;
          }

          return <EditLifecycle id={challengeId} {...provided} />;
        }}
      </ChallengeLifecycleContainer>
    </Grid>
  );
};

export default ChallengeInnovationFlowView;
