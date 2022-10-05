import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useApolloErrorHandler, useUrlParams } from '../../../../../hooks';
import {
  refetchChallengeLifecycleQuery,
  useChallengeProfileInfoQuery,
  useHubLifecycleTemplatesQuery,
  useUpdateChallengeInnovationFlowMutation,
} from '../../../../../hooks/generated/graphql';
import Loading from '../../../../../common/components/core/Loading/Loading';
import UpdateInnovationFlow from '../../../../platform/admin/templates/InnovationTemplates/UpdateInnovationFlow';
import ChallengeLifecycleContainer from '../../../../../containers/challenge/ChallengeLifecycleContainer';
import { LifecycleType } from '../../../../../models/graphql-schema';
import { SelectInnovationFlowFormValuesType } from '../../../../platform/admin/templates/InnovationTemplates/SelectInnovationFlowDialog';

const ChallengeInnovationFlowView: FC = () => {
  const { challengeNameId = '', hubNameId = '' } = useUrlParams();
  const handleError = useApolloErrorHandler();

  const { data: hubLifecycleTemplates } = useHubLifecycleTemplatesQuery({
    variables: { hubId: hubNameId },
  });
  const innovationFlowTemplates = hubLifecycleTemplates?.hub?.templates?.lifecycleTemplates;
  const filteredInnovationFlowTemplates = innovationFlowTemplates?.filter(
    template => template.type === LifecycleType.Challenge
  );

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { hubId: hubNameId, challengeId: challengeNameId },
    skip: !hubNameId || !challengeNameId,
  });
  const challenge = challengeProfile?.hub?.challenge;
  const challengeId = challenge?.id;

  const [updateChallengeInnovationFlow] = useUpdateChallengeInnovationFlowMutation({
    onError: handleError,
    refetchQueries: [refetchChallengeLifecycleQuery({ hubId: hubNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    if (challengeId) {
      updateChallengeInnovationFlow({
        variables: {
          input: {
            challengeID: challengeId,
            innovationFlowTemplateID: innovationFlowTemplateID,
          },
        },
      });
    }
  };

  return (
    <Grid container spacing={2}>
      <ChallengeLifecycleContainer hubNameId={hubNameId} challengeNameId={challengeNameId}>
        {({ loading, ...provided }) => {
          if (loading || !challengeId) {
            return <Loading text="Loading" />;
          }

          return (
            <UpdateInnovationFlow
              entityId={challengeId}
              innovationFlowTemplates={filteredInnovationFlowTemplates}
              onSubmit={onSubmit}
              {...provided}
            />
          );
        }}
      </ChallengeLifecycleContainer>
    </Grid>
  );
};

export default ChallengeInnovationFlowView;
