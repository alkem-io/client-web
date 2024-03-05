import { Grid } from '@mui/material';
import React, { FC } from 'react';
import { useUrlParams } from '../../../../../core/routing/useUrlParams';
import {
  refetchInnovationFlowQuery,
  refetchInnovationFlowSettingsQuery,
  useChallengeProfileInfoQuery,
  useSpaceInnovationFlowTemplatesQuery,
  useUpdateInnovationFlowStatesFromTemplateMutation,
} from '../../../../../core/apollo/generated/apollo-hooks';
import Loading from '../../../../../core/ui/loading/Loading';
import UpdateInnovationFlow from '../../../../platform/admin/templates/InnovationTemplates/UpdateInnovationFlow';

import { SelectInnovationFlowFormValuesType } from '../../../../platform/admin/templates/InnovationTemplates/SelectInnovationFlowDialog';
import InnovationFlowContainer from '../../../../collaboration/InnovationFlow/containers/InnovationFlowContainer';

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
  const collaborationId = challenge?.collaboration?.id;
  const innovationFlowId = challenge?.collaboration?.innovationFlow?.id;


  const [updateChallengeInnovationFlow] = useUpdateInnovationFlowStatesFromTemplateMutation({
    refetchQueries: [
      refetchInnovationFlowQuery({ innovationFlowId: innovationFlowId! }),
      refetchInnovationFlowSettingsQuery({ collaborationId: collaborationId! }),
    ],
    awaitRefetchQueries: true,
  });

  const onSubmit = async (values: SelectInnovationFlowFormValuesType) => {
    if (innovationFlowId) {
      updateChallengeInnovationFlow({
        variables: {
          input: {
            innovationFlowID: innovationFlowId,
            inovationFlowTemplateID: values.innovationFlowTemplateID,
          },
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

export default ChallengeInnovationFlowView;
