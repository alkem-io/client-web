import { DialogContent, ListItemIcon, MenuItem, Theme, useMediaQuery } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
import PageContentBlockContextualMenu from '../../../../core/ui/content/PageContentBlockContextualMenu';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import ImportInnovationFlowDialog from './ImportInnovationFlow/ImportInnovationFlowDialog';
import ConfirmationDialog from '../../../../core/ui/dialogs/ConfirmationDialog';
import { CalloutGroupNameValuesMap } from '../../callout/CalloutsInContext/CalloutsGroup';

interface InnovationFlowSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  collaborationId: string | undefined;
  templatesSetId: string | undefined;
  filterCalloutGroups?: CalloutGroupNameValuesMap[];
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({
  open = false,
  onClose,
  collaborationId,
  templatesSetId,
  filterCalloutGroups = undefined,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { data, actions, authorization, state } = useInnovationFlowSettings({
    collaborationId,
    filterCalloutGroups,
    skip: !open,
  });
  const { innovationFlow, callouts } = data;

  const [importInnovationFlowConfirmDialogOpen, setImportInnovationFlowConfirmDialogOpen] = useState(false);
  const [importInnovationFlowDialogOpen, setImportInnovationFlowDialogOpen] = useState(false);

  const handleImportTemplate = async (templateId: string) => {
    await actions.importInnovationFlow(templateId);
    setImportInnovationFlowDialogOpen(false);
  };

  return (
    <>
      <DialogWithGrid open={open} columns={12} onClose={onClose} fullScreen={isMobile}>
        <DialogHeader
          icon={<InnovationFlowIcon />}
          title={t('components.innovationFlowSettings.title')}
          onClose={onClose}
          actions={
            <PageContentBlockContextualMenu>
              {({ closeMenu }) => {
                return (
                  <MenuItem
                    onClick={() => {
                      setImportInnovationFlowConfirmDialogOpen(true);
                      closeMenu();
                    }}
                  >
                    <ListItemIcon>
                      <InnovationFlowIcon />
                    </ListItemIcon>
                    {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.title')}
                  </MenuItem>
                );
              }}
            </PageContentBlockContextualMenu>
          }
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
              onCreateFlowState={(state, options) => actions.createState(state, options.after)}
              onEditFlowState={actions.editState}
              onDeleteFlowState={actions.deleteState}
            />
          </InnovationFlowProfileBlock>
        </DialogContent>
      </DialogWithGrid>
      <ConfirmationDialog
        actions={{
          onConfirm: () => {
            setImportInnovationFlowDialogOpen(true);
            setImportInnovationFlowConfirmDialogOpen(false);
          },
          onCancel: () => setImportInnovationFlowConfirmDialogOpen(false),
        }}
        options={{
          show: importInnovationFlowConfirmDialogOpen,
        }}
        entities={{
          titleId: 'components.innovationFlowSettings.stateEditor.selectDifferentFlow.confirmationDialog.title',
          content: (
            <WrapperMarkdown>
              {t('components.innovationFlowSettings.stateEditor.selectDifferentFlow.confirmationDialog.description')}
            </WrapperMarkdown>
          ),
          confirmButtonTextId: 'buttons.continue',
        }}
      />
      <ImportInnovationFlowDialog
        open={importInnovationFlowDialogOpen}
        templatesSetId={templatesSetId}
        onClose={() => setImportInnovationFlowDialogOpen(false)}
        handleImportTemplate={handleImportTemplate}
      />
    </>
  );
};

export default InnovationFlowSettingsDialog;
