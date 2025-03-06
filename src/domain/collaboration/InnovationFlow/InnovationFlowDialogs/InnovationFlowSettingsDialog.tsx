import { DialogContent, ListItemIcon, MenuItem, Theme, useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
import PageContentBlockContextualMenu from '@/core/ui/content/PageContentBlockContextualMenu';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import ImportTemplatesDialog from '@/domain/templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Identifiable } from '@/core/utils/Identifiable';
import ApplyCollaborationTemplateDialog from '@/domain/templates/components/Dialogs/ApplyCollaborationTemplateDialog';

type InnovationFlowSettingsDialogProps = {
  open?: boolean;
  onClose: () => void;
  collaborationId: string | undefined;
};

const InnovationFlowSettingsDialog = ({
  open = false,
  onClose,
  collaborationId,
}: InnovationFlowSettingsDialogProps) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const { data, actions, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !open,
  });
  const { innovationFlow, callouts } = data;

  const [importInnovationFlowConfirmDialogOpen, setImportInnovationFlowConfirmDialogOpen] = useState(false);
  const [importInnovationFlowDialogOpen, setImportInnovationFlowDialogOpen] = useState(false);
  const [selectedTemplateToImport, setSelectedTemplateToImport] = useState<Identifiable>();

  const handleImportTemplate = async ({ id: templateId }: Identifiable, importCallouts: boolean) => {
    await actions.importCollaborationTemplate(templateId, importCallouts);
    setSelectedTemplateToImport(undefined);
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
          />
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
      <ApplyCollaborationTemplateDialog
        open={Boolean(selectedTemplateToImport)}
        onConfirm={addCallouts => handleImportTemplate(selectedTemplateToImport!, addCallouts)}
        onClose={() => setSelectedTemplateToImport(undefined)}
      />
      <ImportTemplatesDialog
        open={importInnovationFlowDialogOpen}
        templateType={TemplateType.Collaboration}
        onClose={() => setImportInnovationFlowDialogOpen(false)}
        onSelectTemplate={async templateId => setSelectedTemplateToImport(templateId)}
        enablePlatformTemplates
        actionButton={
          <LoadingButton startIcon={<SystemUpdateAltIcon />} variant="contained">
            {t('buttons.use')}
          </LoadingButton>
        }
      />
    </>
  );
};

export default InnovationFlowSettingsDialog;
