import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import {
  refetchChallengeLifecycleQuery,
  useChallengeProfileInfoQuery,
  useSpaceInnovationFlowTemplatesQuery,
  useUpdateInnovationFlowLifecycleTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../common/components/core/Loading/Loading';
import UpdateInnovationFlow from '../../../../platform/admin/templates/InnovationTemplates/UpdateInnovationFlow';
import ChallengeLifecycleContainer from '../../containers/ChallengeLifecycleContainer';
import { InnovationFlowType } from '../../../../../core/apollo/generated/graphql-schema';
import { SelectInnovationFlowFormValuesType } from '../../../../platform/admin/templates/InnovationTemplates/SelectInnovationFlowDialog';

const ChallengeInnovationFlowView: FC = () => {
  const { challengeNameId = '', spaceNameId = '' } = useUrlParams();

  const { data: spaceInnovationFlowTemplates } = useSpaceInnovationFlowTemplatesQuery({
    variables: { spaceId: spaceNameId },
  });
  const innovationFlowTemplates = spaceInnovationFlowTemplates?.space?.templates?.innovationFlowTemplates;
  const filteredInnovationFlowTemplates = innovationFlowTemplates?.filter(
    template => template.type === InnovationFlowType.Challenge
  );

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { spaceId: spaceNameId, challengeId: challengeNameId },
    skip: !spaceNameId || !challengeNameId,
  });
  const challenge = challengeProfile?.space?.challenge;
  const innovationFlowID = challenge?.innovationFlow?.id;

  const [updateChallengeInnovationFlowTemplate] = useUpdateInnovationFlowLifecycleTemplateMutation({
    refetchQueries: [refetchChallengeLifecycleQuery({ spaceId: spaceNameId, challengeId: challengeNameId })],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    if (innovationFlowID) {
      updateChallengeInnovationFlowTemplate({
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
      <ChallengeLifecycleContainer spaceNameId={spaceNameId} challengeNameId={challengeNameId}>
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
      </ChallengeLifecycleContainer>
    </Grid>
  );
};

export default ChallengeInnovationFlowView;
