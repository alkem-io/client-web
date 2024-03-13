import { DialogContent } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock, { LAST_STATE } from './InnovationFlowCollaborationToolsBlock';
import { InnovationFlowState } from '../InnovationFlow';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { EditOutlined } from '@mui/icons-material';
import InnovationFlowStateForm from './InnovationFlowStateForm';

interface InnovationFlowSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  collaborationId: string | undefined;
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({
  open = false,
  onClose,
  collaborationId,
}) => {
  const { t } = useTranslation();

  const { data, actions, authorization, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !open,
  });
  const { innovationFlow, callouts } = data;

  // Dialogs for state management:
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [createStateAfter, setCreateStateAfter] = useState<string | undefined>(); // Stores the previous state to create a new state after it.
  const [editState, setEditState] = useState<InnovationFlowState | undefined>();
  const [deleteState, setDeleteState] = useState<string | undefined>();

  return (
    <>
      <DialogWithGrid open={open} columns={12} onClose={onClose}>
        <DialogHeader
          icon={<InnovationFlowIcon />}
          title={t('components.innovationFlowSettings.title')}
          onClose={onClose}
        />
        <DialogContent>
          <InnovationFlowProfileBlock
            innovationFlow={innovationFlow}
            loading={state.loading}
            onUpdate={actions.updateInnovationFlowProfile}
            canEdit={authorization.canEditInnovationFlow}
          >
            <InnovationFlowCollaborationToolsBlock
              callouts={callouts}
              innovationFlowStates={innovationFlow?.states}
              currentState={innovationFlow?.currentState.displayName}
              onUpdateCurrentState={actions.updateInnovationFlowCurrentState}
              onUpdateFlowStateOrder={actions.updateInnovationFlowStateOrder}
              onUpdateCalloutFlowState={actions.updateCalloutFlowState}
              onCreateStateAfter={state => {
                setCreateDialogOpen(true);
                if (state !== LAST_STATE) {
                  setCreateStateAfter(state);
                }
              }}
              onEditState={stateDisplayName => {
                const state = data.innovationFlow?.states.find(state => state.displayName === stateDisplayName);
                setEditState(state);
              }}
              onDeleteState={state => setDeleteState(state)}
            />
          </InnovationFlowProfileBlock>
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={createDialogOpen}>
        <DialogHeader
          icon={<EditOutlined />}
          title={t('components.innovationFlowSettings.stateEditor.createDialog.title')}
          onClose={() => {
            setCreateStateAfter(undefined);
            setCreateDialogOpen(false);
          }}
        />
        <DialogContent>
          <InnovationFlowStateForm
            forbiddenStateNames={innovationFlow?.states.map(state => state.displayName)}
            onSubmit={newState => {
              actions.createState(newState, createStateAfter);
              setCreateStateAfter(undefined);
              setCreateDialogOpen(false);
            }}
            onCancel={() => {
              setCreateStateAfter(undefined);
              setCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={Boolean(editState)}>
        <DialogHeader
          icon={<EditOutlined />}
          title={t('components.innovationFlowSettings.stateEditor.editDialog.title')}
          onClose={() => setEditState(undefined)}
        />
        <DialogContent>
          <InnovationFlowStateForm
            state={editState}
            forbiddenStateNames={innovationFlow?.states
              .filter(state => state.displayName !== editState?.displayName)
              .map(state => state.displayName)}
            onSubmit={newState => {
              actions.editState(editState!, newState);
              setEditState(undefined);
            }}
            onCancel={() => setEditState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <ConfirmationDialog
        actions={{
          onConfirm: () => {
            actions.deleteState(deleteState!);
            setDeleteState(undefined);
          },
          onCancel: () => setDeleteState(undefined),
        }}
        options={{
          show: Boolean(deleteState),
        }}
        entities={{
          titleId: 'components.innovationFlowSettings.stateEditor.deleteDialog.title',
          contentId: 'components.innovationFlowSettings.stateEditor.deleteDialog.text',
          confirmButtonTextId: 'buttons.delete',
        }}
      />
    </>
  );
};

export default InnovationFlowSettingsDialog;
