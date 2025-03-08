import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import { useSpace } from '../../SpaceContext/useSpace';
import InnovationFlowCollaborationToolsBlock from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/InnovationFlowCollaborationToolsBlock';
import useInnovationFlowSettings from '@/domain/collaboration/InnovationFlow/InnovationFlowDialogs/useInnovationFlowSettings';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';

export const SpaceLayoutSettingsEdit = () => {
  const { collaborationId } = useSpace();

  const { data, actions, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !collaborationId,
  });
  const { innovationFlow, callouts } = data;

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock>
        {/* TODO: Translate */}
        <PageContentBlockHeader title="Set the tab names" />
        <InnovationFlowCollaborationToolsBlock
          callouts={callouts}
          loading={state.loading}
          innovationFlowStates={innovationFlow?.states}
          currentState={innovationFlow?.currentState.displayName}
          onUpdateCurrentState={actions.updateInnovationFlowCurrentState}
          onUpdateFlowStateOrder={actions.updateInnovationFlowStateOrder}
          onUpdateCalloutFlowState={actions.updateCalloutFlowState}
          onCreateFlowState={(state, options) => actions.createState(state, options.after)}
          onEditFlowState={actions.editState}
          onDeleteFlowState={actions.deleteState}
          disableStateNumberChange
        />
      </PageContentBlock>
    </PageContentColumn>
  );
};

export default SpaceLayoutSettingsEdit;
