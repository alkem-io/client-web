import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useSpace } from '../../../../space/SpaceContext/useSpace';
import InnovationFlowCollaborationToolsBlock from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowCollaborationToolsBlock';
import useInnovationFlowSettings from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { useSpaceCollaborationIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

export const SpaceLayoutSettingsEdit = () => {
  const { t } = useTranslation();
  const { space, loading: spaceLoading } = useSpace();
  const { data: collaborationData, loading: collaborationLoading } = useSpaceCollaborationIdQuery({
    variables: {
      spaceId: space.id,
    },
    skip: !space.id,
  });
  const collaborationId = collaborationData?.lookup.space?.collaboration.id;

  const { data, actions, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !collaborationId,
  });
  const { innovationFlow, callouts } = data;
  const loading = spaceLoading || collaborationLoading || state.loading;

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock>
        <PageContentBlockHeader title={t('pages.admin.generic.sections.layout.innovationFlowEditor')} />
        <Box overflow="auto">
          <InnovationFlowCollaborationToolsBlock
            callouts={callouts}
            loading={loading}
            innovationFlow={innovationFlow}
            onUpdateCurrentState={actions.updateInnovationFlowCurrentState}
            onUpdateFlowStateOrder={actions.updateInnovationFlowStateOrder}
            onUpdateCalloutFlowState={actions.updateCalloutFlowState}
            onCreateFlowState={(state, options) => actions.createState(state, options.after)}
            onEditFlowState={actions.editState}
            onDeleteFlowState={actions.deleteState}
            disableStateNumberChange
          />
        </Box>
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default SpaceLayoutSettingsEdit;
