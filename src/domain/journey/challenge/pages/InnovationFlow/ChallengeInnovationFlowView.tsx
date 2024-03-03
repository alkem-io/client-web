import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import {
  refetchChallengeInnovationFlowQuery,
  refetchInnovationFlowSettingsQuery,
  useChallengeProfileInfoQuery,
  useSpaceInnovationFlowTemplatesQuery,
} from '../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../core/ui/loading/Loading';
import UpdateInnovationFlow from '../../../../platform/admin/templates/InnovationTemplates/UpdateInnovationFlow';
import ChallengeLifecycleContainer from '../../containers/ChallengeLifecycleContainer';
import { SelectInnovationFlowFormValuesType } from '../../../../platform/admin/templates/InnovationTemplates/SelectInnovationFlowDialog';

const ChallengeInnovationFlowView: FC = () => {
  const { challengeNameId = '', spaceNameId = '' } = useUrlParams();

  const { data: spaceInnovationFlowTemplates } = useSpaceInnovationFlowTemplatesQuery({
    variables: { spaceId: spaceNameId },
  });
  const innovationFlowTemplates = spaceInnovationFlowTemplates?.space?.templates?.innovationFlowTemplates;

  const { data: challengeProfile } = useChallengeProfileInfoQuery({
    variables: { spaceId: spaceNameId, challengeId: challengeNameId },
    skip: !spaceNameId || !challengeNameId,
  });
  const challenge = challengeProfile?.space?.challenge;
  const innovationFlowId = challenge?.innovationFlow?.id || ''; // TODO
  const collaborationId = challenge?.collaboration?.id || ''; // TODO;

  const [updateChallengeInnovationFlowTemplate] = useUpdateInnovationFlowLifecycleTemplateMutation({
    refetchQueries: [
      refetchChallengeInnovationFlowQuery({ challengeId: challengeNameId }),
      refetchInnovationFlowSettingsQuery({
        innovationFlowId,
        collaborationId,
      }),
    ],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    const { innovationFlowTemplateID } = values;

    if (innovationFlowId) {
      updateChallengeInnovationFlowTemplate({
        variables: {
          input: {
            innovationFlowID: innovationFlowId,
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
      </ChallengeLifecycleContainer>
    </Grid>
  );
};

export default ChallengeInnovationFlowView;
