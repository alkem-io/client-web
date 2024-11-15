import { DialogContent, ListItemIcon, MenuItem, Theme, useMediaQuery } from '@mui/material';
import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
import PageContentBlockContextualMenu from '@/core/ui/content/PageContentBlockContextualMenu';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import ConfirmationDialog from '@/core/ui/dialogs/ConfirmationDialog';
import { CalloutGroupNameValuesMap } from '../../callout/CalloutsInContext/CalloutsGroup';
import ImportTemplatesDialog from '../../../templates/components/Dialogs/ImportTemplateDialog/ImportTemplatesDialog';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { LoadingButton } from '@mui/lab';
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt';
import { Identifiable } from '@/core/utils/Identifiable';
import ApplyCollaborationTemplateDialog from '../../../templates/components/Dialogs/ApplyCollaborationTemplateDialog';

interface InnovationFlowSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  collaborationId: string | undefined;
  filterCalloutGroups?: CalloutGroupNameValuesMap[];
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({
  open = false,
  onClose,
  collaborationId,
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
          <InnovationFlowProfileBlock
            innovationFlow={innovationFlow}
            loading={state.loading}
            onUpdate={actions.updateInnovationFlowProfile}
            canEdit={authorization.canEditInnovationFlow}
          >
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
