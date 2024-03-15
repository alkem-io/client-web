import { DialogContent } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
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

  // Dialogs for Flow States management:

  // Stores the previous flow state to create a new state after it. If undefined it will create the state at the end of the flow
  const [createFlowState, setCreateFlowState] = useState<
    { after: string; last: false } | { after?: never; last: true } | undefined
  >(undefined);
  const [editFlowState, setEditFlowState] = useState<InnovationFlowState | undefined>();
  const [deleteFlowState, setDeleteFlowState] = useState<string | undefined>();

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
              onCreateFlowState={createFlowStateOptions => {
                setCreateFlowState(createFlowStateOptions);
              }}
              onEditFlowState={stateDisplayName => {
                const state = data.innovationFlow?.states.find(state => state.displayName === stateDisplayName);
                setEditFlowState(state);
              }}
              onDeleteFlowState={state => setDeleteFlowState(state)}
            />
          </InnovationFlowProfileBlock>
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={Boolean(createFlowState)}>
        <DialogHeader
          icon={<EditOutlined />}
          title={t('components.innovationFlowSettings.stateEditor.createDialog.title')}
          onClose={() => setCreateFlowState(undefined)}
        />
        <DialogContent>
          <InnovationFlowStateForm
            forbiddenFlowStateNames={innovationFlow?.states.map(state => state.displayName)}
            onSubmit={async newState => {
              await actions.createState(newState, createFlowState?.after);
              setCreateFlowState(undefined);
            }}
            onCancel={() => setCreateFlowState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <DialogWithGrid open={Boolean(editFlowState)}>
        <DialogHeader
          icon={<EditOutlined />}
          title={t('components.innovationFlowSettings.stateEditor.editDialog.title')}
          onClose={() => setEditFlowState(undefined)}
        />
        <DialogContent>
          <InnovationFlowStateForm
            state={editFlowState}
            forbiddenFlowStateNames={innovationFlow?.states
              .filter(state => state.displayName !== editFlowState?.displayName)
              .map(state => state.displayName)}
            onSubmit={async newState => {
              await actions.editState(editFlowState!, newState);
              setEditFlowState(undefined);
            }}
            onCancel={() => setEditFlowState(undefined)}
          />
        </DialogContent>
      </DialogWithGrid>
      <ConfirmationDialog
        actions={{
          onConfirm: () => {
            actions.deleteState(deleteFlowState!);
            setDeleteFlowState(undefined);
          },
          onCancel: () => setDeleteFlowState(undefined),
        }}
        options={{
          show: Boolean(deleteFlowState),
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
